import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, KeyboardAvoidingView,
  Platform, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

// ── Bot knowledge base ─────────────────────────────────────────────
const BOT_NAME = 'Pato AI';

function getBotReply(input, { balance, transactions, bills, navigation }) {
  const msg = input.toLowerCase().trim();

  // ── Balance ──────────────────────────────────────────────────────
  if (/(balance|how much|money|funds|account).*(have|got|left|is)|(what.*(my|is).*(balance|money))/.test(msg) || msg === 'balance') {
    return { text: `Your current balance is **KSh ${balance.toLocaleString()}**.`, action: null };
  }

  // ── Send money ───────────────────────────────────────────────────
  if (/(send|transfer|pay someone|send money)/.test(msg)) {
    return {
      text: `To send money, tap the button below and I'll take you to the Send Money screen. You can choose a contact or enter a phone number.`,
      action: { label: '💸 Send Money', screen: 'SendMoney' },
    };
  }

  // ── Bills ────────────────────────────────────────────────────────
  if (/(bill|bills|rent|electricity|water|school fee|internet|insurance|pay bill)/.test(msg)) {
    const dueBills = bills.filter(b => {
      const now  = new Date();
      const due  = new Date(now.getFullYear(), now.getMonth(), b.dueDay);
      if (due < now) due.setMonth(due.getMonth() + 1);
      const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      return days <= 7;
    });
    const dueTxt = dueBills.length
      ? `\n\nUpcoming: ${dueBills.map(b => `${b.icon} ${b.name} (KSh ${b.amount.toLocaleString()})`).join(', ')}.`
      : '';
    return {
      text: `You can manage all your recurring bills — rent, electricity, water, school fees, internet and more — from the Bills screen.${dueTxt}`,
      action: { label: '🧾 View Bills', screen: 'Bills' },
    };
  }

  // ── Recent transactions ──────────────────────────────────────────
  if (/(transaction|history|recent|last|sent|received|activity)/.test(msg)) {
    const recent = transactions.slice(0, 3);
    const list   = recent.map(t =>
      `• ${t.type === 'receive' ? '+' : '-'}KSh ${t.amount.toLocaleString()} — ${t.recipient} (${t.status})`
    ).join('\n');
    return { text: `Here are your 3 most recent transactions:\n\n${list}`, action: null };
  }

  // ── Login help ───────────────────────────────────────────────────
  if (/(login|sign in|log in|cant login|forgot password|password|access account)/.test(msg)) {
    return {
      text: `To log in:\n1. Enter your registered email address\n2. Enter your password\n3. Tap "LOG IN"\n\nIf you forgot your password, tap "Forgot your password?" on the login screen to reset it via email.`,
      action: null,
    };
  }

  // ── Registration / create account ───────────────────────────────
  if (/(register|sign up|create account|new account|how to register|join)/.test(msg)) {
    return {
      text: `Creating an account is easy:\n1. Tap "Sign Up" on the login screen\n2. Enter your full name, email and password\n3. Your password must have uppercase, lowercase, a number and a special character\n4. Enter the OTP code sent to your email\n5. You're in! 🎉`,
      action: null,
    };
  }

  // ── OTP help ─────────────────────────────────────────────────────
  if (/(otp|verification code|code|verify|not received|resend)/.test(msg)) {
    return {
      text: `If you didn't receive your OTP:\n• Check your spam/junk folder\n• Make sure you entered the correct email\n• Tap "Resend" after the 60-second countdown\n• The code expires in 10 minutes\n\nFor security, each code can only be used once.`,
      action: null,
    };
  }

  // ── Security / fraud ─────────────────────────────────────────────
  if (/(security|fraud|suspicious|scam|hack|protect|safe|anomaly|flag|held|pending)/.test(msg)) {
    return {
      text: `I-PATO uses AI-powered fraud detection that:\n\n🛡 Analyses every transaction against your history\n⚠ Flags unusual amounts or rapid transfers\n🔒 Holds suspicious transactions before sending\n📱 Requests extra OTP verification for high-risk transactions\n\nYour money is never sent until verification passes.`,
      action: null,
    };
  }

  // ── Alerts / notifications ────────────────────────────────────────
  if (/(alert|notification|remind|warning)/.test(msg)) {
    return {
      text: `Check your Alerts tab for security notifications, bill reminders and transaction updates. I'll flag anything that needs your attention there.`,
      action: { label: '🔔 View Alerts', screen: 'Alerts' },
    };
  }

  // ── Account / profile ────────────────────────────────────────────
  if (/(account|profile|name|email|settings|edit|sign out|logout)/.test(msg)) {
    return {
      text: `You can view and edit your profile, manage security settings, toggle biometric login, and sign out from the Account tab.`,
      action: { label: '👤 Go to Account', screen: 'Account' },
    };
  }

  // ── Greetings ────────────────────────────────────────────────────
  if (/(hi|hello|hey|good morning|good evening|good afternoon|howdy)/.test(msg)) {
    return { text: `Hello! 👋 I'm ${BOT_NAME}, your I-PATO assistant.\n\nI can help you:\n• Check your balance\n• Send money\n• Pay bills\n• Understand security alerts\n• Guide you through login or registration\n\nWhat can I help you with?`, action: null };
  }

  // ── Help ─────────────────────────────────────────────────────────
  if (/(help|what can you do|options|menu|assist)/.test(msg)) {
    return {
      text: `Here's what I can help with:\n\n💰 Check balance\n💸 Send money\n🧾 Pay bills\n📋 View transactions\n🛡 Security & fraud info\n🔑 Login help\n📝 Registration guide\n🔔 Alerts\n\nJust type your question naturally!`,
      action: null,
    };
  }

  // ── Default ──────────────────────────────────────────────────────
  return {
    text: `I'm not sure about that. Here are some things I can help with:\n\n• "What is my balance?"\n• "How do I send money?"\n• "Show my bills"\n• "How do I create an account?"\n• "Why was my transaction flagged?"\n\nTry one of those or type **help** for a full list.`,
    action: null,
  };
}

// ── Quick suggestion chips ─────────────────────────────────────────
const SUGGESTIONS = [
  'What is my balance?',
  'How do I send money?',
  'Show my bills',
  'Recent transactions',
  'Why was my transaction flagged?',
  'How do I create an account?',
];

let msgId = 0;
const newMsg = (role, text, action = null) => ({ id: String(++msgId), role, text, action, time: new Date() });

export default function ChatbotScreen({ navigation }) {
  const { balance, transactions, bills } = useApp();

  const [messages, setMessages] = useState([
    newMsg('bot', `Hi! 👋 I'm ${BOT_NAME}, your smart I-PATO assistant.\n\nI can help you send money, pay bills, check your balance, understand security alerts, or guide you through login and registration.\n\nWhat can I help you with today?`),
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const send = useCallback((text) => {
    const userText = text.trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg = newMsg('user', userText);
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Simulate typing delay
    setTimeout(() => {
      const reply = getBotReply(userText, { balance, transactions, bills, navigation });
      setMessages(prev => [...prev, newMsg('bot', reply.text, reply.action)]);
      setLoading(false);
    }, 600);
  }, [balance, transactions, bills, navigation, loading]);

  const handleAction = (screen) => {
    const tabScreens = ['Home', 'AI', 'Alerts', 'Account'];
    if (tabScreens.includes(screen)) {
      navigation.navigate(screen);
    } else {
      navigation.navigate(screen);
    }
  };

  const renderMsg = ({ item }) => {
    const isBot = item.role === 'bot';
    // Parse **bold** markers
    const parts = item.text.split(/\*\*(.*?)\*\*/g);

    return (
      <View style={[styles.msgWrap, isBot ? styles.msgWrapBot : styles.msgWrapUser]}>
        {isBot && <Text style={styles.botAvatar}>🤖</Text>}
        <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
          <Text style={[styles.bubbleText, isBot ? styles.bubbleTextBot : styles.bubbleTextUser]}>
            {parts.map((part, i) =>
              i % 2 === 1
                ? <Text key={i} style={styles.bold}>{part}</Text>
                : part
            )}
          </Text>
          {item.action && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleAction(item.action.screen)}
            >
              <Text style={styles.actionBtnText}>{item.action.label}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.timeText}>
            {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={['#003d1f', '#005c2e']} style={styles.header}>
        <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 52 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.botAvatarHeader}>🤖</Text>
            <View>
              <Text style={styles.headerTitle}>{BOT_NAME}</Text>
              <Text style={styles.headerSub}>Always online • Secure assistant</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderMsg}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing indicator */}
        {loading && (
          <View style={styles.typingWrap}>
            <Text style={styles.botAvatar}>🤖</Text>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>Pato is typing…</Text>
            </View>
          </View>
        )}

        {/* Suggestions */}
        <View>
          <FlatList
            horizontal
            data={SUGGESTIONS}
            keyExtractor={s => s}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsRow}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionChip} onPress={() => send(item)}>
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything…"
            placeholderTextColor={COLORS.gray}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            blurOnSubmit={false}
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f8' },
  flex: { flex: 1 },

  header: { paddingHorizontal: 20, paddingBottom: 18 },
  backBtn: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12,
  },
  backText:       { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerInfo:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  botAvatarHeader:{ fontSize: 32 },
  headerTitle:    { color: '#fff', fontSize: 17, fontWeight: '900' },
  headerSub:      { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

  listContent: { padding: 14, paddingBottom: 8 },

  msgWrap:     { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgWrapBot:  { justifyContent: 'flex-start' },
  msgWrapUser: { justifyContent: 'flex-end' },

  botAvatar: { fontSize: 22, marginRight: 6, marginBottom: 2 },

  bubble: {
    maxWidth: '80%', borderRadius: 18, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  bubbleBot:      { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bubbleUser:     { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleText:     { fontSize: 14, lineHeight: 20 },
  bubbleTextBot:  { color: COLORS.text },
  bubbleTextUser: { color: '#fff' },
  bold:           { fontWeight: '800' },

  actionBtn: {
    marginTop: 10, backgroundColor: COLORS.primary,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  timeText: { fontSize: 10, color: COLORS.gray, marginTop: 4, alignSelf: 'flex-end' },

  typingWrap:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 4 },
  typingBubble: { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, borderBottomLeftRadius: 4 },
  typingText:   { color: COLORS.textSecondary, fontSize: 13, fontStyle: 'italic' },

  suggestionsRow: { paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  suggestionChip: {
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  suggestionText: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '600' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1, height: 44, backgroundColor: '#f4f7f6',
    borderRadius: 22, paddingHorizontal: 16, fontSize: 14,
    color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
  sendBtnText:     { color: '#fff', fontSize: 18, fontWeight: '900' },
});
