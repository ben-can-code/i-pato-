import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => setIsLoggedIn(true);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        // ── Logged in — show main app ──
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        // ── Not logged in — show splash, onboarding, auth ──
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth">
            {(props) => <AuthNavigator {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}
