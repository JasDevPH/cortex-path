import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { signInWithEmail } from '@/lib/api';

// ── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:           '#09090b',
  card:         '#18181b',
  cardRaised:   '#27272a',
  border:       '#3f3f46',
  accent:       '#2dd4bf',
  text:         '#fafafa',
  text2:        '#a1a1aa',
  text3:        '#71717a',
} as const;

// ── Gradient text helper ─────────────────────────────────────────────────────
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

export default function SignIn() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSignIn() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setErrorMessage('Enter your email and password.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await signInWithEmail(normalizedEmail, password);
      router.replace('/chat');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to login.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>WELCOME BACK</Text>
        <Text style={styles.titleText}>Sign in</Text>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.subText}>Mirror your code.</Text>
          <GradientText style={styles.subTextGradient}>Master your architecture.</GradientText>
        </View>
      </View>

      <View style={styles.form}>
        {/* Email Field */}
        <View style={styles.field}>
          <Text style={styles.label}>EMAIL</Text>
          <View style={styles.inputWrapper}>
            <Mail stroke={C.text3} size={16} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={C.text3}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <Lock stroke={C.text3} size={16} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor={C.text3}
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeBtn}>
              {isPasswordVisible ? (
                <EyeOff stroke={C.text3} size={16} />
              ) : (
                <Eye stroke={C.text3} size={16} />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignIn}
          disabled={isSubmitting}
          style={styles.submitBtnContainer}
        >
          <LinearGradient
            colors={['#2DD4BF', '#22d3ee']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
            </Text>
            <ArrowRight stroke="#09090b" size={18} strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 32 },
  welcomeText: { fontSize: 12, fontWeight: '600', color: C.accent, letterSpacing: 2, marginBottom: 8 },
  titleText: { fontSize: 36, fontWeight: '700', color: C.text, marginBottom: 4 },
  subText: { fontSize: 16, color: C.text2, fontWeight: '500' },
  subTextGradient: { fontSize: 16, fontWeight: '600' },
  form: { gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 10, fontWeight: '700', color: C.text3, letterSpacing: 1.5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: C.text, fontSize: 14, fontWeight: '500' },
  eyeBtn: { padding: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 4 },
  forgotText: { fontSize: 10, fontWeight: '700', color: C.accent, letterSpacing: 1 },
  errorText: { color: '#ef4444', fontSize: 12, fontWeight: '600' },
  submitBtnContainer: { marginTop: 12 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    gap: 8,
  },
  submitBtnText: { color: '#09090b', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
});

