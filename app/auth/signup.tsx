import {
  StyleSheet, View, Image, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';

const JJAEKI_AVATAR = require('../../assets/characters/jjaeki.png');

/* ── List/Item/Log up (327×48) 재사용 컴포넌트 ── */
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

/* ── Icon/checkBox 컴포넌트 ── */
function Checkbox({ checked, onToggle, label, required }: {
  checked: boolean; onToggle: () => void;
  label: string; required?: boolean;
}) {
  return (
    <TouchableOpacity style={cb.row} onPress={onToggle} activeOpacity={0.7}>
      <View style={[cb.box, checked && cb.boxChecked]}>
        {checked && <Text style={cb.check}>✓</Text>}
      </View>
      <Text style={cb.label}>{label}</Text>
      {required && <Text style={cb.required}>(필수)</Text>}
    </TouchableOpacity>
  );
}

const cb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  boxChecked: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  check: { fontSize: 13, color: '#fff', fontWeight: '800' },
  label: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  required: { fontSize: 12, color: Colors.error, fontWeight: '600' },
});

/* ── 유효성 검사 헬퍼 ── */
function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function SignupScreen() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [terms, setTerms]       = useState(false);
  const [privacy, setPrivacy]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* 각 필드 오류 메시지 (submit 시도 후에만 표시) */
  const errors = submitted ? {
    nickname: nickname.trim().length < 2 ? '닉네임은 2자 이상 입력해주세요.' : undefined,
    email: !validateEmail(email) ? '올바른 이메일 형식을 입력해주세요.' : undefined,
    password: password.length < 8 ? '비밀번호는 8자 이상이어야 해요.' : undefined,
    confirm: password !== confirm ? '비밀번호가 일치하지 않아요.' : undefined,
  } : { nickname: undefined, email: undefined, password: undefined, confirm: undefined };

  const isValid = nickname.trim().length >= 2 && validateEmail(email)
    && password.length >= 8 && password === confirm
    && terms && privacy;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) return;
    Alert.alert(
      '가입 완료! 🎉',
      `${nickname}님, 속닥에 오신 걸 환영해요!\n로그인 후 이용해주세요.`,
      [{ text: '로그인하러 가기', onPress: () => router.replace('/auth/login') }],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ── TopAppBar ── Figma: Navigation/TopAppBar/Default/Default */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>회원가입</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 환영 텍스트 ── Figma: "반가워요! 속닥 과 함께 진짜 한국어를 배워봐요." */}
          <View style={[styles.welcomeSection, styles.welcomeRow]}>
            <Image source={JJAEKI_AVATAR} style={styles.welcomeAvatar} resizeMode="cover" />
            <Text style={styles.welcomeText}>
              반가워요!{'\n'}속닥 과 함께 진짜 한국어를{'\n'}배워봐요.
            </Text>
          </View>

          {/* ── 입력 폼 ── Figma: List/Item/Log up (327×48) × 4 */}
          <View style={styles.form}>
            <FormField
              label="닉네임"
              value={nickname}
              onChangeText={setNickname}
              placeholder="2자 이상 입력해주세요"
              helper="다른 사용자에게 표시되는 이름이에요."
              error={errors.nickname}
              returnKeyType="next"
            />
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
              placeholder="8자 이상"
              secureTextEntry
              error={errors.password}
              returnKeyType="next"
            />
            <FormField
              label="비밀번호 확인"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="비밀번호를 다시 입력해주세요"
              secureTextEntry
              error={errors.confirm}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {/* ── 약관 동의 체크박스 ── Figma: Icon/checkBox */}
          <View style={styles.termsSection}>
            <Checkbox
              checked={terms}
              onToggle={() => setTerms(p => !p)}
              label="이용약관에 동의합니다."
              required
            />
            <Checkbox
              checked={privacy}
              onToggle={() => setPrivacy(p => !p)}
              label="개인정보 처리방침에 동의합니다."
              required
            />
            {submitted && (!terms || !privacy) && (
              <Text style={styles.termsError}>필수 약관에 모두 동의해주세요.</Text>
            )}
          </View>

          {/* ── 가입하기 버튼 ── Figma: Controls/Buttons/Text Button_02 (320×52) */}
          <TouchableOpacity
            style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={[styles.submitBtnText, !isValid && styles.submitBtnTextDisabled]}>
              가입하기
            </Text>
          </TouchableOpacity>

          {/* ── 로그인 링크 ── Figma: "이미 계정이 있나요? 로그인" */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>이미 계정이 있나요?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
          </View>
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

  /* 환영 */
  welcomeSection: { paddingVertical: 24 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  welcomeAvatar: { width: 44, height: 44, borderRadius: 22 },
  welcomeText: {
    flexShrink: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary,
    lineHeight: 32, letterSpacing: -0.3,
  },

  /* 폼 */
  form: { gap: 16, marginBottom: 24 },

  /* 약관 */
  termsSection: { gap: 12, marginBottom: 28 },
  termsError: { fontSize: 11, color: Colors.error, marginTop: 2 },

  /* 가입 버튼 (Controls/Buttons/Text Button_02 320×52) */
  submitBtn: {
    height: 52, borderRadius: 14,
    backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  submitBtnDisabled: { backgroundColor: Colors.border },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.navBarIconActive },
  submitBtnTextDisabled: { color: Colors.textTertiary },

  /* 로그인 링크 */
  loginRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  loginPrompt: { fontSize: 14, color: Colors.textTertiary },
  loginLink: { fontSize: 14, fontWeight: '700', color: Colors.navBar },
});
