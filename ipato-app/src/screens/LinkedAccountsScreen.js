import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, StatusBar, Platform, Switch, Modal, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, maskNumber } from '../context/AppContext';

const { width } = Dimensions.get('window');

const C = {
  darkGreen: '#003d1f', deepGreen: '#005c2e', midGreen: '#00873f',
  brightGreen: '#00c853', gold: '#f0b429', goldLight: '#ffe082',
  white: '#ffffff', offWhite: '#f4faf6', mint: '#BFE8DC',
  mintLight: '#e8f7f2', darkText: '#17352B', midText: '#4a6b5e',
  lightText: '#7fb89e', border: '#c8e6d4',
  danger: '#e53935', dangerSoft: '#fdecea',
  successSoft: '#e0f5ea', warnSoft: '#fff8e1',
};

const ACCOUNT_TYPES = [
  { type: 'mpesa',          label: 'M-Pesa',           icon: '📱', color: '#4CAF50', placeholder: 'e.g. 0712345678',   desc: 'Safaricom M-Pesa mobile money' },
  { type: 'mobile_money',   label: 'Mobile Money',     icon: '💳', color: '#2196F3', placeholder: 'e.g. 0722345678',   desc: 'Airtel Money, Telkom T-Kash' },
  { type: 'till',           label: 'Till Number',      icon: '🏪', color: '#FF9800', placeholder: 'e.g. 123456',       desc: 'Lipa Na M-Pesa Buy Goods' },
  { type: 'paybill',        label: 'PayBill',          icon: '🧾', color: '#9C27B0', placeholder: 'e.g. 247247',       desc: 'Lipa Na M-Pesa PayBill' },
  { type: 'biz_paybill',    label: 'Business PayBill', icon: '🏢', color: '#607D8B', placeholder: 'e.g. 300300',       desc: 'Business PayBill number' },
  { type: 'bank',           label: 'Bank Account',     icon: '🏦', color: '#795548', placeholder: 'e.g. 1234567890',   desc: 'Kenya commercial bank account' },
  { type: 'savings',        label: 'Savings / SACCO',  icon: '💰', color: '#009688', placeholder: 'e.g. 987654321',    desc: 'SACCO or savings account' },
];

const STATUS_STYLE = {
  active:       { bg: C.successSoft, color: C.midGreen,   label: 'Active'       },
  pending:      { bg: C.warnSoft,    color: C.gold,        label: 'Pending'      },
  disconnected: { bg: '#f5f5f5',     color: '#9e9e9e',     label: 'Disconnected' },
};

// ── OTP Verification Modal ─────────────────────────────────────────
function OTPModal({ visible, accountLabel, onVerify, onClose }) {
  const [code, setCode] = useState('');
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Verify Account</Text>
          <Text style={styles.modalSub}>Enter the OTP sent to verify{'\n'}<Text style={{ fontWeight: '800', color: C.darkGreen }}>{accountLabel}</Text></Text>
          <TextInput
            style={styles.modalInput}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="6-digit code"
            placeholderTextColor={C.lightText}
            textAlign="center"
            underlineColorAndroid="transparent"
          />
          <Text style={styles.modalHint}>Demo code: <Text style={{ fontWeight: '800' }}>123456</Text></Text>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalVerifyBtn, code.length < 6 && { opacity: 0.5 }]}
              disabled={code.length < 6}
              onPress={() => { onVerify(code); setCode(''); }}
            >
              <LinearGradient colors={[C.midGreen, C.darkGreen]} style={styles.modalVerifyGrad}>
                <Text style={styles.modalVerifyText}>Verify</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Rename Modal ───────────────────────────────────────────────────
function RenameModal({ visible, current, onRename, onClose }) {
  const [label, setLabel] = useState(current || '');
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Rename Account</Text>
          <TextInput
            style={styles.modalInput}
            value={label}
            onChangeText={setLabel}
            placeholder="Enter a nickname"
            placeholderTextColor={C.lightText}
            autoCapitalize="words"
            underlineColorAndroid="transparent"
          />
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalVerifyBtn, !label.trim() && { opacity: 0.5 }]}
              disabled={!label.trim()}
              onPress={() => { onRename(label.trim()); setLabel(''); }}
            >
              <LinearGradient colors={[C.midGreen, C.darkGreen]} style={styles.modalVerifyGrad}>
                <Text style={styles.modalVerifyText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function LinkedAccountsScreen({ navigation }) {
  const {
    linkedAccounts, addLinkedAccount, verifyLinkedAccount,
    removeLinkedAccount, setPrimaryAccount, renameLinkedAccount,
    toggleAccountStatus, totalLinkedBal,
  } = useApp();

  const [showAdd,     setShowAdd]     = useState(false);
  const [otpTarget,   setOtpTarget]   = useState(null);   // { id, label }
  const [renameTarget,setRenameTarget]= useState(null);   // { id, label }
  const [selType,     setSelType]     = useState(null);
  const [accNumber,   setAccNumber]   = useState('');
  const [accLabel,    setAccLabel]    = useState('');
  const [adding,      setAdding]      = useState(false);

  const selectedType = ACCOUNT_TYPES.find(t => t.type === selType);

  const handleAdd = () => {
    if (!selType)          { Alert.alert('Select type', 'Please select an account type.'); return; }
    if (!accNumber.trim()) { Alert.alert('Missing', 'Please enter the account number.'); return; }
    setAdding(true);
    setTimeout(() => {
      setAdding(false);
      const result = addLinkedAccount({
        type:    selType,
        label:   accLabel.trim() || selectedType.label,
        number:  accNumber.trim(),
        icon:    selectedType.icon,
        color:   selectedType.color,
        balance: 0,
        primary: linkedAccounts.length === 0,
      });
      if (result.error) { Alert.alert('Already linked', result.error); return; }
      setShowAdd(false);
      setSelType(null); setAccNumber(''); setAccLabel('');
      Alert.alert('Account added', 'Verify the account to activate it.');
    }, 1000);
  };

  const handleVerifyOtp = (code) => {
    if (code === '123456') {
      verifyLinkedAccount(otpTarget.id);
      setOtpTarget(null);
      Alert.alert('✅ Verified', 'Account is now active.');
    } else {
      Alert.alert('Wrong code', 'The code you entered is incorrect. Try again.');
    }
  };

  const handleRemove = (acc) => {
    Alert.alert(
      'Remove account',
      `Remove ${acc.label} (${maskNumber(acc.number)}) from your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeLinkedAccount(acc.id) },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[C.darkGreen, C.deepGreen, C.midGreen]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52 }]}
      >
        <View style={styles.headerArc} pointerEvents="none" />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Linked Accounts</Text>
        <Text style={styles.headerSub}>Manage all your payment accounts in one place</Text>

        {/* Total balance strip */}
        <View style={styles.balStrip}>
          <View style={styles.balItem}>
            <Text style={styles.balNum}>{linkedAccounts.length}</Text>
            <Text style={styles.balLbl}>Linked</Text>
          </View>
          <View style={styles.balDivider} />
          <View style={styles.balItem}>
            <Text style={styles.balNum}>{linkedAccounts.filter(a => a.status === 'active').length}</Text>
            <Text style={styles.balLbl}>Active</Text>
          </View>
          <View style={styles.balDivider} />
          <View style={styles.balItem}>
            <Text style={[styles.balNum, { color: C.goldLight }]}>KSh {totalLinkedBal.toLocaleString()}</Text>
            <Text style={styles.balLbl}>Combined</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── Add account button ── */}
        <TouchableOpacity onPress={() => setShowAdd(v => !v)} style={styles.addBtn} activeOpacity={0.85}>
          <LinearGradient colors={[C.gold, C.goldLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtnGrad}>
            <Text style={styles.addBtnIcon}>{showAdd ? '✕' : '+'}</Text>
            <Text style={styles.addBtnText}>{showAdd ? 'Cancel' : 'Link New Account'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Add account form ── */}
        {showAdd && (
          <View style={styles.addForm}>
            <Text style={styles.formSectionLabel}>SELECT ACCOUNT TYPE</Text>
            <View style={styles.typeGrid}>
              {ACCOUNT_TYPES.map(t => (
                <TouchableOpacity
                  key={t.type}
                  style={[styles.typeCard, selType === t.type && { borderColor: t.color, backgroundColor: t.color + '18' }]}
                  onPress={() => setSelType(t.type)}
                >
                  <Text style={styles.typeIcon}>{t.icon}</Text>
                  <Text style={[styles.typeLabel, selType === t.type && { color: t.color }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedType && (
              <>
                <Text style={styles.typeDesc}>{selectedType.desc}</Text>
                <Text style={styles.formLabel}>ACCOUNT NUMBER</Text>
                <TextInput
                  style={styles.formInput}
                  value={accNumber}
                  onChangeText={setAccNumber}
                  placeholder={selectedType.placeholder}
                  placeholderTextColor={C.lightText}
                  keyboardType={selType === 'mpesa' || selType === 'mobile_money' ? 'phone-pad' : 'numeric'}
                  underlineColorAndroid="transparent"
                />
                <Text style={styles.formLabel}>NICKNAME (OPTIONAL)</Text>
                <TextInput
                  style={styles.formInput}
                  value={accLabel}
                  onChangeText={setAccLabel}
                  placeholder={`e.g. My ${selectedType.label}`}
                  placeholderTextColor={C.lightText}
                  autoCapitalize="words"
                  underlineColorAndroid="transparent"
                />

                <View style={styles.securityNote}>
                  <Text style={styles.securityText}>
                    🔒 I-PATO uses official authorization APIs. We never ask for your PIN or password.
                  </Text>
                </View>

                <TouchableOpacity onPress={handleAdd} disabled={adding} style={styles.submitWrap}>
                  <LinearGradient colors={[C.midGreen, C.darkGreen]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.submitBtn, adding && { opacity: 0.6 }]}>
                    <Text style={styles.submitText}>{adding ? 'Linking...' : 'Link Account'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* ── Linked accounts list ── */}
        {linkedAccounts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔗</Text>
            <Text style={styles.emptyTitle}>No accounts linked</Text>
            <Text style={styles.emptyText}>Link your M-Pesa, Till Number, PayBill and other accounts to manage them all here.</Text>
          </View>
        ) : (
          linkedAccounts.map(acc => {
            const st  = STATUS_STYLE[acc.status] || STATUS_STYLE.pending;
            const typ = ACCOUNT_TYPES.find(t => t.type === acc.type);
            return (
              <View key={acc.id} style={[styles.accCard, acc.primary && styles.accCardPrimary]}>
                {acc.primary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>⭐ Primary</Text>
                  </View>
                )}
                <View style={styles.accTop}>
                  <View style={[styles.accIconWrap, { backgroundColor: (acc.color || '#4CAF50') + '22' }]}>
                    <Text style={styles.accIcon}>{acc.icon}</Text>
                  </View>
                  <View style={styles.accInfo}>
                    <Text style={styles.accLabel}>{acc.label}</Text>
                    <Text style={styles.accType}>{typ?.label || acc.type}</Text>
                    <Text style={styles.accNumber}>{maskNumber(acc.number)}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>

                {acc.balance > 0 && (
                  <View style={styles.accBalance}>
                    <Text style={styles.accBalLabel}>Balance</Text>
                    <Text style={styles.accBalValue}>KSh {acc.balance.toLocaleString()}</Text>
                  </View>
                )}

                {/* Action row */}
                <View style={styles.accActions}>
                  {!acc.verified && (
                    <TouchableOpacity style={styles.actionChip} onPress={() => setOtpTarget({ id: acc.id, label: acc.label })}>
                      <Text style={styles.actionChipText}>✓ Verify</Text>
                    </TouchableOpacity>
                  )}
                  {!acc.primary && acc.status === 'active' && (
                    <TouchableOpacity style={styles.actionChip} onPress={() => setPrimaryAccount(acc.id)}>
                      <Text style={styles.actionChipText}>⭐ Set Primary</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionChip} onPress={() => setRenameTarget({ id: acc.id, label: acc.label })}>
                    <Text style={styles.actionChipText}>✏ Rename</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionChip, { backgroundColor: acc.status === 'active' ? '#fff3e0' : C.successSoft }]} onPress={() => toggleAccountStatus(acc.id)}>
                    <Text style={[styles.actionChipText, { color: acc.status === 'active' ? '#e65100' : C.midGreen }]}>
                      {acc.status === 'active' ? '⏸ Disconnect' : '▶ Reconnect'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionChip, { backgroundColor: C.dangerSoft }]} onPress={() => handleRemove(acc)}>
                    <Text style={[styles.actionChipText, { color: C.danger }]}>🗑 Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Compliance note */}
        <View style={styles.complianceBox}>
          <Text style={styles.complianceText}>
            🛡 I-PATO links accounts using official payment provider APIs and authorization flows. Account numbers are masked in the interface. No PINs or passwords are ever stored. Each external account can only be linked to one I-PATO profile.
          </Text>
        </View>
      </ScrollView>

      {/* OTP Modal */}
      <OTPModal
        visible={!!otpTarget}
        accountLabel={otpTarget?.label}
        onVerify={handleVerifyOtp}
        onClose={() => setOtpTarget(null)}
      />

      {/* Rename Modal */}
      <RenameModal
        visible={!!renameTarget}
        current={renameTarget?.label}
        onRename={(label) => { renameLinkedAccount(renameTarget.id, label); setRenameTarget(null); }}
        onClose={() => setRenameTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4faf6' },

  header: {
    paddingHorizontal: 20, paddingBottom: 22,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  headerArc: {
    position: 'absolute', width: width * 1.3, height: width * 1.3,
    borderRadius: width * 0.65, backgroundColor: 'rgba(255,255,255,0.05)',
    top: -width * 0.75, right: -width * 0.4,
  },
  backBtn:     { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  backText:    { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  headerSub:   { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginBottom: 16 },
  balStrip:    { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: 12 },
  balItem:     { flex: 1, alignItems: 'center' },
  balNum:      { color: C.goldLight, fontSize: 15, fontWeight: '900' },
  balLbl:      { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 2 },
  balDivider:  { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  body: { padding: 16, paddingBottom: 40 },

  addBtn:     { borderRadius: 30, overflow: 'hidden', marginBottom: 14, elevation: 4 },
  addBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  addBtnIcon: { fontSize: 20, color: C.darkGreen, fontWeight: '900' },
  addBtnText: { fontSize: 15, fontWeight: '900', color: C.darkGreen },

  addForm: {
    backgroundColor: C.white, borderRadius: 20, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: C.border,
  },
  formSectionLabel: { fontSize: 10, fontWeight: '700', color: C.midText, letterSpacing: 1, marginBottom: 12 },
  typeGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  typeCard:   {
    width: (width - 32 - 36 - 8) / 3,
    backgroundColor: C.offWhite, borderRadius: 14, padding: 10,
    alignItems: 'center', borderWidth: 1.5, borderColor: C.border,
  },
  typeIcon:   { fontSize: 22, marginBottom: 4 },
  typeLabel:  { fontSize: 10, fontWeight: '700', color: C.midText, textAlign: 'center' },
  typeDesc:   { fontSize: 12, color: C.midText, marginBottom: 14, fontStyle: 'italic' },
  formLabel:  { fontSize: 10, fontWeight: '700', color: C.deepGreen, letterSpacing: 0.8, marginBottom: 6, marginTop: 12 },
  formInput:  { height: 46, backgroundColor: '#eef8f3', borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, fontSize: 14, color: C.darkText },
  securityNote: { backgroundColor: '#e8f5e9', borderRadius: 10, padding: 10, marginTop: 14, borderWidth: 1, borderColor: '#a5d6a7' },
  securityText: { fontSize: 11, color: '#2e7d32', lineHeight: 17 },
  submitWrap: { borderRadius: 30, overflow: 'hidden', marginTop: 14, elevation: 6 },
  submitBtn:  { height: 48, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

  emptyWrap:  { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: C.darkText, marginBottom: 6 },
  emptyText:  { color: C.midText, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  accCard: {
    backgroundColor: C.white, borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  accCardPrimary: { borderColor: C.gold, borderWidth: 2 },
  primaryBadge:   { alignSelf: 'flex-start', backgroundColor: '#fff8e1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10, borderWidth: 1, borderColor: C.gold },
  primaryBadgeText:{ fontSize: 11, color: C.gold, fontWeight: '800' },
  accTop:       { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  accIconWrap:  { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  accIcon:      { fontSize: 22 },
  accInfo:      { flex: 1 },
  accLabel:     { fontSize: 14, fontWeight: '800', color: C.darkText },
  accType:      { fontSize: 11, color: C.midText, marginTop: 1 },
  accNumber:    { fontSize: 12, color: C.lightText, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  statusPill:   { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  accBalance:   { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.mintLight, borderRadius: 10, padding: 10, marginBottom: 10 },
  accBalLabel:  { fontSize: 12, color: C.midText },
  accBalValue:  { fontSize: 13, fontWeight: '800', color: C.darkGreen },
  accActions:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionChip:   { backgroundColor: C.mintLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  actionChipText:{ fontSize: 11, fontWeight: '700', color: C.midGreen },

  complianceBox: { backgroundColor: C.mintLight, borderRadius: 14, padding: 14, marginTop: 4, borderWidth: 1, borderColor: C.mint },
  complianceText:{ fontSize: 11, color: C.midText, lineHeight: 17 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 },
  modalTitle:   { fontSize: 18, fontWeight: '900', color: C.darkText, marginBottom: 6 },
  modalSub:     { fontSize: 13, color: C.midText, marginBottom: 20, lineHeight: 20 },
  modalHint:    { fontSize: 12, color: C.midText, textAlign: 'center', marginTop: 8, marginBottom: 4 },
  modalInput:   { height: 52, backgroundColor: '#eef8f3', borderRadius: 14, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, fontSize: 18, color: C.darkText, textAlign: 'center', letterSpacing: 4 },
  modalBtns:    { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancelBtn:  { flex: 1, height: 48, borderRadius: 30, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: C.midText },
  modalVerifyBtn:  { flex: 2, borderRadius: 30, overflow: 'hidden' },
  modalVerifyGrad: { height: 48, alignItems: 'center', justifyContent: 'center' },
  modalVerifyText: { color: '#fff', fontSize: 14, fontWeight: '900' },
});
