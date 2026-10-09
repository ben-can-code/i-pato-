import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';

import HomeScreen                    from '../screens/HomeScreen';
import SearchScreen                  from '../screens/SearchScreen';
import ProfileScreen                 from '../screens/ProfileScreen';
import NotificationsScreen           from '../screens/NotificationsScreen';
import SendMoneyScreen               from '../screens/SendMoneyScreen';
import BillsScreen                   from '../screens/BillsScreen';
import TransactionVerificationScreen from '../screens/TransactionVerificationScreen';
import ChatbotScreen                 from '../screens/ChatbotScreen';
import LinkedAccountsScreen          from '../screens/LinkedAccountsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Home stack ─────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"                    component={HomeScreen} />
      <Stack.Screen name="SendMoney"               component={SendMoneyScreen} />
      <Stack.Screen name="Bills"                   component={BillsScreen} />
      <Stack.Screen name="TransactionVerification" component={TransactionVerificationScreen} />
      <Stack.Screen name="Chatbot"                 component={ChatbotScreen} />
    </Stack.Navigator>
  );
}

// ── Account stack — Profile + LinkedAccounts ───────────────────────
function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile"        component={ProfileScreen} />
      <Stack.Screen name="LinkedAccounts" component={LinkedAccountsScreen} />
    </Stack.Navigator>
  );
}

// ── Tab icon ───────────────────────────────────────────────────────
function TabIcon({ emoji, focused, badge }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>
        {emoji}
      </Text>
      {badge > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: '#e53935', borderRadius: 10,
          minWidth: 16, height: 16,
          alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main navigator ─────────────────────────────────────────────────
export default function MainTabNavigator() {
  const { unreadCount } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   '#00873f',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor:  '#c8e6d4',
          borderTopWidth:  1,
          height:          82,
          paddingBottom:   28,
          paddingTop:      6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AI"
        component={SearchScreen}
        options={{
          tabBarLabel: 'AI',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛡️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} badge={unreadCount} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
