import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
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
  lightText: '#7fb89e', border: '#c8e6d4',
  danger: '#e53935', dangerSoft: '#fdecea', dangerBorder: '#ef9a9a',
  warnSoft: '#fff8e1', warnBorder: '#ffe082',
  infoSoft: '#e3f2fd', infoBorder: '#90caf9', infoText: '#1565c0',
};

const LEVEL = {
  High:     { bg: C.dangerSoft, border: C.dangerBorder, color: C.danger,   icon: '🚨' },
  Info:     { bg: C.infoSoft,   border: C.infoBorder,   color: C.infoText,  icon: 'ℹ️'  },
  Reminder: { bg: C.warnSoft,   border: C.warnBorder,   color: C.gold,      icon: '🔔' },
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationsScreen() {
  const { alerts, unreadCount, markAlertRead, markAllRead } = useApp();
  const highCount = alerts.filter(a => a.level === 'High' && !a.read).length;

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[C.darkGreen, C.deepGreen, C.midGreen]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 54 }]}
      >
        <View style={styles.headerArc} pointerEvents="none" />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Alerts</Text>
            <Text style={styles.headerSub}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up ✅'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Summary chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipNum}>{alerts.length}</Text>
            <Text style={styles.chipLbl}>Total</Text>
          </View>
          <View style={styles.chipDivider} />
          <View style={styles.chip}>
            <Text style={[styles.chipNum, highCount > 0 && { color: '#ff6b6b' }]}>{highCount}</Text>
            <Text style={styles.chipLbl}>High</Text>
          </View>
          <View style={styles.chipDivider} />
          <View style={styles.chip}>
            <Text style={[styles.chipNum, { color: C.goldLight }]}>{unreadCount}</Text>
            <Text style={styles.chipLbl}>Unread</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {alerts.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No alerts</Text>
            <Text style={styles.emptyText}>I-PATO will notify you of security events, bill reminders and transaction updates here.</Text>
          </View>
        )}

        {alerts.map(alert => {
          const lvl = LEVEL[alert.level] || LEVEL.Info;
          return (
            <TouchableOpacity
              key={alert.id}
              activeOpacity={0.85}
              onPress={() => markAlertRead(alert.id)}
              style={[styles.alertCard, { borderColor: lvl.border }, !alert.read && { backgroundColor: lvl.bg }]}
            >
              <View style={styles.alertTop}>
                <View style={[styles.alertIconWrap, { backgroundColor: lvl.bg, borderColor: lvl.border }]}>
                  <Text style={styles.alertIcon}>{lvl.icon}</Text>
                </View>
                <View style={styles.alertInfo}>
                  <View style={styles.alertTitleRow}>
                    <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
                    {!alert.read && <View style={[styles.unreadDot, { backgroundColor: lvl.color }]} />}
                  </View>
                  <Text style={styles.alertText}>{alert.text}</Text>
                  <Text style={styles.alertTime}>{timeAgo(alert.date)}</Text>
                </View>
              </View>
              <View style={[styles.levelPill, { backgroundColor: lvl.bg, borderColor: lvl.border }]}>
                <Text style={[styles.levelText, { color: lvl.color }]}>{alert.level}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4faf6' },
  header: {
    paddingHorizontal: 20, paddingBottom: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerArc: {
    position: 'absolute', width: width * 1.3, height: width * 1.3,
    borderRadius: width * 0.65, backgroundColor: 'rgba(255,255,255,0.05)',
    top: -width * 0.75, right: -width * 0.4,
  },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 3 },
  markAllBtn:  { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  markAllText: { color: C.goldLight, fontWeight: '700', fontSize: 12 },
  chipsRow:    { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: 12 },
  chip:        { flex: 1, alignItems: 'center' },
  chipNum:     { color: C.goldLight, fontSize: 16, fontWeight: '900' },
  chipLbl:     { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 2 },
  chipDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  body: { padding: 16, paddingBottom: 40 },

  emptyWrap:  { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon:  { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: C.darkText, marginBottom: 6 },
  emptyText:  { color: C.midText, fontSize: 14, textAlign: 'center', lineHeight: 22 },

  alertCard: {
    backgroundColor: C.white, borderRadius: 18,
    borderWidth: 1.5, padding: 14, marginBottom: 12,
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  alertTop:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  alertIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1 },
  alertIcon:     { fontSize: 20 },
  alertInfo:     { flex: 1 },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  alertTitle:    { fontSize: 14, fontWeight: '800', color: C.darkText, flex: 1 },
  unreadDot:     { width: 8, height: 8, borderRadius: 4, marginLeft: 6 },
  alertText:     { fontSize: 13, color: C.midText, lineHeight: 19 },
  alertTime:     { fontSize: 11, color: C.lightText, marginTop: 4 },
  levelPill:     { alignSelf: 'flex-end', borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 3 },
  levelText:     { fontSize: 11, fontWeight: '700' },
});
