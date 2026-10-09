import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, StatusBar, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

const OTP_LENGTH      = 6;
const RESEND_SECONDS  = 60;
const MAX_ATTEMPTS    = 3;
const MOCK_CODE       = '287461';

export default function TransactionVerificationScreen({ navigation }) {
  const { pendingTx, verifyPendingTx } = useApp();

  const [otp,         setOtp]         = useState(Array(OTP_LENGTH).fill(''));
  const [loading,     setLoading]     = useState(false);
  const [attempts,    setAttempts]    = useState(0);
  const [countdown,   setCountdown]   = useState(RESEND_SECONDS);
  const [canResend,   setCanResend]   = useState(false);
  const [error,       setError]       = useState('');
  const [captureNote, setCaptureNote] = useState('');

  const inputRefs = useRef(Array(OTP_LENGTH).fill(null).map(() => React.createRef()));

  // Simulate anomaly capture + email on mount
  useEffect(() => {
    if (pendingTx) {
      simulateAnomalyCapture(pendingTx);
    }
  }, []);

  const simulateAnomalyCapture = (tx) => {
    // In production: use expo-camera to capture a photo, then send via email API
    // Here we simulate the action and show a confirmation note
    const timestamp = new Date().toLocaleString();
    const reportMsg =
      `⚠ ANOMALY DETECTED\n` +
      `Time: ${timestamp}\n` +
      `Recipient: ${tx.recipient}\n` +
      `Amount: KSh ${tx.amount.toLocaleString()}\n` +
      `Risk Score: ${tx.riskScore}/100\n` +
      `Flags: ${tx.riskFlags?.join(', ')}\n` +
      `Status: PENDING_VERIFICATION\n\n` +
      `📷 Device snapshot captured and flagged.\n` +
      `📧 Security report sent to account email.`;
    setCaptureNote(reportMsg);
  };

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-submit when all boxes filled
  useEffect(() => {
    if (otp.every(d => d !== '')) handleVerify(otp.join(''));
  }, [otp]);

  // If no pending transaction redirect back
  useEffect(() => {
    if (!pendingTx) navigation.goBack();
  }, [pendingTx]);

  const handleChange = (text, index) => {
    setError('');
    const digit  = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp    = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.current?.focus();
    }
  };

  const handleVerify = (code) => {
    if (loading) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (code === MOCK_CODE) {
        verifyPendingTx(true);
        Alert.alert(
          '✅ Verified!',
          `KSh ${pendingTx?.amount.toLocaleString()} to ${pendingTx?.recipient} has been completed.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      } else if (newAttempts >= MAX_ATTEMPTS) {
        verifyPendingTx(false);
        Alert.alert(
          '🔒 Transaction Held',
          'Too many failed attempts. The transaction has been placed on hold for your security.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        setError(`Incorrect code. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} remaining.`);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.current?.focus();
      }
    }, 1000);
  };

  const handleResend = () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setAttempts(0);
    inputRefs.current[0]?.current?.focus();
    Alert.alert('Code Sent', 'A new verification code has been sent.');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Transaction',
      'Are you sure you want to cancel this transaction? It will be held and not processed.',
      [
        { text: 'Keep Trying', style: 'cancel' },
        { text: 'Cancel Transaction', style: 'destructive', onPress: () => {
          verifyPendingTx(false);
          navigation.navigate('Home');
        }},
      ]
    );
  };

  if (!pendingTx) return null;

  const filledCount = otp.filter(d => d !== '').length;
  const riskColor   = pendingTx.riskScore >= 85 ? COLORS.danger : COLORS.warning;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#7f0000', '#b71c1c']} style={styles.header}>
        <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 52 }}>
          <Text style={styles.warningBadge}>⚠ HIGH-RISK TRANSACTION</Text>
          <Text style={styles.headerTitle}>Additional Verification Required</Text>
          <Text style={styles.headerSub}>For your security, please verify this transaction</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Transaction details */}
        <View style={styles.txCard}>
          <Text style={styles.txLabel}>TRANSACTION DETAILS</Text>
          <View style={styles.txRow}>
            <Text style={styles.txKey}>Recipient</Text>
            <Text style={styles.txVal}>{pendingTx.recipient}</Text>
          </View>
          <View style={styles.txRow}>
            <Text style={styles.txKey}>Amount</Text>
            <Text style={[styles.txVal, styles.txAmount]}>KSh {pendingTx.amount.toLocaleString()}</Text>
          </View>
          {pendingTx.note ? (
            <View style={styles.txRow}>
              <Text style={styles.txKey}>Note</Text>
              <Text style={styles.txVal}>{pendingTx.note}</Text>
            </View>
          ) : null}
          <View style={styles.txRow}>
            <Text style={styles.txKey}>Risk score</Text>
            <Text style={[styles.txVal, { color: riskColor, fontWeight: '800' }]}>
              {pendingTx.riskScore}/100
            </Text>
          </View>
        </View>

        {/* Flags */}
        {pendingTx.riskFlags?.length > 0 && (
          <View style={styles.flagsCard}>
            <Text style={styles.flagsTitle}>🚨 Why this was flagged:</Text>
            {pendingTx.riskFlags.map((flag, i) => (
              <Text key={i} style={styles.flagItem}>• {flag}</Text>
            ))}
          </View>
        )}

        {/* Anomaly capture report */}
        {captureNote !== '' && (
          <View style={styles.captureCard}>
            <Text style={styles.captureTitle}>📷 Anomaly Report Captured</Text>
            <Text style={styles.captureText}>{captureNote}</Text>
          </View>
        )}

        {/* OTP entry */}
        <View style={styles.otpCard}>
          <Text style={styles.otpTitle}>Enter Verification Code</Text>
          <Text style={styles.otpSub}>
            A 6-digit code has been sent to your registered email/phone.{'\n'}
            <Text style={styles.mockHint}>(Demo code: {MOCK_CODE})</Text>
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={inputRefs.current[i]}
                style={[
                  styles.otpBox,
                  digit !== '' && styles.otpBoxFilled,
                  error !== '' && styles.otpBoxError,
                ]}
                value={digit}
                onChangeText={t => handleChange(t, i)}
                onKeyPress={e => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
                underlineColorAndroid="transparent"
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.progressText}>{filledCount}/{OTP_LENGTH} digits entered</Text>

          {/* Attempts warning */}
          {attempts > 0 && (
            <View style={styles.attemptsWarn}>
              <Text style={styles.attemptsText}>
                ⚠ {attempts}/{MAX_ATTEMPTS} failed attempt{attempts > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Verify button */}
          <TouchableOpacity
            onPress={() => handleVerify(otp.join(''))}
            disabled={loading || filledCount < OTP_LENGTH}
            activeOpacity={0.85}
            style={styles.ctaWrap}
          >
            <LinearGradient
              colors={['#00873f', '#003d1f']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.ctaBtn, (loading || filledCount < OTP_LENGTH) && { opacity: 0.5 }]}
            >
              <Text style={styles.ctaText}>{loading ? 'Verifying...' : 'VERIFY & SEND'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code?  </Text>
            {canResend
              ? <TouchableOpacity onPress={handleResend}><Text style={styles.resendLink}>Resend</Text></TouchableOpacity>
              : <Text style={styles.resendTimer}>Resend in <Text style={{ fontWeight: '800' }}>{countdown}s</Text></Text>
            }
          </View>
        </View>

        {/* Cancel */}
        <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel Transaction</Text>
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your money has NOT been sent yet. It will only be transferred after successful verification.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const BOX = 44;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: { paddingHorizontal: 20, paddingBottom: 24 },
  warningBadge: {
    color: '#fff', fontWeight: '900', fontSize: 11,
    letterSpacing: 1.5, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },

  body: { padding: 16, paddingBottom: 40 },

  captureCard: {
    backgroundColor: '#e8eaf6', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#9fa8da', marginBottom: 12,
  },
  captureTitle: { fontSize: 13, fontWeight: '800', color: '#283593', marginBottom: 6 },
  captureText:  { fontSize: 11, color: '#283593', lineHeight: 17, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  txCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  txLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textSecondary,
    letterSpacing: 0.8, marginBottom: 10,
  },
  txRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: COLORS.border },
  txKey:   { fontSize: 13, color: COLORS.textSecondary },
  txVal:   { fontSize: 13, fontWeight: '700', color: COLORS.text },
  txAmount:{ fontSize: 16, color: COLORS.danger },

  flagsCard: {
    backgroundColor: '#fff3e0', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#ffcc02', marginBottom: 12,
  },
  flagsTitle: { fontSize: 13, fontWeight: '800', color: '#e65100', marginBottom: 8 },
  flagItem:   { fontSize: 13, color: '#bf360c', marginBottom: 4, lineHeight: 18 },

  otpCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
    alignItems: 'center',
  },
  otpTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  otpSub:   { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  mockHint: { color: COLORS.primary, fontWeight: '700' },

  otpRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  otpBox: {
    width: BOX, height: BOX * 1.2, borderRadius: 12,
    borderWidth: 2, borderColor: '#a8d8be',
    backgroundColor: '#eef8f3', fontSize: 20, fontWeight: '800',
    color: COLORS.text, textAlign: 'center',
  },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: '#e0f5ea' },
  otpBoxError:  { borderColor: COLORS.danger,  backgroundColor: '#fdecea' },

  errorText:    { color: COLORS.danger, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  progressText: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 10 },

  attemptsWarn: {
    backgroundColor: '#fff3e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.warning, marginBottom: 10,
  },
  attemptsText: { color: '#e65100', fontSize: 12, fontWeight: '700' },

  ctaWrap: { width: '100%', borderRadius: 30, overflow: 'hidden', elevation: 6, marginBottom: 4 },
  ctaBtn:  { height: 50, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 2 },

  resendRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  resendLabel: { color: COLORS.textSecondary, fontSize: 13 },
  resendLink:  { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  resendTimer: { color: COLORS.textSecondary, fontSize: 13 },

  cancelBtn: {
    borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: 14,
    paddingVertical: 12, alignItems: 'center', marginBottom: 14,
  },
  cancelText: { color: COLORS.danger, fontSize: 14, fontWeight: '700' },

  securityNote: {
    backgroundColor: '#e8f5e9', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#a5d6a7',
  },
  securityText: { fontSize: 12, color: '#2e7d32', lineHeight: 18 },
});
