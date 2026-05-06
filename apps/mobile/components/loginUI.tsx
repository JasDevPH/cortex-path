import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import SignIn from './login/signIn';
import SignUp from './login/signUp';

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

// ── Gradient text (teal → lime) ──────────────────────────────────────────────
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

// ── Cortex avatar ─────────────────────────────────────────────────────────────
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

export default function LoginUI() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { width } = useWindowDimensions();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: width > 600 ? width * 0.2 : 24 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding Header */}
        <View style={styles.branding}>
          <CortexAvatar size={48} />
          <View style={{ marginTop: 16 }}>
            <GradientText style={styles.brandTitle}>CortexPath</GradientText>
            <Text style={styles.brandSub}>ARCHITECTURAL INTELLIGENCE</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          {mode === 'login' ? (
            <SignIn />
          ) : (
            <SignUp onSignInPress={() => setMode('login')} />
          )}
        </View>

        {/* Mode Toggle */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
            activeOpacity={0.7}
            style={styles.toggleBtn}
          >
            <Text style={styles.toggleText}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <Text style={styles.toggleTextAccent}>
                {mode === 'login' ? 'Create account' : 'Sign in instead'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scrollContent: { flexGrow: 1, paddingTop: 60, paddingBottom: 40 },
  branding: { alignItems: 'center', marginBottom: 40 },
  brandTitle: { fontSize: 24, fontWeight: '700', color: C.text, letterSpacing: -0.5, textAlign: 'center' },
  brandSub: { fontSize: 10, color: C.text3, letterSpacing: 1.5, textAlign: 'center', marginTop: 4 },
  avatarPill: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  formContainer: { flex: 1, justifyContent: 'center' },
  footer: { marginTop: 32, alignItems: 'center' },
  toggleBtn: { padding: 8 },
  toggleText: { fontSize: 13, color: C.text2, textAlign: 'center' },
  toggleTextAccent: { color: C.accent, fontWeight: '600' },
});

