import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { LogOut, Plus, Send } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError, signOut, streamChatMessage } from '../lib/api';

// ── Color tokens (mirrors web dark theme) ────────────────────────────────────
const C = {
  bg:           '#09090b',
  card:         '#18181b',
  cardRaised:   '#27272a',
  border:       '#3f3f46',
  accent:       '#2dd4bf',
  accentBg:     'rgba(20,184,166,0.08)',
  accentBorder: '#134e4a',
  text:         '#fafafa',
  text2:        '#a1a1aa',
  text3:        '#71717a',
} as const;

// ── Animated three-dot typing indicator ──────────────────────────────────────
function TypingDots() {
  const d0 = useRef(new Animated.Value(0)).current;
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const make = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: -5, duration: 280, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0,  duration: 280, useNativeDriver: true }),
          Animated.delay(Math.max(0, 550 - delay)),
        ])
      );

    const a0 = make(d0, 0);
    const a1 = make(d1, 150);
    const a2 = make(d2, 300);
    a0.start(); a1.start(); a2.start();
    return () => { a0.stop(); a1.stop(); a2.stop(); };
  }, [d0, d1, d2]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }}>
      {[d0, d1, d2].map((d, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6, height: 6, borderRadius: 3,
            backgroundColor: C.accent,
            transform: [{ translateY: d }],
          }}
        />
      ))}
    </View>
  );
}

// ── Gradient text (teal → lime, mirrors web BrandLogo) ───────────────────────
function GradientText({ children, style }: { children: string; style?: object }) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}>
      <LinearGradient
        colors={['#2DD4BF', '#a3e635']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

// ── Cortex avatar (logo inside white pill, mirrors web BrandLogo) ─────────────
function CortexAvatar({ size = 28 }: { size?: number }) {
  const padding = size * 0.12;
  const imgSize = size * 0.68;
  return (
    <View style={[styles.avatarPill, {
      width: size, height: size,
      borderRadius: size * 0.28,
      padding,
    }]}>
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width: imgSize, height: imgSize }}
        resizeMode="contain"
      />
    </View>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Message = { id: number; role: 'user' | 'assistant'; content: string };

const HINTS = [
  'Where is auth handled?',
  'Which files import useIngestor?',
  'Explain the ingestion pipeline',
];

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatUI() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();

  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const inputRef  = useRef<TextInput>(null);
  const nextId    = useRef(1);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const uid         = nextId.current;
    const assistantId = uid + 1;
    nextId.current   += 2;

    setMessages(prev => [
      ...prev,
      { id: uid,         role: 'user',     content: text },
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsLoading(true);
    setTimeout(scrollToBottom, 50);

    try {
      await streamChatMessage(text, chunk => {
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: chunk } : m)
        );
        setTimeout(scrollToBottom, 30);
      });
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.message
        : 'Something went wrong. Please try again.';
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: msg } : m)
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, scrollToBottom]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  }, []);

  const handleSignOut = async () => {
    try { await signOut(); } catch { /* ignore */ }
    router.replace('/');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <CortexAvatar size={36} />
          <View>
            <GradientText style={styles.headerTitle}>CortexPath</GradientText>
            <Text style={styles.headerSub}>AI codebase assistant</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleNewChat} activeOpacity={0.7}>
            <Plus size={16} color={C.text2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSignOut(true)} activeOpacity={0.7}>
            <LogOut size={16} color={C.text2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Body ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.bottom}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToBottom}
        >
          {/* Empty state with hint chips */}
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <CortexAvatar size={64} />
              <GradientText style={styles.emptyTitle}>Ask CortexPath anything</GradientText>
              <Text style={styles.emptySub}>
                about your codebase — architecture, logic, dependencies
              </Text>
              <View style={{ width: '100%', gap: 8, marginTop: 8 }}>
                {HINTS.map(hint => (
                  <TouchableOpacity
                    key={hint}
                    style={styles.hintChip}
                    onPress={() => { setInput(hint); inputRef.current?.focus(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.hintText}>&quot;{hint}&quot;</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map(msg =>
            msg.role === 'user' ? (
              <View key={msg.id} style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{msg.content}</Text>
                </View>
              </View>
            ) : (
              <View key={msg.id} style={styles.assistantRow}>
                <CortexAvatar size={26} />
                <View style={styles.assistantBubble}>
                  {msg.content === '' ? <TypingDots /> : (
                    <Text style={styles.assistantText}>{msg.content}</Text>
                  )}
                </View>
              </View>
            )
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              placeholder="Ask Cortex about your codebase..."
              placeholderTextColor={C.text3}
              value={input}
              onChangeText={setInput}
              multiline
              style={styles.input}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={isLoading || !input.trim()}
              style={[
                styles.sendBtn,
                (!isLoading && input.trim()) ? styles.sendActive : styles.sendDisabled,
              ]}
              activeOpacity={0.8}
            >
              <Send size={15} color={(!isLoading && input.trim()) ? C.bg : C.text3} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Sign-out modal */}
      <Modal
        visible={showSignOut}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOut(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalSub}>Are you sure you want to sign out?</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSignOut(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => { setShowSignOut(false); handleSignOut(); }}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },

  header:    {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  headerSub:   { fontSize: 10, color: C.text3, letterSpacing: 0.8, textTransform: 'uppercase' },
  iconBtn:   {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  avatarPill: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center', justifyContent: 'center',
  },

  messageList:    { padding: 16, paddingBottom: 8, gap: 16 },

  emptyState:     { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyTitle:     { fontSize: 16, fontWeight: '600', color: C.text },
  emptySub:       { fontSize: 13, color: C.text3, textAlign: 'center', lineHeight: 20 },
  hintChip:       {
    borderWidth: 1, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  hintText:       { fontSize: 12, color: C.text2 },

  userRow:        { alignItems: 'flex-end' },
  userBubble:     {
    maxWidth: '80%', backgroundColor: C.text,
    borderRadius: 18, borderBottomRightRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  userText:       { fontSize: 14, color: C.bg, lineHeight: 20 },

  assistantRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  assistantBubble:{
    flex: 1, backgroundColor: C.card,
    borderRadius: 18, borderTopLeftRadius: 4,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  assistantText:  { fontSize: 14, color: C.text2, lineHeight: 22 },

  inputBar: {
    paddingHorizontal: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingLeft: 14, paddingRight: 6, paddingVertical: 8,
  },
  input: {
    flex: 1, color: C.text, fontSize: 14, lineHeight: 20, maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 4 : 0,
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
  },
  sendBtn:     { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sendActive:  { backgroundColor: C.accent },
  sendDisabled:{ backgroundColor: C.cardRaised },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard:   {
    backgroundColor: C.card, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    padding: 24, width: '100%', maxWidth: 320, gap: 16,
  },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center' },
  modalSub:    { fontSize: 14, color: C.text2, textAlign: 'center' },
  cancelBtn:   {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: C.cardRaised, borderWidth: 1, borderColor: C.border,
    alignItems: 'center',
  },
  cancelText:  { fontSize: 15, fontWeight: '600', color: C.text2 },
  confirmBtn:  { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center' },
  confirmText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
