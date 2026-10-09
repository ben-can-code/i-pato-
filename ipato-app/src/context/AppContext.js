import React, { createContext, useContext, useState, useCallback } from 'react';
import { analyzeTransaction } from '../utils/anomalyDetection';

const AppContext = createContext(null);

// ── Seed data ──────────────────────────────────────────────────────
const INITIAL_TRANSACTIONS = [
  { id: 't1', type: 'send',    recipient: 'James Mwangi',  amount: 1000,  status: 'COMPLETED', date: new Date(Date.now() - 86400000 * 7), note: 'Lunch' },
  { id: 't2', type: 'send',    recipient: 'Fatuma Ali',    amount: 500,   status: 'COMPLETED', date: new Date(Date.now() - 86400000 * 6), note: '' },
  { id: 't3', type: 'receive', recipient: 'M-Pesa top-up', amount: 2500,  status: 'COMPLETED', date: new Date(Date.now() - 86400000 * 5), note: '' },
  { id: 't4', type: 'send',    recipient: 'School Fees',   amount: 12000, status: 'COMPLETED', date: new Date(Date.now() - 86400000 * 4), note: 'Term 2' },
  { id: 't5', type: 'send',    recipient: 'James Mwangi',  amount: 2000,  status: 'COMPLETED', date: new Date(Date.now() - 86400000 * 3), note: '' },
  { id: 't6', type: 'bill',    recipient: 'Kenya Power',   amount: 3200,  status: 'COMPLETED', date: new Date(Date.now() - 86400000 * 2), note: 'Electricity' },
  { id: 't7', type: 'send',    recipient: 'Fatuma Ali',    amount: 800,   status: 'COMPLETED', date: new Date(Date.now() - 86400000 * 1), note: '' },
];

const INITIAL_BILLS = [
  { id: 'b1', name: 'Rent',        icon: '🏠', amount: 18000, dueDay: 1,  category: 'Housing',   autoPay: true,  lastPaid: null },
  { id: 'b2', name: 'Electricity', icon: '⚡', amount: 3200,  dueDay: 5,  category: 'Utilities', autoPay: false, lastPaid: new Date(Date.now() - 86400000 * 2) },
  { id: 'b3', name: 'Water',       icon: '💧', amount: 850,   dueDay: 8,  category: 'Utilities', autoPay: true,  lastPaid: null },
  { id: 'b4', name: 'School Fees', icon: '🎓', amount: 12000, dueDay: 3,  category: 'Education', autoPay: false, lastPaid: new Date(Date.now() - 86400000 * 4) },
  { id: 'b5', name: 'Internet',    icon: '📡', amount: 2500,  dueDay: 10, category: 'Utilities', autoPay: true,  lastPaid: null },
  { id: 'b6', name: 'Insurance',   icon: '🛡️', amount: 4500,  dueDay: 15, category: 'Insurance', autoPay: false, lastPaid: null },
];

const INITIAL_ALERTS = [
  { id: 'a1', title: 'Security alert', text: 'New device detected. Verify to keep your wallet secure.', level: 'High',     read: false, date: new Date() },
  { id: 'a2', title: 'Goal reached',   text: 'Your emergency fund is now 75% complete.',               level: 'Info',     read: false, date: new Date(Date.now() - 3600000) },
  { id: 'a3', title: 'Bill reminder',  text: 'Internet bill is due in 2 days.',                        level: 'Reminder', read: true,  date: new Date(Date.now() - 7200000) },
];

const INITIAL_LINKED_ACCOUNTS = [
  {
    id: 'la1', type: 'mpesa', label: 'M-Pesa Personal',
    number: '0712345678', icon: '📱', color: '#4CAF50',
    balance: 12500, status: 'active', primary: true,
    verified: true, addedAt: new Date(Date.now() - 86400000 * 30),
  },
];

const INITIAL_PROFILE = {
  name:            'Ben Mwangi',
  email:           'ben@ipato.app',
  phone:           '+254 712 345 678',
  avatar:          '👨🏾',
  verified:        true,
  plan:            'Premium',
  biometricFace:   false,
  biometricFinger: false,
  fraudAlerts:     true,
  privacyMode:     false,
};

// ── helpers ────────────────────────────────────────────────────────
export function maskNumber(num) {
  if (!num) return '';
  const s = String(num).replace(/\s/g, '');
  if (s.length <= 4) return s;
  return s.slice(0, 3) + '•'.repeat(Math.max(0, s.length - 6)) + s.slice(-3);
}

// ── Provider ───────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [balance,        setBalance]        = useState(184320);
  const [transactions,   setTransactions]   = useState(INITIAL_TRANSACTIONS);
  const [bills,          setBills]          = useState(INITIAL_BILLS);
  const [alerts,         setAlerts]         = useState(INITIAL_ALERTS);
  const [pendingTx,      setPendingTx]      = useState(null);
  const [linkedAccounts, setLinkedAccounts] = useState(INITIAL_LINKED_ACCOUNTS);
  const [profile,        setProfile]        = useState(INITIAL_PROFILE);

  // ── Send money ─────────────────────────────────────────────────
  const sendMoney = useCallback(({ recipient, amount, note }) => {
    const risk = analyzeTransaction({ recipient, amount, note }, transactions);
    const tx = {
      id: 't' + Date.now(), type: 'send', recipient, amount,
      note: note || '', date: new Date(),
      riskScore: risk.score, riskFlags: risk.flags,
      status: risk.score >= 70 ? 'PENDING_VERIFICATION' : 'COMPLETED',
    };
    if (tx.status === 'COMPLETED') {
      setBalance(b => b - amount);
      setTransactions(p => [tx, ...p]);
      addAlert('Transaction sent', `KSh ${amount.toLocaleString()} sent to ${recipient}.`, 'Info');
    } else {
      setPendingTx(tx);
      addAlert('⚠ Unusual transaction', `KSh ${amount.toLocaleString()} to ${recipient} flagged. Reason: ${risk.flags.join(', ')}.`, 'High');
    }
    return { tx, risk };
  }, [transactions]);

  const verifyPendingTx = useCallback((success) => {
    if (!pendingTx) return;
    if (success) {
      setBalance(b => b - pendingTx.amount);
      setTransactions(p => [{ ...pendingTx, status: 'COMPLETED' }, ...p]);
      addAlert('✅ Transaction verified', `KSh ${pendingTx.amount.toLocaleString()} to ${pendingTx.recipient} completed.`, 'Info');
    } else {
      setTransactions(p => [{ ...pendingTx, status: 'HELD' }, ...p]);
      addAlert('🔒 Transaction held', `KSh ${pendingTx.amount.toLocaleString()} to ${pendingTx.recipient} held.`, 'High');
    }
    setPendingTx(null);
  }, [pendingTx]);

  const payBill = useCallback((billId) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    setBalance(b => b - bill.amount);
    setBills(p => p.map(b => b.id === billId ? { ...b, lastPaid: new Date() } : b));
    setTransactions(p => [{ id: 't' + Date.now(), type: 'bill', recipient: bill.name, amount: bill.amount, note: bill.category, date: new Date(), status: 'COMPLETED' }, ...p]);
    addAlert(`${bill.icon} Bill paid`, `${bill.name} — KSh ${bill.amount.toLocaleString()} paid.`, 'Info');
  }, [bills]);

  const toggleAutoPay  = useCallback((id) => setBills(p => p.map(b => b.id === id ? { ...b, autoPay: !b.autoPay } : b)), []);
  const markAlertRead  = useCallback((id) => setAlerts(p => p.map(a => a.id === id ? { ...a, read: true } : a)), []);
  const markAllRead    = useCallback(() => setAlerts(p => p.map(a => ({ ...a, read: true }))), []);

  // ── Alert helper ───────────────────────────────────────────────
  function addAlert(title, text, level) {
    setAlerts(p => [{ id: 'a' + Date.now(), title, text, level, read: false, date: new Date() }, ...p]);
  }

  // ── Linked accounts ────────────────────────────────────────────
  const addLinkedAccount = useCallback((account) => {
    const exists = linkedAccounts.find(a => a.number === account.number && a.type === account.type);
    if (exists) return { error: 'This account is already linked to your profile.' };
    const newAcc = { ...account, id: 'la' + Date.now(), addedAt: new Date(), verified: false, status: 'pending' };
    setLinkedAccounts(p => [...p, newAcc]);
    addAlert('🔗 Account linked', `${account.label} (${maskNumber(account.number)}) added — verify to activate.`, 'Info');
    return { success: true, account: newAcc };
  }, [linkedAccounts]);

  const verifyLinkedAccount = useCallback((id) => {
    setLinkedAccounts(p => p.map(a => a.id === id ? { ...a, verified: true, status: 'active' } : a));
    addAlert('✅ Account verified', 'Your linked account has been verified and is now active.', 'Info');
  }, []);

  const removeLinkedAccount = useCallback((id) => {
    setLinkedAccounts(p => p.filter(a => a.id !== id));
    addAlert('🗑 Account removed', 'A linked account has been removed from your profile.', 'Info');
  }, []);

  const setPrimaryAccount = useCallback((id) => {
    setLinkedAccounts(p => p.map(a => ({ ...a, primary: a.id === id })));
  }, []);

  const renameLinkedAccount = useCallback((id, label) => {
    setLinkedAccounts(p => p.map(a => a.id === id ? { ...a, label } : a));
  }, []);

  const toggleAccountStatus = useCallback((id) => {
    setLinkedAccounts(p => p.map(a => a.id === id
      ? { ...a, status: a.status === 'active' ? 'disconnected' : 'active' }
      : a
    ));
  }, []);

  // ── Profile ────────────────────────────────────────────────────
  const updateProfile = useCallback((updates) => setProfile(p => ({ ...p, ...updates })), []);

  // ── Computed ───────────────────────────────────────────────────
  const unreadCount    = alerts.filter(a => !a.read).length;
  const totalLinkedBal = linkedAccounts
    .filter(a => a.status === 'active')
    .reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <AppContext.Provider value={{
      balance, transactions, bills, alerts, pendingTx,
      linkedAccounts, profile, unreadCount, totalLinkedBal,
      sendMoney, verifyPendingTx, payBill, toggleAutoPay,
      markAlertRead, markAllRead,
      addLinkedAccount, verifyLinkedAccount, removeLinkedAccount,
      setPrimaryAccount, renameLinkedAccount, toggleAccountStatus,
      updateProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
