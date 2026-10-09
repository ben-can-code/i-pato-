import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Switch, Alert, StatusBar, Platform,
  Modal, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, maskNumber } from '../context/AppContext';

const { width } = Dimensions.get('window');

const C = {
  darkGreen: '#003d1f', deepGreen: '#005c2e', midGreen: '#00873f',
  brightGreen: '#00c853', gold: '#f0b429', goldLight: '#ffe082',
  white: '#ffffff', offWhite: '#f4faf6', mint: '#BFE8DC',
  mintLight: '#e8f7f2', darkText: '#17352B', midText: '#4a6b5e',
  lightText: '#7fb89e', border: '#c8e6d4',
  danger: '#e53935', dangerSoft: '#fdecea',
  successSoft: '#e0f5ea',
};

const AVATARS = ['👨🏾', '👩🏾', '👨🏿', '👩🏿', '👨🏽', '👩🏽', '🧑🏾', '🧑🏽'];

function EditModal({ visible, profile, onSave, onClose }) {
  const [name,  setName]  = useState(profile?.name  || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatar,setAvatar]= useState(profile?.avatar|| '👨🏾');

  const save = () => {
    if (!name.trim()) { Alert.alert('Required', 'Name cannot be empty.'); return; }
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), avatar });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>Edit Profile</Text>

          {/* Avatar picker */}
          <Text style={styles.editLabel}>AVATAR</Text>
          <View style={styles.avatarRow}>
            {AVATARS.map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.avatarOpt, avatar === a && styles.avatarOptActive]}
                onPress={() => setAvatar(a)}
              >
                <Text style={styles.avatarOptText}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.editLabel}>FULL NAME</Text>
          <TextInput
            style={styles.editInput}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={C.lightText}
            autoCapitalize="words"
            underlineColorAndroid="transparent"
          />

          <Text style={styles.editLabel}>EMAIL</Text>
          <TextInput
            style={styles.editInput}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={C.lightText}
            keyboardType="email-address"
            autoCapitalize="none"
            underlineColorAndroid="transparent"
          />

          <Text style={styles.editLabel}>PHONE</Text>
          <TextInput
            style={styles.editInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="+254 7XX XXX XXX"
            placeholderTextColor={C.lightText}
            keyboardType="phone-pad"
            underlineColorAndroid="transparent"
          />

          <View style={styles.editBtns}>
            <TouchableOpacity style={styles.editCancelBtn} onPress={onClose}>
              <Text style={styles.editCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editSaveWrap} onPress={save}>
              <LinearGradient colors={[C.midGreen, C.darkGreen]} style={styles.editSaveBtn}>
                <Text style={styles.editSaveText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen({ navigation }) {
  const { profile, updateProfile, linkedAccounts, totalLinkedBal } = useApp();
  const [editVisible, setEditVisible] = useState(false);

  const handleSave = (updates) => {
    updateProfile(updates);
    setEditVisible(false);
    Alert.alert('✅ Saved', 'Your profile has been updated.');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => Alert.alert('Signed out', 'You have been signed out.') },
    ]);
  };

  const handleBiometric = (type) => {
    const key   = type === 'face' ? 'biometricFace' : 'biometricFinger';
    const label = type === 'face' ? 'Face Recognition' : 'Fingerprint';
    const curr  = profile[key];
    if (!curr) {
      Alert.alert(
        `Enable ${label}`,
        `Allow I-PATO to use ${label} for authentication?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => {
            updateProfile({ [key]: true });
            Alert.alert('✅ Enabled', `${label} has been enabled for your account.`);
          }},
        ]
      );
    } else {
      updateProfile({ [key]: false });
    }
  };

  const primaryAcc = linkedAccounts.find(a => a.primary);
  const activeCount = linkedAccounts.filter(a => a.status === 'active').length;

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[C.darkGreen, C.deepGreen, C.midGreen]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52 }]}
      >
        <View style={styles.headerArc} pointerEvents="none" />

        {/* Avatar + info */}
        <View style={styles.profileHero}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{profile.avatar}</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <View style={styles.planRow}>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✅ Verified</Text>
              </View>
              <View style={styles.planBadge}>
                <Text style={styles.planText}>⭐ {profile.plan}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{linkedAccounts.length}</Text>
            <Text style={styles.statLbl}>Accounts</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{activeCount}</Text>
            <Text style={styles.statLbl}>Active</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: C.goldLight }]}>KSh {totalLinkedBal.toLocaleString()}</Text>
            <Text style={styles.statLbl}>Combined</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Edit profile button */}
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditVisible(true)} activeOpacity={0.85}>
          <LinearGradient colors={[C.gold, C.goldLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.editBtnGrad}>
            <Text style={styles.editBtnText}>✏ Edit Profile</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Linked accounts summary ── */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('LinkedAccounts')}
          activeOpacity={0.88}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🔗 Linked Accounts</Text>
            <Text style={styles.cardArrow}>›</Text>
          </View>
          {primaryAcc ? (
            <View style={styles.primaryAccRow}>
              <Text style={styles.primaryAccIcon}>{primaryAcc.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.primaryAccLabel}>{primaryAcc.label}</Text>
                <Text style={styles.primaryAccNum}>{maskNumber(primaryAcc.number)}</Text>
              </View>
              <View style={styles.primaryChip}>
                <Text style={styles.primaryChipText}>⭐ Primary</Text>
              </View>
            </View>
          ) : null}
          <Text style={styles.cardSub}>
            {activeCount} active account{activeCount !== 1 ? 's' : ''} · KSh {totalLinkedBal.toLocaleString()} combined
          </Text>
        </TouchableOpacity>

        {/* ── Biometric security ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔐 Biometric Security</Text>
          <Text style={styles.cardSubText}>Use your biometrics to authenticate quickly and securely.</Text>

          {/* Fingerprint */}
          <View style={styles.bioRow}>
            <View style={styles.bioLeft}>
              <Text style={styles.bioIcon}>👆</Text>
              <View>
                <Text style={styles.bioLabel}>Fingerprint</Text>
                <Text style={styles.bioDesc}>Touch ID / Fingerprint scanner</Text>
              </View>
            </View>
            <Switch
              value={profile.biometricFinger}
              onValueChange={() => handleBiometric('finger')}
              trackColor={{ false: C.border, true: C.midGreen }}
              thumbColor={profile.biometricFinger ? '#fff' : '#f4f4f4'}
            />
          </View>

          {/* Face recognition */}
          <View style={[styles.bioRow, { borderTopWidth: 1, borderTopColor: C.border }]}>
            <View style={styles.bioLeft}>
              <Text style={styles.bioIcon}>😊</Text>
              <View>
                <Text style={styles.bioLabel}>Face Recognition</Text>
                <Text style={styles.bioDesc}>Face ID / Camera unlock</Text>
              </View>
            </View>
            <Switch
              value={profile.biometricFace}
              onValueChange={() => handleBiometric('face')}
              trackColor={{ false: C.border, true: C.midGreen }}
              thumbColor={profile.biometricFace ? '#fff' : '#f4f4f4'}
            />
          </View>
        </View>

        {/* ── Security preferences ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛡 Security Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🚨</Text>
              <Text style={styles.settingLabel}>Fraud Alerts</Text>
            </View>
            <Switch
              value={profile.fraudAlerts}
              onValueChange={v => updateProfile({ fraudAlerts: v })}
              trackColor={{ false: C.border, true: C.midGreen }}
              thumbColor={profile.fraudAlerts ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={[styles.settingRow, styles.rowBorder]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🕶</Text>
              <Text style={styles.settingLabel}>Privacy Mode</Text>
            </View>
            <Switch
              value={profile.privacyMode}
              onValueChange={v => updateProfile({ privacyMode: v })}
              trackColor={{ false: C.border, true: C.midGreen }}
              thumbColor={profile.privacyMode ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={[styles.settingRow, styles.rowBorder]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>✅</Text>
              <Text style={styles.settingLabel}>KYC Verified</Text>
            </View>
            <Text style={styles.settingValue}>Verified</Text>
          </View>
        </View>

        {/* ── Account info ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ Account Info</Text>
          {[
            { label: 'Phone',   value: profile.phone },
            { label: 'Plan',    value: profile.plan  },
            { label: 'Status',  value: 'Active'       },
          ].map(item => (
            <View key={item.label} style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: C.border }]}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.85}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      <EditModal
        visible={editVisible}
        profile={profile}
        onSave={handleSave}
        onClose={() => setEditVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4faf6' },

  header: {
    paddingHorizontal: 20, paddingBottom: 22,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  headerArc: {
    position: 'absolute', width: width * 1.3, height: width * 1.3,
    borderRadius: width * 0.65, backgroundColor: 'rgba(255,255,255,0.05)',
    top: -width * 0.75, right: -width * 0.4,
  },
  profileHero:   { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  avatarCircle:  {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2.5, borderColor: C.goldLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  avatarText:    { fontSize: 38 },
  profileMeta:   { flex: 1 },
  profileName:   { color: C.white, fontSize: 20, fontWeight: '900', marginBottom: 3 },
  profileEmail:  { color: 'rgba(255,255,255,0.72)', fontSize: 13 },
  planRow:       { flexDirection: 'row', gap: 8, marginTop: 7 },
  verifiedBadge: { backgroundColor: 'rgba(0,200,83,0.22)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: C.brightGreen },
  verifiedText:  { color: C.brightGreen, fontSize: 10, fontWeight: '700' },
  planBadge:     { backgroundColor: 'rgba(240,180,41,0.22)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: C.gold },
  planText:      { color: C.goldLight, fontSize: 10, fontWeight: '700' },

  statsStrip: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: 12 },
  statItem:   { flex: 1, alignItems: 'center' },
  statVal:    { color: C.goldLight, fontSize: 15, fontWeight: '900' },
  statLbl:    { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 2 },
  statDiv:    { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  body: { padding: 16, paddingBottom: 40 },

  editBtn:     { borderRadius: 30, overflow: 'hidden', marginBottom: 14, elevation: 4 },
  editBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  editBtnText: { fontSize: 15, fontWeight: '900', color: C.darkGreen },

  card: {
    backgroundColor: C.white, borderRadius: 18, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
    shadowColor: C.darkGreen, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle:   { fontSize: 15, fontWeight: '800', color: C.darkText },
  cardArrow:   { fontSize: 22, color: C.midGreen, fontWeight: '700' },
  cardSub:     { fontSize: 12, color: C.midText, marginTop: 6 },
  cardSubText: { fontSize: 12, color: C.midText, marginBottom: 12 },

  primaryAccRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.mintLight, borderRadius: 12, padding: 10, marginBottom: 6 },
  primaryAccIcon: { fontSize: 22, marginRight: 10 },
  primaryAccLabel:{ fontSize: 14, fontWeight: '700', color: C.darkText },
  primaryAccNum:  { fontSize: 12, color: C.lightText, marginTop: 2 },
  primaryChip:    { backgroundColor: '#fff8e1', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: C.gold },
  primaryChipText:{ fontSize: 10, color: C.gold, fontWeight: '800' },

  bioRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  bioLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bioIcon:  { fontSize: 24 },
  bioLabel: { fontSize: 14, fontWeight: '700', color: C.darkText },
  bioDesc:  { fontSize: 11, color: C.midText, marginTop: 2 },

  settingRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  rowBorder:    { borderTopWidth: 1, borderTopColor: C.border },
  settingLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingIcon:  { fontSize: 18 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: C.darkText },
  settingValue: { fontSize: 13, fontWeight: '700', color: C.midGreen },

  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: 13, color: C.midText },
  infoValue: { fontSize: 13, fontWeight: '700', color: C.darkText },

  signOutBtn: {
    borderWidth: 1.5, borderColor: C.danger, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginBottom: 8,
  },
  signOutText: { color: C.danger, fontSize: 15, fontWeight: '700' },

  // Edit Modal
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  editCard:     { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  editTitle:    { fontSize: 18, fontWeight: '900', color: C.darkText, marginBottom: 16 },
  editLabel:    { fontSize: 10, fontWeight: '700', color: C.deepGreen, letterSpacing: 0.8, marginBottom: 6, marginTop: 12 },
  editInput:    { height: 46, backgroundColor: '#eef8f3', borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, fontSize: 14, color: C.darkText },
  avatarRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  avatarOpt:    { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.border, backgroundColor: C.offWhite },
  avatarOptActive: { borderColor: C.gold, backgroundColor: '#fff8e1' },
  avatarOptText:   { fontSize: 24 },
  editBtns:     { flexDirection: 'row', gap: 10, marginTop: 20 },
  editCancelBtn:   { flex: 1, height: 48, borderRadius: 30, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  editCancelText:  { fontSize: 14, fontWeight: '700', color: C.midText },
  editSaveWrap:    { flex: 2, borderRadius: 30, overflow: 'hidden' },
  editSaveBtn:     { height: 48, alignItems: 'center', justifyContent: 'center' },
  editSaveText:    { color: '#fff', fontSize: 14, fontWeight: '900' },
});
