import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, StatusBar,
  Platform, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const RECENT_CONTACTS = [
  { name: 'James Mwangi',  phone: '0712 345 678', emoji: '👨🏾' },
  { name: 'Fatuma Ali',    phone: '0723 456 789', emoji: '👩🏽' },
  { name: 'Peter Kamau',   phone: '0734 567 890', emoji: '👨🏿' },
  { name: 'Grace Njeri',   phone: '0745 678 901', emoji: '👩🏾' },
];

export default function SendMoneyScreen({ navigation }) {
  const { balance, sendMoney } = useApp();

  const [recipient, setRecipient] = useState('');
  const [phone,     setPhone]     = useState('');
  const [amount,    setAmount]    = useState('');
  const [note,      setNote]      = useState('');
  const [loading,   setLoading]   = useState(false);

  const selectContact = (c) => {
    setRecipient(c.name);
    setPhone(c.phone);
  };

  const handleSend = () => {
    if (!recipient.trim()) { Alert.alert('Missing', 'Please enter a recipient name or phone number.'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { Alert.alert('Invalid amount', 'Please enter a valid amount.'); return; }
    if (amt > balance)    { Alert.alert('Insufficient funds', `Your balance is KSh ${balance.toLocaleString()}.`); return; }
    if (amt < 1)          { Alert.alert('Minimum', 'Minimum transaction is KSh 1.'); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const { tx, risk } = sendMoney({ recipient: recipient.trim(), amount: amt, note });

      if (tx.status === 'PENDING_VERIFICATION') {
        navigation.navigate('TransactionVerification');
      } else {
        Alert.alert(
          '✅ Sent!',
          `KSh ${amt.toLocaleString()} sent to ${recipient.trim()} successfully.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }, 800);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#003d1f', '#005c2e']} style={styles.header}>
        <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 52 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <Text style={styles.headerSub}>Balance: KSh {balance.toLocaleString()}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Recent contacts */}
          <Text style={styles.sectionLabel}>Recent contacts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactsRow}>
            {RECENT_CONTACTS.map(c => (
              <TouchableOpacity key={c.name} style={[styles.contactCard, recipient === c.name && styles.contactCardActive]} onPress={() => selectContact(c)}>
                <Text style={styles.contactEmoji}>{c.emoji}</Text>
                <Text style={styles.contactName}>{c.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.label}>RECIPIENT NAME / PHONE</Text>
            <TextInput
              style={styles.input}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Name or phone number"
              placeholderTextColor={COLORS.gray}
              autoCapitalize="words"
              underlineColorAndroid="transparent"
            />

            <Text style={styles.label}>AMOUNT (KSh)</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={COLORS.gray}
              keyboardType="numeric"
              underlineColorAndroid="transparent"
            />

            {/* Quick amount chips */}
            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map(q => (
                <TouchableOpacity key={q} style={[styles.chip, amount === String(q) && styles.chipActive]} onPress={() => setAmount(String(q))}>
                  <Text style={[styles.chipText, amount === String(q) && styles.chipTextActive]}>
                    {q >= 1000 ? `${q / 1000}K` : q}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>NOTE (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="What's this for?"
              placeholderTextColor={COLORS.gray}
              autoCapitalize="sentences"
              underlineColorAndroid="transparent"
            />

            {/* Risk hint */}
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>🛡 Transactions are screened by AI fraud detection before processing.</Text>
            </View>

            {/* Send button */}
            <TouchableOpacity onPress={handleSend} disabled={loading} activeOpacity={0.85} style={styles.ctaWrap}>
              <LinearGradient colors={['#00873f', '#003d1f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.ctaBtn, loading && { opacity: 0.6 }]}>
                <Text style={styles.ctaText}>{loading ? 'Checking...' : `Send KSh ${amount ? parseFloat(amount).toLocaleString() : '0'}`}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },

  header: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14,
  },
  backText:    { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  headerSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },

  body: { padding: 16, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textSecondary,
    letterSpacing: 0.8, marginBottom: 10, marginTop: 4,
  },
  contactsRow: { marginBottom: 16 },
  contactCard: {
    alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 14, padding: 12, marginRight: 10,
    borderWidth: 1.5, borderColor: COLORS.border, minWidth: 72,
  },
  contactCardActive: { borderColor: COLORS.primary, backgroundColor: '#eef8f3' },
  contactEmoji: { fontSize: 28, marginBottom: 4 },
  contactName:  { fontSize: 11, fontWeight: '700', color: COLORS.text },

  card: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 18, borderWidth: 1, borderColor: COLORS.border,
  },
  label: {
    fontSize: 10, fontWeight: '700', color: COLORS.primaryDark,
    marginBottom: 6, marginTop: 14, letterSpacing: 0.8,
  },
  input: {
    height: 48, backgroundColor: '#eef8f3', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#a8d8be',
    paddingHorizontal: 14, fontSize: 15, color: COLORS.text,
  },
  amountInput: { fontSize: 22, fontWeight: '800', color: COLORS.primaryDark },

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#eef8f3', borderWidth: 1.5, borderColor: '#a8d8be',
  },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
  chipTextActive: { color: '#fff' },

  hintBox: {
    backgroundColor: '#fff8e1', borderRadius: 10, padding: 10,
    marginTop: 14, borderWidth: 1, borderColor: '#ffe082',
  },
  hintText: { fontSize: 12, color: '#7a6000' },

  ctaWrap: { borderRadius: 30, overflow: 'hidden', elevation: 6, marginTop: 18 },
  ctaBtn:  { height: 52, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});
