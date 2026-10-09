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
};

export default function LoginScreen({ navigation, onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const passwordRef = useRef(null);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <View style={styles.root}>
      {/* bg shapes */}
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
            <View style={styles.logoBubble}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>I-PATO</Text>
            <Text style={styles.appTagline}>Your smart money companion</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSub}>Login to your account to continue</Text>

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
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
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.passwordRow}>
              <TextInput
                ref={passwordRef}
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={C.placeholder}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                blurOnSubmit={true}
                underlineColorAndroid="transparent"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPass(v => !v)}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                style={styles.eyeBtn}
              >
                <Text>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
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
                <Text style={styles.ctaText}>{loading ? 'Signing in...' : 'LOG IN'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?  </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>Sign Up</Text>
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
    flex: 1,
    backgroundColor: C.white,
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

  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 20, marginTop: 6 },
  logoBubble: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.38)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, elevation: 6,
  },
  logoImg: { width: 38, height: 38 },
  appName: {
    fontSize: 22, fontWeight: '900', color: C.gold,
    letterSpacing: 4, marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  appTagline: {
    fontSize: 12, color: '#fff', fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.30)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },

  card: {
    backgroundColor: C.white, borderRadius: 24, padding: 20,
    elevation: 12, borderWidth: 1, borderColor: C.mint,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: C.darkGreen, marginBottom: 4 },
  cardSub:   { fontSize: 12, color: C.midText, marginBottom: 16 },

  label: {
    fontSize: 11, fontWeight: '700', color: C.deepGreen,
    marginBottom: 6, marginTop: 12, letterSpacing: 0.8,
  },
  input: {
    height: 48, backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.inputBorder,
    paddingHorizontal: 14, fontSize: 15, color: C.darkText,
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center', height: 48,
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.inputBorder, paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, fontSize: 15, color: C.darkText, height: 48, padding: 0 },
  eyeBtn: { paddingLeft: 10 },

  forgotBtn:  { alignSelf: 'flex-end', marginTop: 10, marginBottom: 22 },
  forgotText: { color: C.midGreen, fontSize: 12, fontWeight: '600' },

  ctaWrap: { borderRadius: 30, overflow: 'hidden', elevation: 9, marginBottom: 4 },
  ctaBtn:  { height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 30 },
  ctaText: { color: C.white, fontSize: 15, fontWeight: '900', letterSpacing: 2 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  footerText: { color: C.midText, fontSize: 13 },
  footerLink: { color: C.midGreen, fontSize: 13, fontWeight: '800' },
});
