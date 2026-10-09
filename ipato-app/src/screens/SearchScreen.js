import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const C = {
  darkGreen: '#003d1f', deepGreen: '#005c2e', midGreen: '#00873f',
  brightGreen: '#00c853', gold: '#f0b429', goldLight: '#ffe082',
  white: '#ffffff', offWhite: '#f4faf6', mint: '#BFE8DC',
  mintLight: '#e8f7f2', darkText: '#17352B', midText: '#4a6b5e',
  lightText: '#7fb89e', border: '#c8e6d4', aiBlue: '#00c2ff',
  aiSoft: '#e3f8ff', warnSoft: '#fff8e1', successSoft: '#e0f5ea',
};

const INSIGHTS = [
  { icon: '🛡', title: 'Fraud Detection',      text: '3 suspicious attempts blocked today.',          color: C.midGreen,  bg: C.successSoft },
  { icon: '📊', title: 'Predictive Budgeting', text: 'You may exceed transport spend by KSh 2,300.', color: C.gold,      bg: C.warnSoft    },
  { icon: '💚', title: 'Financial Health',     text: 'Savings discipline improved by 12%.',           color: C.midGreen,  bg: C.mintLight   },
  { icon: '🤖', title: 'Behavioural AI',       text: 'Your interaction pattern is verified continuously for secure access.', color: C.aiBlue, bg: C.aiSoft },
  { icon: '⚡', title: 'Real-time Scoring',    text: 'Every transaction scored against 47 risk signals.', color: C.deepGreen, bg: C.successSoft },
];

export default function SearchScreen({ navigation }) {
  const { transactions, alerts } = useApp();
  const [query, setQuery] = useState('');

  const filtered = INSIGHTS.filter(i =>
    i.title.toLowerCase().includes(query.toLowerCase()) ||
    i.text.toLowerCase().includes(query.toLowerCase())
  );

  const totalFlagged = transactions.filter(t => t.status === 'PENDING_VERIFICATION' || t.status === 'HELD').length;
  const highAlerts   = alerts.filter(a => a.level === 'High' && !a.read).length;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[C.darkGreen, C.deepGreen, C.midGreen]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 54 }]}
      >
        <View style={styles.headerArc} pointerEvents="none" />
        <Text style={styles.headerTitle}>AI Intelligence</Text>
        <Text style={styles.headerSub}>Smart security tools protecting your money</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{transactions.length}</Text>
            <Text style={styles.statLbl}>Transactions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, totalFlagged > 0 && { color: C.gold }]}>{totalFlagged}</Text>
            <Text style={styles.statLbl}>Flagged</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, highAlerts > 0 && { color: '#ff6b6b' }]}>{highAlerts}</Text>
            <Text style={styles.statLbl}>High Alerts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: C.brightGreen }]}>94%</Text>
            <Text style={styles.statLbl}>AI Score</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIco}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search AI insights..."
            placeholderTextColor={C.lightText}
            value={query}
            onChangeText={setQuery}
            underlineColorAndroid="transparent"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Chat AI banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Chatbot')}
        >
          <LinearGradient
            colors={[C.darkGreen, C.deepGreen]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.chatBanner}
          >
            <Text style={styles.chatBannerIcon}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatBannerTitle}>Chat with Pato AI</Text>
              <Text style={styles.chatBannerSub}>Ask anything about your finances</Text>
            </View>
            <Text style={styles.chatBannerArrow}>›</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Insight cards */}
        <Text style={styles.sectionLabel}>AI INSIGHTS</Text>
        {filtered.map(item => (
          <View key={item.title} style={[styles.insightCard, { borderLeftColor: item.color }]}>
            <View style={[styles.insightIcon, { backgroundColor: item.bg }]}>
              <Text style={styles.insightIconText}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.insightTitle, { color: item.color }]}>{item.title}</Text>
              <Text style={styles.insightText}>{item.text}</Text>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No results for "{query}"</Text>
          </View>
        )}

        {/* Risk model card */}
        <View style={styles.riskCard}>
          <LinearGradient
            colors={[C.darkGreen, C.deepGreen]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.riskGrad}
          >
            <Text style={styles.riskTitle}>Risk Model</Text>
            <Text style={styles.riskSub}>Signals monitored per transaction</Text>
            <View style={styles.riskGrid}>
              {['Amount vs history','Recipient identity','Transaction speed','Time of day','Location pattern','Device fingerprint'].map(s => (
                <View key={s} style={styles.riskChip}>
                  <Text style={styles.riskChipText}>✓ {s}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4faf6' },
  header: {
    paddingHorizontal: 20, paddingBottom: 28,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerArc: {
    position: 'absolute', width: width * 1.3, height: width * 1.3,
    borderRadius: width * 0.65, backgroundColor: 'rgba(255,255,255,0.05)',
    top: -width * 0.75, right: -width * 0.4,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  headerSub:   { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginBottom: 18 },
  statsRow:    { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 16, padding: 12 },
  statBox:     { flex: 1, alignItems: 'center' },
  statNum:     { color: C.goldLight, fontSize: 17, fontWeight: '900' },
  statLbl:     { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 4 },

  body: { padding: 16, paddingBottom: 40 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, marginBottom: 14,
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchIco:   { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, height: 46, fontSize: 14, color: C.darkText },
  clearBtn:    { color: C.lightText, fontSize: 16, padding: 4 },

  chatBanner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  chatBannerIcon:  { fontSize: 28, marginRight: 12 },
  chatBannerTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  chatBannerSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  chatBannerArrow: { color: C.goldLight, fontSize: 24, fontWeight: '900' },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: C.midText,
    letterSpacing: 1, marginBottom: 10,
  },
  insightCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    borderLeftWidth: 4, padding: 14, marginBottom: 10,
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  insightIcon:     { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  insightIconText: { fontSize: 20 },
  insightTitle:    { fontSize: 14, fontWeight: '800', marginBottom: 3 },
  insightText:     { fontSize: 13, color: C.midText, lineHeight: 18 },

  emptyWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { color: C.midText, fontSize: 14 },

  riskCard: { borderRadius: 20, overflow: 'hidden', marginTop: 4 },
  riskGrad: { padding: 18 },
  riskTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  riskSub:   { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 14 },
  riskGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  riskChip:  { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  riskChipText: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
});
