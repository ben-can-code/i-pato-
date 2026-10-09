import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ARC = width * 1.1;
const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

const C = {
  darkGreen:   '#003d1f',
  deepGreen:   '#005c2e',
  midGreen:    '#00873f',
  brightGreen: '#00c853',
  mint:        '#BFE8DC',
  gold:        '#f0b429',
  white:       '#FFFFFF',
  darkText:    '#17352B',
  midText:     '#4a6b5e',
  inputBorder: '#a8d8be',
  inputBg:     '#eef8f3',
  error:       '#e53935',
};

export default function OTPScreen({ navigation, route, onLogin }) {
  const insets = useSafeAreaInsets();
  const email = route?.params?.email || 'your email';

  const [otp, setOtp]           = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const [error, setError]       = useState('');

  const inputRefs = useRef(Array(OTP_LENGTH).fill(null).map(() => React.createRef()));

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-submit when all boxes filled
  useEffect(() => {
    if (otp.every(d => d !== '')) {
      handleVerify(otp.join(''));
    }
  }, [otp]);

  const handleChange = (text, index) => {
    setError('');
    // only allow digits
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // advance to next box
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // go back on backspace when box is empty
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.current?.focus();
    }
  };

  const handleVerify = (code) => {
    Keyboard.dismiss();
    setLoading(true);
    // TODO: replace with real Supabase / backend call
    setTimeout(() => {
      setLoading(false);
      if (code === '123456') {
        // success — call onLogin to switch to main app
        onLogin && onLogin();
      } else {
        setError('Invalid code. Please try again.');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.current?.focus();
      }
    }, 1200);
  };

  const handleResend = () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(RESEND_COUNTDOWN);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    inputRefs.current[0]?.current?.focus();
    // TODO: trigger resend API call here
    Alert.alert('Code Sent', `A new code has been sent to ${email}`);
  };

  const filledCount = otp.filter(d => d !== '').length;

  return (
    <View style={styles.root}>

      {/* curved bg — same as login/register */}
      <View style={styles.bgShapes} pointerEvents="none">
        <View style={styles.arcTopRight} />
        <View style={styles.arcTopLeft} />
        <View style={styles.arcMint} />
      </View>

      {/* Back */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 16 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={[styles.container, { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 32 }]}>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Text style={styles.iconEmoji}>📧</Text>
        </View>

        {/* Heading */}
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.sub}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        {/* OTP boxes */}
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
              onChangeText={text => handleChange(text, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
              caretHidden
            />
          ))}
        </View>

        {/* Error */}
        {error !== '' && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Progress hint */}
        <Text style={styles.progressText}>
          {filledCount}/{OTP_LENGTH} digits entered
        </Text>

        {/* Verify button */}
        <TouchableOpacity
          onPress={() => handleVerify(otp.join(''))}
          disabled={loading || filledCount < OTP_LENGTH}
          activeOpacity={0.85}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={[C.midGreen, C.darkGreen]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[
              styles.ctaBtn,
              (loading || filledCount < OTP_LENGTH) && { opacity: 0.55 },
            ]}
          >
            <Text style={styles.ctaText}>
              {loading ? 'Verifying...' : 'VERIFY EMAIL'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code?  </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend in <Text style={styles.resendTimerBold}>{countdown}s</Text>
            </Text>
          )}
        </View>

      </View>
    </View>
  );
}

const BOX_SIZE = (width - 48 - 5 * 10) / 6;   // 6 boxes with 10px gaps, 48px horizontal padding

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },

  bgShapes: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  arcTopRight: {
    position: 'absolute',
    width: ARC, height: ARC, borderRadius: ARC / 2,
    backgroundColor: C.darkGreen,
    top: -ARC * 0.35, right: -ARC * 0.28,
  },
  arcTopLeft: {
    position: 'absolute',
    width: ARC * 0.85, height: ARC * 0.85, borderRadius: (ARC * 0.85) / 2,
    backgroundColor: C.midGreen,
    top: -ARC * 0.52, left: -ARC * 0.30,
    opacity: 0.75,
  },
  arcMint: {
    position: 'absolute',
    width: ARC * 1.3, height: ARC * 1.3, borderRadius: (ARC * 1.3) / 2,
    backgroundColor: C.brightGreen,
    top: -ARC * 0.84, left: -(ARC * 1.3 - width) / 2,
    opacity: 0.18,
  },

  backBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  backText: { color: C.white, fontSize: 13, fontWeight: '700' },

  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  iconWrap: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: C.inputBg,
    borderWidth: 2, borderColor: C.mint,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  iconEmoji: { fontSize: 40 },

  title: {
    fontSize: 24, fontWeight: '900', color: C.darkGreen,
    marginBottom: 10, letterSpacing: 0.3,
  },
  sub: {
    fontSize: 14, color: C.midText, textAlign: 'center',
    lineHeight: 22, marginBottom: 36,
  },
  emailHighlight: {
    color: C.midGreen, fontWeight: '700',
  },

  /* OTP boxes */
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 10,
  },
  otpBox: {
    width: BOX_SIZE,
    height: BOX_SIZE * 1.15,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.inputBorder,
    backgroundColor: C.inputBg,
    fontSize: 22,
    fontWeight: '800',
    color: C.darkGreen,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: C.midGreen,
    backgroundColor: '#e0f5ea',
  },
  otpBoxError: {
    borderColor: C.error,
    backgroundColor: '#fdecea',
  },

  errorText: {
    color: C.error, fontSize: 13, fontWeight: '600',
    marginBottom: 6, textAlign: 'center',
  },
  progressText: {
    color: C.midText, fontSize: 12,
    marginBottom: 28,
  },

  /* CTA */
  ctaWrap: {
    width: '100%',
    borderRadius: 30, overflow: 'hidden',
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40, shadowRadius: 14, elevation: 10,
    marginBottom: 6,
  },
  ctaBtn: {
    paddingVertical: 16, alignItems: 'center', borderRadius: 30,
  },
  ctaText: {
    color: C.white, fontSize: 15, fontWeight: '900', letterSpacing: 2,
  },

  /* Resend */
  resendRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginTop: 20,
  },
  resendLabel: { color: C.midText, fontSize: 13 },
  resendLink: { color: C.midGreen, fontSize: 13, fontWeight: '800' },
  resendTimer: { color: C.midText, fontSize: 13 },
  resendTimerBold: { color: C.darkGreen, fontWeight: '800' },
});
