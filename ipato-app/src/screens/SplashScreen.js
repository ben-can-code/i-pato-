import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primary, COLORS.aiAccent]}
      style={styles.container}
    >
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        <View style={styles.logoBox}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.logoText}>I-PATO</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.taglineContainer,
          { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.tagline}>Pay • Save • Grow with AI</Text>
        <View style={styles.dotRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: COLORS.primaryLight,
    top: -width * 0.4,
    right: -width * 0.3,
    opacity: 0.3,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: COLORS.accent,
    bottom: -width * 0.2,
    left: -width * 0.2,
    opacity: 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 3,
    borderColor: COLORS.accentSoft,
  },
  logoImage: {
    width: 92,
    height: 92,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
    marginTop: 14,
  },
  taglineContainer: {
    alignItems: 'center',
    gap: 16,
  },
  tagline: {
    color: COLORS.accentLight,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    opacity: 0.35,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: COLORS.accent,
  },
});
