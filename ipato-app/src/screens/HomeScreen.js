import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

// ── Brand palette — matches onboarding exactly ───────────────────
const C = {
  darkGreen:    '#003d1f',
  deepGreen:    '#005c2e',
  midGreen:     '#00873f',
  brightGreen:  '#00c853',
  gold:         '#f0b429',
  goldLight:    '#ffe082',
  goldSoft:     '#fff8e1',
  white:        '#ffffff',
  offWhite:     '#f4faf6',
  mint:         '#BFE8DC',
  mintLight:    '#e8f7f2',
  darkText:     '#17352B',
  midText:      '#4a6b5e',
  lightText:    '#7fb89e',
  danger:       '#e53935',
  dangerSoft:   '#fdecea',
  warning:      '#f0b429',
  warnSoft:     '#fff8e1',
  success:      '#00873f',
  successSoft:  '#e0f5ea',
  aiBlue:       '#00c2ff',
  aiSoft:       '#e3f8ff',
  border:       '#c8e6d4',
};

const TX_ICONS  = { send: '💸', receive: '📥', bill: '🧾' };
const TX_COLORS = {
  send:    { bg: '#fff3e0', icon: '#f57c00' },
  receive: { bg: C.successSoft, icon: C.success },
  bill:    { bg: C.mintLight,   icon: C.midGreen },
};
const STATUS_META = {
  COMPLETED:            { bg: C.successSoft, color: C.success,  label: 'Done'    },
  PENDING_VERIFICATION: { bg: C.warnSoft,    color: C.warning,  label: 'Pending' },
  HELD:                 { bg: C.dangerSoft,  color: C.danger,   label: 'Held'    },
  CANCELLED:            { bg: '#f5f5f5',     color: '#9e9e9e',  label: 'Cancelled'},
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function HomeScreen({ navigation }) {
  const { balance, transactions, bills, unreadCount } = useApp();
  const [showBalance, setShowBalance] = useState(true);

  const upcomingBills = bills.filter(b => {
    const now = new Date();
    const due = new Date(now.getFullYear(), now.getMonth(), b.dueDay);
    if (due < now) due.setMonth(due.getMonth() + 1);
    const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return days <= 7 && !b.lastPaid;
  });

  const recent = transactions.slice(0, 5);

  const quickActions = [
    { title: 'Send',    icon: '💸', grad: [C.gold, '#f5a623'],   screen: 'SendMoney' },
    { title: 'Bills',   icon: '🧾', grad: [C.midGreen, C.deepGreen], screen: 'Bills' },
    { title: 'Chat AI', icon: '🤖', grad: [C.aiBlue, '#0088cc'],  screen: 'Chatbot' },
    {
      title: 'Alerts', icon: '🔔',
      grad: unreadCount > 0 ? [C.danger, '#b71c1c'] : ['#78909c', '#546e7a'],
      screen: 'Alerts', badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Full-width green hero header ── */}
        <LinearGradient
          colors={[C.darkGreen, C.deepGreen, C.midGreen]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 56 }]}
        >
          {/* Decorative arc */}
          <View style={styles.heroArc} pointerEvents="none" />

          {/* Top row */}
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>Good day 👋</Text>
              <Text style={styles.heroTitle}>I-PATO Wallet</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🛡 AI Secure</Text>
            </View>
          </View>

          {/* Balance */}
          <View style={styles.balanceWrap}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available balance</Text>
              <TouchableOpacity onPress={() => setShowBalance(v => !v)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showBalance ? '🙈 Hide' : '👁 Show'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {showBalance ? `KSh ${balance.toLocaleString()}` : 'KSh ••••••'}
            </Text>

            {/* Stats strip */}
            <View style={styles.statsStrip}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>92</Text>
                <Text style={styles.statLabel}>AI Score</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: C.brightGreen }]}>Low</Text>
                <Text style={styles.statLabel}>Risk</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{transactions.length}</Text>
                <Text style={styles.statLabel}>Txns</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Content area ── */}
        <View style={styles.content}>

          {/* ── Quick actions ── */}
          <View style={styles.actionsWrap}>
            {quickActions.map(a => (
              <TouchableOpacity
                key={a.title}
                style={styles.actionBtn}
                onPress={() => navigation.navigate(a.screen)}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={a.grad}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.actionGrad}
                >
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                  {a.badge ? (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>{a.badge}</Text>
                    </View>
                  ) : null}
                </LinearGradient>
                <Text style={styles.actionLabel}>{a.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Bill alert banner ── */}
          {upcomingBills.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Bills')} activeOpacity={0.88}>
              <LinearGradient
                colors={[C.gold, '#f5a623']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.billBanner}
              >
                <Text style={styles.billBannerIcon}>⚠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.billBannerTitle}>
                    {upcomingBills.length} bill{upcomingBills.length > 1 ? 's' : ''} due soon
                  </Text>
                  <Text style={styles.billBannerSub} numberOfLines={1}>
                    {upcomingBills.map(b => b.name).join(' · ')}
                  </Text>
                </View>
                <Text style={styles.billBannerArrow}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ── Fraud shield card ── */}
          <LinearGradient
            colors={[C.darkGreen, C.deepGreen]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.fraudCard}
          >
            <View style={styles.fraudTop}>
              <View>
                <Text style={styles.fraudTitle}>Fraud Shield</Text>
                <Text style={styles.fraudSub}>Behavioural AI · Real-time</Text>
              </View>
              <View style={styles.fraudBadge}>
                <Text style={styles.fraudBadgeText}>● LIVE</Text>
              </View>
            </View>
            <Text style={styles.fraudDesc}>
              Every transaction is scored against your history. Unusual patterns are held for verification before any money moves.
            </Text>
            <View style={styles.fraudBarWrap}>
              <View style={styles.fraudBarBg}>
                <LinearGradient
                  colors={[C.brightGreen, C.gold]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.fraudBarFill, { width: '94%' }]}
                />
              </View>
              <Text style={styles.fraudScore}>94%</Text>
            </View>
          </LinearGradient>

          {/* ── Recent transactions ── */}
          <View style={styles.txCard}>
            <View style={styles.txCardHeader}>
              <Text style={styles.txCardTitle}>Recent activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Chatbot')} style={styles.askAiBtn}>
                <Text style={styles.askAiText}>Ask AI 🤖</Text>
              </TouchableOpacity>
            </View>

            {recent.length === 0 && (
              <Text style={styles.emptyText}>No transactions yet.</Text>
            )}

            {recent.map((tx, i) => {
              const txColor  = TX_COLORS[tx.type]  || TX_COLORS.send;
              const stMeta   = STATUS_META[tx.status] || STATUS_META.COMPLETED;
              return (
                <View
                  key={tx.id}
                  style={[styles.txRow, i === 0 && styles.txRowFirst]}
                >
                  {/* Icon */}
                  <View style={[styles.txIconCircle, { backgroundColor: txColor.bg }]}>
                    <Text style={styles.txIconText}>{TX_ICONS[tx.type] || '💳'}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.txInfo}>
                    <Text style={styles.txName} numberOfLines={1}>{tx.recipient}</Text>
                    <Text style={styles.txTime}>{timeAgo(tx.date)}</Text>
                  </View>

                  {/* Amount + status */}
                  <View style={styles.txRight}>
                    <Text style={[
                      styles.txAmount,
                      tx.type === 'receive' ? styles.txPositive : styles.txNegative,
                    ]}>
                      {tx.type === 'receive' ? '+' : '-'}KSh {tx.amount.toLocaleString()}
                    </Text>
                    <View style={[styles.txStatus, { backgroundColor: stMeta.bg }]}>
                      <Text style={[styles.txStatusText, { color: stMeta.color }]}>
                        {stMeta.label}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Bottom spacer ── */}
          <View style={{ height: 16 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const HERO_CURVE = 36;

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.offWhite },
  scroll: { flexGrow: 1 },

  /* ── Hero ── */
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    borderBottomLeftRadius: HERO_CURVE,
    borderBottomRightRadius: HERO_CURVE,
    overflow: 'hidden',
  },
  heroArc: {
    position: 'absolute',
    width: width * 1.4, height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -width * 0.8, right: -width * 0.4,
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  heroGreeting: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500' },
  heroTitle:    { color: C.white, fontSize: 22, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  heroBadgeText: { color: C.white, fontWeight: '700', fontSize: 12 },

  balanceWrap: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  balanceRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  eyeBtn: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4,
  },
  eyeText:      { color: C.goldLight, fontSize: 11, fontWeight: '700' },
  balanceAmount:{ color: C.white, fontSize: 34, fontWeight: '900', marginVertical: 12, letterSpacing: 0.5 },

  statsStrip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: 10,
  },
  statItem:   { flex: 1, alignItems: 'center' },
  statValue:  { color: C.goldLight, fontSize: 15, fontWeight: '800' },
  statLabel:  { color: 'rgba(255,255,255,0.60)', fontSize: 10, marginTop: 2 },
  statDivider:{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.18)' },

  /* ── Content ── */
  content: { marginTop: -HERO_CURVE, paddingTop: HERO_CURVE + 8, paddingHorizontal: 16 },

  /* ── Quick actions ── */
  actionsWrap: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionBtn:   { alignItems: 'center', width: (width - 52) / 4 },
  actionGrad: {
    width: 54, height: 54, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22, shadowRadius: 8, elevation: 6,
  },
  actionIcon:  { fontSize: 22 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: C.darkText, textAlign: 'center' },
  actionBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: C.danger, borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: C.white,
  },
  actionBadgeText: { color: C.white, fontSize: 9, fontWeight: '900' },

  /* ── Bill banner ── */
  billBanner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 14, marginBottom: 14,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  billBannerIcon:  { fontSize: 22, marginRight: 10 },
  billBannerTitle: { color: C.darkGreen, fontSize: 14, fontWeight: '800' },
  billBannerSub:   { color: 'rgba(0,40,20,0.7)', fontSize: 12, marginTop: 1 },
  billBannerArrow: { fontSize: 24, color: C.darkGreen, fontWeight: '900' },

  /* ── Fraud card ── */
  fraudCard: {
    borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  fraudTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  fraudTitle:    { color: C.white, fontSize: 17, fontWeight: '900' },
  fraudSub:      { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  fraudBadge:    { backgroundColor: 'rgba(0,200,83,0.22)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.brightGreen },
  fraudBadgeText:{ color: C.brightGreen, fontSize: 11, fontWeight: '800' },
  fraudDesc:     { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  fraudBarWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fraudBarBg:    { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999 },
  fraudBarFill:  { height: 8, borderRadius: 999 },
  fraudScore:    { color: C.goldLight, fontWeight: '900', fontSize: 14 },

  /* ── Transaction card ── */
  txCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  txCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  txCardTitle: { fontSize: 16, fontWeight: '800', color: C.darkText },
  askAiBtn: {
    backgroundColor: C.mintLight, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: C.border,
  },
  askAiText: { color: C.midGreen, fontSize: 12, fontWeight: '700' },

  emptyText: { color: C.lightText, fontSize: 13, textAlign: 'center', paddingVertical: 20 },

  txRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  txRowFirst: { borderTopWidth: 0 },
  txIconCircle: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  txIconText: { fontSize: 18 },
  txInfo:     { flex: 1 },
  txName:     { fontSize: 14, fontWeight: '700', color: C.darkText },
  txTime:     { fontSize: 12, color: C.lightText, marginTop: 2 },
  txRight:    { alignItems: 'flex-end' },
  txAmount:   { fontSize: 13, fontWeight: '800' },
  txPositive: { color: C.success },
  txNegative: { color: C.darkText },
  txStatus:   { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  txStatusText:{ fontSize: 10, fontWeight: '700' },
});
