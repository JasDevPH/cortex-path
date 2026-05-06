import React, { useState } from 'react';
import { Alert, Text, TextInput, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { signUpWithEmail } from '@/lib/api';

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

interface SignUpProps {
  onSignInPress: () => void;
}

export default function SignUp({ onSignInPress }: SignUpProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp() {
    const normalizedName = name.trim();
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedUsername || !normalizedEmail || !password) {
      setErrorMessage('Fill in all account details.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signUpWithEmail(normalizedName, normalizedUsername, normalizedEmail, password);
      Alert.alert('Account created', 'You can now login with your email and password.');
      onSignInPress();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>NEW HERE?</Text>
        <Text style={styles.titleText}>Create account</Text>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.subText}>Start mapping</Text>
          <GradientText style={styles.subTextGradient}>your codebase.</GradientText>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <User stroke={C.text3} size={16} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                placeholderTextColor={C.text3}
                value={name}
                onChangeText={setName}
                editable={!isSubmitting}
              />
            </View>
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>USERNAME</Text>
            <View style={styles.inputWrapper}>
              <User stroke={C.text3} size={16} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="janedoe"
                placeholderTextColor={C.text3}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                editable={!isSubmitting}
              />
            </View>
          </View>
        </View>

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

        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <Lock stroke={C.text3} size={16} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
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
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <Lock stroke={C.text3} size={16} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={C.text3}
              secureTextEntry={!isPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isSubmitting}
            />
          </View>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignUp}
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
              {isSubmitting ? 'CREATING...' : 'CREATE ACCOUNT'}
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
  header: { marginBottom: 24 },
  welcomeText: { fontSize: 12, fontWeight: '600', color: C.accent, letterSpacing: 2, marginBottom: 8 },
  titleText: { fontSize: 36, fontWeight: '700', color: C.text, marginBottom: 4 },
  subText: { fontSize: 16, color: C.text2, fontWeight: '500' },
  subTextGradient: { fontSize: 16, fontWeight: '600' },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 10, fontWeight: '700', color: C.text3, letterSpacing: 1.5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: C.text, fontSize: 14, fontWeight: '500' },
  eyeBtn: { padding: 4 },
  errorText: { color: '#ef4444', fontSize: 12, fontWeight: '600' },
  submitBtnContainer: { marginTop: 8 },
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

