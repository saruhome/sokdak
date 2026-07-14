import {
  StyleSheet, View, Image, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';
import { authStore } from '../../constants/authStore';

const JJAEKI_AVATAR = require('../../assets/characters/jjaeki.png');

/* ── List/Item/Log up (327×48) 재사용 컴포넌트 — auth/signup.tsx와 동일 패턴 ── */
function FormField({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, helper, error,
  returnKeyType, onSubmitEditing,
}: {
  label: string; value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  helper?: string; error?: string;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={ff.wrap}>
      <Text style={ff.label}>{label}</Text>
      <TextInput
        style={[ff.input, focused && ff.inputFocused, !!error && ff.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType={returnKeyType ?? 'next'}
        onSubmitEditing={onSubmitEditing}
      />
      {helper && !error ? <Text style={ff.helper}>{helper}</Text> : null}
      {error ? <Text style={ff.error}>{error}</Text> : null}
    </View>
  );
}

const ff = StyleSheet.create({
  wrap: { gap: 4, marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, paddingHorizontal: 2 },
  input: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, fontSize: 15, color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  inputFocused: { borderColor: Colors.navBar },
  inputError: { borderColor: Colors.error },
  helper: { fontSize: 11, color: Colors.textTertiary, paddingHorizontal: 2 },
  error: { fontSize: 11, color: Colors.error, paddingHorizontal: 2 },
});

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function EmailLoginScreen() {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  /* ── 로그인 폼 상태 ── */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  /* ── 비밀번호 찾기 상태 ── */
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const errors = submitted ? {
    email: !validateEmail(email) ? '올바른 이메일 형식을 입력해주세요.' : undefined,
    password: password.length < 1 ? '비밀번호를 입력해주세요.' : undefined,
  } : { email: undefined, password: undefined };

  const isValid = validateEmail(email) && password.length >= 1;

  const handleLogin = () => {
    setSubmitted(true);
    if (!isValid) return;
    authStore.login({
      name: email.split('@')[0],
      email,
      emoji: '📧',
    });
    router.back();
  };

  const resetError = resetSubmitted && !validateEmail(resetEmail)
    ? '올바른 이메일 형식을 입력해주세요.' : undefined;

  const handleSendReset = () => {
    setResetSubmitted(true);
    if (!validateEmail(resetEmail)) return;
    setResetSent(true);
  };

  const goBackToLogin = () => {
    setMode('login');
    setResetSubmitted(false);
    setResetSent(false);
    setResetEmail('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safeArea}>
        {/* ── TopAppBar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (mode === 'forgot' ? goBackToLogin() : router.back())}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{mode === 'login' ? '이메일로 로그인' : '비밀번호 찾기'}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {mode === 'login' ? (
            <>
              <View style={[styles.welcomeSection, styles.welcomeRow]}>
                <Image source={JJAEKI_AVATAR} style={styles.welcomeAvatar} resizeMode="cover" />
                <Text style={styles.welcomeText}>다시 만나서 반가워요!{'\n'}이메일로 로그인해주세요.</Text>
              </View>

              <View style={styles.form}>
                <FormField
                  label="이메일"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  keyboardType="email-address"
                  error={errors.email}
                  returnKeyType="next"
                />
                <FormField
                  label="비밀번호"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="비밀번호를 입력해주세요"
                  secureTextEntry
                  error={errors.password}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>

              {/* ── 비밀번호 찾기 링크 ── */}
              <TouchableOpacity style={styles.forgotRow} onPress={() => setMode('forgot')}>
                <Text style={styles.forgotLink}>비밀번호를 잊으셨나요?</Text>
              </TouchableOpacity>

              {/* ── 로그인 버튼 ── Figma: Controls/Buttons/Text Button_02 (320×52) */}
              <TouchableOpacity
                style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={[styles.submitBtnText, !isValid && styles.submitBtnTextDisabled]}>
                  로그인
                </Text>
              </TouchableOpacity>

              <View style={styles.signupRow}>
                <Text style={styles.signupPrompt}>계정이 없으신가요?</Text>
                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                  <Text style={styles.signupLink}>회원가입</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : resetSent ? (
            /* ── 재설정 메일 발송 완료 ── */
            <View style={styles.doneWrap}>
              <Text style={styles.doneEmoji}>📬</Text>
              <Text style={styles.doneTitle}>메일을 보냈어요!</Text>
              <Text style={styles.doneDesc}>
                '{resetEmail}'로{'\n'}비밀번호 재설정 링크를 보냈어요.{'\n'}메일함을 확인해주세요.
              </Text>
              <TouchableOpacity style={styles.submitBtn} onPress={goBackToLogin} activeOpacity={0.85}>
                <Text style={styles.submitBtnText}>로그인으로 돌아가기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── 비밀번호 찾기 폼 ── */
            <>
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>
                  가입하신 이메일 주소를 입력하시면{'\n'}비밀번호 재설정 링크를 보내드려요.
                </Text>
              </View>

              <View style={styles.form}>
                <FormField
                  label="이메일"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  placeholder="example@email.com"
                  keyboardType="email-address"
                  error={resetError}
                  returnKeyType="done"
                  onSubmitEditing={handleSendReset}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, !validateEmail(resetEmail) && styles.submitBtnDisabled]}
                onPress={handleSendReset}
                activeOpacity={0.85}
              >
                <Text style={[styles.submitBtnText, !validateEmail(resetEmail) && styles.submitBtnTextDisabled]}>
                  재설정 링크 보내기
                </Text>
              </TouchableOpacity>

              <View style={styles.signupRow}>
                <TouchableOpacity onPress={goBackToLogin}>
                  <Text style={styles.signupLink}>로그인으로 돌아가기</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34, marginTop: -2 },
  topBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.textPrimary },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 4 },

  welcomeSection: { paddingVertical: 24 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  welcomeAvatar: { width: 44, height: 44, borderRadius: 22 },
  welcomeText: {
    flexShrink: 1, fontSize: 20, fontWeight: '800', color: Colors.textPrimary,
    lineHeight: 30, letterSpacing: -0.3,
  },

  form: { gap: 16, marginBottom: 8 },

  forgotRow: { alignItems: 'flex-end', marginBottom: 24 },
  forgotLink: { fontSize: 13, color: Colors.textSecondary, textDecorationLine: 'underline' },

  submitBtn: {
    height: 52, borderRadius: 14,
    backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  submitBtnDisabled: { backgroundColor: Colors.border },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.navBarIconActive },
  submitBtnTextDisabled: { color: Colors.textTertiary },

  signupRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  signupPrompt: { fontSize: 14, color: Colors.textTertiary },
  signupLink: { fontSize: 14, fontWeight: '700', color: Colors.navBar },

  /* 재설정 메일 발송 완료 */
  doneWrap: { alignItems: 'center', paddingTop: 40, gap: 4 },
  doneEmoji: { fontSize: 52, marginBottom: 12 },
  doneTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  doneDesc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
});
