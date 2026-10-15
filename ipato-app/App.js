import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { AppProvider } from './src/context/AppContext';

// Suppress third-party deprecation warnings from react-navigation internals
LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
  'Warning: InteractionManager',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
