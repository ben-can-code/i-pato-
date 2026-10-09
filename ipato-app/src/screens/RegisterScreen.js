import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const ARC = width * 1.1;

const C = {
  darkGreen:   '#003d1f',
  deepGreen:   '#005c2e',
  midGreen:    '#00873f',
  brightGreen: '#00c853',
  mint:        '#BFE8DC',
  gold:        '#f0b429',
  white:       '#FFFFFF',
  darkText:    '#1a1a1a',
  midText:     '#4a6b5e',
  placeholder: '#7fb89e',
  inputBorder: '#a8d8be',
  inputBg:     '#eef8f3',
  error:       '#e53935',
  success:     '#00873f',
  warn:        '#f0b429',
};

// ── Validation helpers ──────────────────────────────────────────────

// Common weak passwords: years, months, keyboard patterns, dictionary words
const WEAK_PATTERNS = [
  // years 1900–2099
  /^(19|20)\d{2}$/,
  // months
  /^(january|february|march|april|may|june|july|august|september|october|november|december)\d*$/i,
  // short month abbreviations
  /^(jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\d*$/i,
  // keyboard walks
  /^(qwerty|asdfgh|zxcvbn|123456|654321|111111|000000|password|passwd|letmein|welcome|admin|iloveyou|monkey|dragon)\d*$/i,
  // repeating chars
  /^(.)\1{5,}$/,
  // sequential digits
  /^(0123|1234|2345|3456|4567|5678|6789|7890|9876|8765|7654|6543|5432|4321|3210)/,
];

function validateName(name) {
  if (!name.trim()) return 'Full name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name can only contain letters, spaces, hyphens or apostrophes.';
  return null;
}

function validateEmail(email) {
  if (!email.trim()) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return 'Password must contain at least one special character (e.g. @, #, !).';

  // Check weak patterns
  for (const pattern of WEAK_PATTERNS) {
    if (pattern.test(password)) {
      return 'Password is too easy to guess. Avoid years, months, or common words.';
    }
  }
  return null;
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  // penalise weak patterns
  for (const p of WEAK_PATTERNS) {
    if (p.test(password)) { score = Math.max(0, score - 3); break; }
  }

  if (score <= 2) return { score, label: 'Weak',   color: C.error };
  if (score <= 4) return { score, label: 'Fair',   color: C.warn  };
  return           { score, label: 'Strong', color: C.success };
}

// ── Component ───────────────────────────────────────────────────────

export default function RegisterScreen({ navigation }) {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,         setLoading]         = useState(false);
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);

  // per-field error messages — shown after user leaves the field
  const [errors, setErrors] = useState({});

  const emailRef   = useRef(null);
  const passRef    = useRef(null);
  const confirmRef = useRef(null);

  const strength = getPasswordStrength(password);

  const setError = (field, msg) =>
    setErrors(prev => ({ ...prev, [field]: msg }));

  // validate a single field on blur
  const onBlurField = (field) => {
    switch (field) {
      case 'name':    setError('name',    validateName(name));    break;
      case 'email':   setError('email',   validateEmail(email));  break;
      case 'password':setError('password',validatePassword(password)); break;
      case 'confirm':
        if (!confirmPassword) { setError('confirm', 'Please confirm your password.'); break; }
        if (password !== confirmPassword) { setError('confirm', 'Passwords do not match.'); break; }
        setError('confirm', null);
        break;
    }
  };

  const handleRegister = () => {
    const nameErr    = validateName(name);
    const emailErr   = validateEmail(email);
    const passErr    = validatePassword(password);
    const confirmErr = password !== confirmPassword ? 'Passwords do not match.' : null;

    setErrors({ name: nameErr, email: emailErr, password: passErr, confirm: confirmErr });

    if (nameErr || emailErr || passErr || confirmErr) {
      Alert.alert('Fix the errors', 'Please correct the highlighted fields before continuing.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('OTP', { email });
    }, 1200);
  };

  return (
    <View style={styles.root}>
      <View style={styles.bgShapes} pointerEvents="none">
        <View style={styles.arcTopRight} />
        <View style={styles.arcTopLeft} />
        <View style={styles.arcMint} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.logoBubble}>
              <Image source={require('../../assets/icon.png')} style={styles.logoImg} resizeMode="contain" />
            </View>
            <Text style={styles.appName}>I-PATO</Text>
            <Text style={styles.appTagline}>Create your account today</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSub}>Fill in your details to get started</Text>

            {/* FULL NAME */}
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={v => { setName(v); setError('name', null); }}
              placeholder="John Doe"
              placeholderTextColor={C.placeholder}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              blurOnSubmit={false}
              underlineColorAndroid="transparent"
              onBlur={() => onBlurField('name')}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            {/* EMAIL */}
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={v => { setEmail(v); setError('email', null); }}
              placeholder="you@example.com"
              placeholderTextColor={C.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              underlineColorAndroid="transparent"
              onBlur={() => onBlurField('email')}
              onSubmitEditing={() => passRef.current?.focus()}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            {/* PASSWORD */}
            <Text style={styles.label}>PASSWORD</Text>
            <View style={[styles.passwordRow, errors.password && styles.inputError]}>
              <TextInput
                ref={passRef}
                style={styles.passwordInput}
                value={password}
                onChangeText={v => { setPassword(v); setError('password', null); }}
                placeholder="Min. 8 characters"
                placeholderTextColor={C.placeholder}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="next"
                blurOnSubmit={false}
                underlineColorAndroid="transparent"
                onBlur={() => onBlurField('password')}
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.eyeIco}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Password strength bar */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBarBg}>
                  <View style={[
                    styles.strengthBarFill,
                    {
                      width: `${Math.min(100, (strength.score / 6) * 100)}%`,
                      backgroundColor: strength.color,
                    },
                  ]} />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Password rules hint */}
            <View style={styles.rulesBox}>
              <Text style={styles.ruleItem}>{/[A-Z]/.test(password) ? '+ ' : '- '} Uppercase letter</Text>
              <Text style={styles.ruleItem}>{/[a-z]/.test(password) ? '+ ' : '- '} Lowercase letter</Text>
              <Text style={styles.ruleItem}>{/[0-9]/.test(password) ? '+ ' : '- '} Number</Text>
              <Text style={styles.ruleItem}>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '+ ' : '- '} Special character</Text>
              <Text style={styles.ruleItem}>{password.length >= 8 ? '+ ' : '- '} At least 8 characters</Text>
            </View>

            {/* CONFIRM PASSWORD */}
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={[styles.passwordRow, errors.confirm && styles.inputError]}>
              <TextInput
                ref={confirmRef}
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={v => { setConfirmPassword(v); setError('confirm', null); }}
                placeholder="Repeat your password"
                placeholderTextColor={C.placeholder}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="done"
                blurOnSubmit={true}
                underlineColorAndroid="transparent"
                onBlur={() => onBlurField('confirm')}
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.eyeIco}>{showConfirm ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirm
              ? <Text style={styles.errorText}>⚠ {errors.confirm}</Text>
              : confirmPassword.length > 0 && password === confirmPassword
                ? <Text style={styles.successText}>✅ Passwords match</Text>
                : null
            }

            {/* SIGN UP */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.ctaWrap}
            >
              <LinearGradient
                colors={[C.midGreen, C.darkGreen]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.ctaBtn, loading && { opacity: 0.65 }]}
              >
                <Text style={styles.ctaText}>{loading ? 'Creating...' : 'SIGN UP'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?  </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: C.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flex: { flex: 1 },

  bgShapes: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  arcTopRight: {
    position: 'absolute', width: ARC, height: ARC, borderRadius: ARC / 2,
    backgroundColor: C.darkGreen, top: -ARC * 0.35, right: -ARC * 0.28,
  },
  arcTopLeft: {
    position: 'absolute', width: ARC * 0.85, height: ARC * 0.85,
    borderRadius: (ARC * 0.85) / 2, backgroundColor: C.midGreen,
    top: -ARC * 0.52, left: -ARC * 0.30, opacity: 0.75,
  },
  arcMint: {
    position: 'absolute', width: ARC * 1.3, height: ARC * 1.3,
    borderRadius: (ARC * 1.3) / 2, backgroundColor: C.brightGreen,
    top: -ARC * 0.84, left: -(ARC * 1.3 - width) / 2, opacity: 0.18,
  },

  scroll: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 8, marginTop: 2 },
  backBtn: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7, marginBottom: 6,
  },
  backText: { color: C.white, fontSize: 13, fontWeight: '700' },
  logoBubble: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.38)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6, elevation: 6,
  },
  logoImg: { width: 32, height: 32 },
  appName: {
    fontSize: 20, fontWeight: '900', color: C.gold,
    letterSpacing: 3, marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  appTagline: {
    fontSize: 11, color: '#fff', fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.30)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },

  card: {
    backgroundColor: C.white, borderRadius: 24, padding: 16,
    elevation: 12, borderWidth: 1, borderColor: C.mint,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: C.darkGreen, marginBottom: 2 },
  cardSub:   { fontSize: 11, color: C.midText, marginBottom: 10 },

  label: {
    fontSize: 10, fontWeight: '700', color: C.deepGreen,
    marginBottom: 4, marginTop: 10, letterSpacing: 0.7,
  },
  input: {
    height: 46, backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.inputBorder,
    paddingHorizontal: 14, fontSize: 14, color: C.darkText,
  },
  inputError: {
    borderColor: C.error, backgroundColor: '#fdecea',
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center', height: 46,
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.inputBorder, paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, fontSize: 14, color: C.darkText, height: 46, padding: 0 },
  eyeIco: { fontSize: 16, paddingLeft: 8 },

  errorText:   { color: C.error,   fontSize: 11, marginTop: 3, marginLeft: 2 },
  successText: { color: C.success, fontSize: 11, marginTop: 3, marginLeft: 2 },

  // strength bar
  strengthRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 2 },
  strengthBarBg: {
    flex: 1, height: 5, borderRadius: 3,
    backgroundColor: '#e0e0e0', marginRight: 8,
  },
  strengthBarFill: { height: 5, borderRadius: 3 },
  strengthLabel: { fontSize: 11, fontWeight: '700', width: 46 },

  // rules checklist
  rulesBox: {
    backgroundColor: '#f4faf6', borderRadius: 10, padding: 10,
    marginTop: 6, marginBottom: 2,
    borderWidth: 1, borderColor: C.mint,
  },
  ruleItem: { fontSize: 11, color: C.midText, marginBottom: 2 },

  ctaWrap: { borderRadius: 30, overflow: 'hidden', elevation: 8, marginTop: 16, marginBottom: 2 },
  ctaBtn:  { height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 30 },
  ctaText: { color: C.white, fontSize: 14, fontWeight: '900', letterSpacing: 2 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  footerText: { color: C.midText, fontSize: 12 },
  footerLink: { color: C.midGreen, fontSize: 12, fontWeight: '800' },
});
