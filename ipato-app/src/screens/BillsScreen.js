import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, StatusBar, Platform, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

const CATEGORY_COLORS = {
  Housing:   { bg: '#e8f5e9', border: '#a5d6a7', text: '#2e7d32' },
  Utilities: { bg: '#e3f2fd', border: '#90caf9', text: '#1565c0' },
  Education: { bg: '#fff8e1', border: '#ffe082', text: '#f57f17' },
  Insurance: { bg: '#fce4ec', border: '#f48fb1', text: '#880e4f' },
};

function getDaysUntilDue(dueDay) {
  const now   = new Date();
  const due   = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (due < now) due.setMonth(due.getMonth() + 1);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

function getDueLabel(dueDay, lastPaid) {
  const days = getDaysUntilDue(dueDay);
  if (lastPaid) {
    const paid = new Date(lastPaid);
    const now  = new Date();
    if (paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear()) {
      return { label: 'Paid this month', urgent: false, paid: true };
    }
  }
  if (days <= 2)  return { label: `Due in ${days} day${days === 1 ? '' : 's'}!`, urgent: true,  paid: false };
  if (days <= 7)  return { label: `Due in ${days} days`,                          urgent: false, paid: false };
  return               { label: `Due on ${dueDay}th`,                             urgent: false, paid: false };
}

export default function BillsScreen({ navigation }) {
  const { bills, balance, payBill, toggleAutoPay } = useApp();
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(bills.map(b => b.category))];

  const filtered = filter === 'All' ? bills : bills.filter(b => b.category === filter);

  const totalDue = bills.reduce((sum, b) => {
    const due = getDueLabel(b.dueDay, b.lastPaid);
    return due.paid ? sum : sum + b.amount;
  }, 0);

  const handlePay = (bill) => {
    const due = getDueLabel(bill.dueDay, bill.lastPaid);
    if (due.paid) { Alert.alert('Already paid', `${bill.name} has already been paid this month.`); return; }
    if (bill.amount > balance) { Alert.alert('Insufficient funds', `You need KSh ${bill.amount.toLocaleString()} but your balance is KSh ${balance.toLocaleString()}.`); return; }

    Alert.alert(
      `Pay ${bill.name}`,
      `Pay KSh ${bill.amount.toLocaleString()} for ${bill.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now', onPress: () => {
            payBill(bill.id);
            Alert.alert('✅ Paid!', `${bill.name} — KSh ${bill.amount.toLocaleString()} paid successfully.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={['#003d1f', '#005c2e']} style={styles.header}>
        <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 52 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bills & Payments</Text>
          <Text style={styles.headerSub}>Manage recurring bills and auto-pay</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>KSh {totalDue.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total due this month</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{bills.filter(b => b.autoPay).length}</Text>
            <Text style={styles.summaryLabel}>Auto-pay enabled</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>
              {bills.filter(b => getDueLabel(b.dueDay, b.lastPaid).paid).length}
            </Text>
            <Text style={styles.summaryLabel}>Paid this month</Text>
          </View>
        </View>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, filter === cat && styles.filterChipActive]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bills list */}
        {filtered.map(bill => {
          const due   = getDueLabel(bill.dueDay, bill.lastPaid);
          const color = CATEGORY_COLORS[bill.category] || CATEGORY_COLORS.Utilities;

          return (
            <View key={bill.id} style={[styles.billCard, due.urgent && styles.billCardUrgent]}>
              <View style={styles.billTop}>
                {/* Icon + info */}
                <View style={[styles.billIconWrap, { backgroundColor: color.bg, borderColor: color.border }]}>
                  <Text style={styles.billIcon}>{bill.icon}</Text>
                </View>
                <View style={styles.billInfo}>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={[styles.billCategory, { color: color.text }]}>{bill.category}</Text>
                  <Text style={[styles.billDue, due.urgent && styles.billDueUrgent]}>
                    {due.paid ? '✅ ' : due.urgent ? '⚠ ' : '🗓 '}{due.label}
                  </Text>
                </View>
                {/* Amount + pay */}
                <View style={styles.billRight}>
                  <Text style={styles.billAmount}>KSh {bill.amount.toLocaleString()}</Text>
                  <TouchableOpacity
                    style={[styles.payBtn, due.paid && styles.payBtnPaid]}
                    onPress={() => handlePay(bill)}
                  >
                    <Text style={[styles.payBtnText, due.paid && styles.payBtnTextPaid]}>
                      {due.paid ? 'Paid' : 'Pay'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Auto-pay toggle */}
              <View style={styles.autoPayRow}>
                <Text style={styles.autoPayLabel}>Auto-pay</Text>
                <Switch
                  value={bill.autoPay}
                  onValueChange={() => toggleAutoPay(bill.id)}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={bill.autoPay ? '#fff' : '#f4f4f4'}
                />
                <Text style={styles.autoPayNote}>
                  {bill.autoPay ? 'Will auto-pay on ' + bill.dueDay + 'th' : 'Manual payment'}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Auto-pay info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Auto-pay bills are processed automatically on their due date. Your balance must be sufficient or the payment will be skipped and you will be notified.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14,
  },
  backText:    { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },

  body: { padding: 16, paddingBottom: 40 },

  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  summaryItem:    { flex: 1, alignItems: 'center' },
  summaryValue:   { fontSize: 18, fontWeight: '800', color: COLORS.text },
  summaryLabel:   { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

  filterRow: { marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.white, borderWidth: 1.5,
    borderColor: COLORS.border, marginRight: 8,
  },
  filterChipActive:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText:        { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive:  { color: '#fff' },

  billCard: {
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  billCardUrgent: { borderColor: COLORS.warning, backgroundColor: '#fffde7' },
  billTop:     { flexDirection: 'row', alignItems: 'center' },
  billIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, marginRight: 12,
  },
  billIcon:        { fontSize: 22 },
  billInfo:        { flex: 1 },
  billName:        { fontSize: 15, fontWeight: '700', color: COLORS.text },
  billCategory:    { fontSize: 11, fontWeight: '600', marginTop: 1 },
  billDue:         { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  billDueUrgent:   { color: COLORS.warning, fontWeight: '700' },
  billRight:       { alignItems: 'flex-end' },
  billAmount:      { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  payBtn: {
    backgroundColor: COLORS.primary, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  payBtnPaid:     { backgroundColor: '#e8f5e9' },
  payBtnText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  payBtnTextPaid: { color: COLORS.success },
  autoPayRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  autoPayLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginRight: 8 },
  autoPayNote:  { fontSize: 12, color: COLORS.textSecondary, marginLeft: 8, flex: 1 },

  infoBox: {
    backgroundColor: '#e3f2fd', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#90caf9', marginTop: 4,
  },
  infoText: { fontSize: 12, color: '#1565c0', lineHeight: 18 },
});
