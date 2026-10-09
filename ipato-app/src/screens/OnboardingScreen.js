import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Brand colors
const C = {
  darkGreen:    '#003d1f',
  deepGreen:    '#005c2e',
  midGreen:     '#00873f',
  brightGreen:  '#00c853',
  gold:         '#f0b429',
  goldLight:    '#ffe082',
  white:        '#ffffff',
  whiteFaint:   'rgba(255,255,255,0.18)',
  whiteMed:     'rgba(255,255,255,0.70)',
  grayDot:      'rgba(255,255,255,0.35)',
  black:        '#000000',
  panelTop:     'rgba(0,40,20,0.82)',
  panelBot:     'rgba(0,25,12,0.97)',
};

const FEATURES = [
  {
    icon: '🛡',
    title: 'Secure',
    subtitle: 'Your money\nis protected',
    iconBg: 'rgba(0,200,83,0.18)',
  },
  {
    icon: '🧠',
    title: 'Smart',
    subtitle: 'AI insights\nthat help you grow',
    iconBg: 'rgba(240,180,41,0.18)',
  },
  {
    icon: '⚡',
    title: 'Fast',
    subtitle: 'Instant payments\nanytime',
    iconBg: 'rgba(0,135,63,0.22)',
  },
];



export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const goNext = () => navigation.navigate('Auth');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Full-screen background image (untouched) ── */}
      <ImageBackground
        source={require('../../assets/onboarding-image.png')}
        resizeMode="cover"
        style={styles.bg}
      >
        {/* Subtle top scrim so Skip button is readable */}
        <LinearGradient
          colors={['rgba(0,0,0,0.28)', 'transparent']}
          style={styles.topScrim}
          pointerEvents="none"
        />

        {/* Skip button – top-right pill */}
        <TouchableOpacity style={styles.skipBtn} onPress={goNext} activeOpacity={0.8}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* ── Premium curved bottom panel ── */}
        <View style={styles.bottomPanel}>
          {/* Curved top edge */}
          <LinearGradient
            colors={[C.panelTop, C.panelBot]}
            style={[styles.panelGradient, { paddingBottom: 28 + insets.bottom }]}
          >
            {/* ── Three feature columns ── */}
            <View style={styles.featuresRow}>
              {FEATURES.map((f, i) => (
                <React.Fragment key={f.title}>
                  {/* Vertical divider (before 2nd and 3rd) */}
                  {i > 0 && <View style={styles.divider} />}

                  <View style={styles.featureCol}>
                    {/* Icon circle */}
                    <View style={[styles.iconCircle, { backgroundColor: f.iconBg }]}>
                      <Text style={styles.iconEmoji}>{f.icon}</Text>
                    </View>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* ── Get Started button ── */}
            <TouchableOpacity
              style={styles.ctaWrapper}
              onPress={goNext}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[C.gold, C.goldLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                <Text style={[styles.ctaText, styles.ctaTextGold]}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Sign in row ── */}
            <View style={styles.signinRow}>
              <Text style={styles.signinLabel}>I have an account? </Text>
              <TouchableOpacity onPress={goNext} activeOpacity={0.7}>
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </View>
  );
}

const PANEL_HEIGHT = height * 0.38;
const CURVE = 32;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.darkGreen,
  },

  /* Full-screen image */
  bg: {
    flex: 1,
    width,
    height,
  },

  /* Top gradient scrim */
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
  },

  /* Skip pill – top right */
  skipBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  skipText: {
    color: C.darkGreen,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* ── Bottom panel ── */
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    borderTopLeftRadius: CURVE,
    borderTopRightRadius: CURVE,
    overflow: 'hidden',
    // Premium shadow
    shadowColor: C.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 20,
  },
  panelGradient: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },

  /* Feature columns */
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  featureCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  divider: {
    width: 1,
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignSelf: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconEmoji: {
    fontSize: 22,
  },
  featureTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  featureSubtitle: {
    color: C.whiteMed,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },

  /* CTA button */
  ctaWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: C.darkGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaBtn: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  ctaText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  /* Sign in */
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  signinLabel: {
    color: C.whiteMed,
    fontSize: 13,
  },
  signinLink: {
    color: C.brightGreen,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
