import { StyleSheet, View, Image, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';
import { safeGoBack } from '../../constants/navigation';
import { AppIcon } from '@/components/AppIcon';
import { User, Mail, Lock, Check, type LucideIcon } from 'lucide-react-native';
import { authStore } from '../../constants/authStore';
import { BackIcon } from '@/components/icons/SocialIcons';

const JJAEKI_AVATAR = require('../../assets/characters/jjaeki.png');

/* ── List/Item/Log up (327×48) 재사용 컴포넌트 — Figma 1293:20263: 라벨 없이 아이콘+플레이스홀더 */
function FormField({
  icon, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, helper, error,
  returnKeyType, onSubmitEditing,
}: {
  icon: LucideIcon; value: string;
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
      <View style={[ff.inputRow, focused && ff.inputFocused, !!error && ff.inputError]}>
        <AppIcon icon={icon} size={15} />
        <TextInput
          style={ff.input}
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
      </View>
      {helper && !error ? <Text style={ff.helper}>{helper}</Text> : null}
      {error ? <Text style={ff.error}>{error}</Text> : null}
    </View>
  );
}

const ff = StyleSheet.create({
  wrap: { gap: 4, marginBottom: 4 },
  inputRow: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, backgroundColor: Colors.surface,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary, padding: 0 },
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
        {checked && <AppIcon icon={Check} size={14} color="#fff" />}
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

  const [pending, setPending] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitted(true);
    setSignupError(null);
    if (!isValid) return;
    setPending(true);
    const { error, needsEmailConfirmation } = await authStore.signUp({
      email, password, nickname: nickname.trim(),
    });
    setPending(false);
    if (error) {
      setSignupError(
        error === 'User already registered'
          ? '이미 가입된 이메일이에요.'
          : error,
      );
      return;
    }
    if (needsEmailConfirmation) {
      Alert.alert(
        '가입 완료! 🎉',
        `${nickname}님, 속닥에 오신 걸 환영해요!\n'${email}'로 보낸 인증 메일을 확인한 뒤 로그인해주세요.`,
        [{ text: '로그인하러 가기', onPress: () => router.replace('/auth/login') }],
      );
    } else {
      // Confirm email 설정이 꺼져 있으면 가입 즉시 세션이 생겨 로그인 상태 — 바로 앱으로.
      router.replace('/tabs');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ── TopAppBar ── Figma node 1293:20263 — 다크 헤더 */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
            <BackIcon size={24} color={Colors.navBarIconActive} />
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
          {/* ── 환영 텍스트 ── Figma 1293:20263: "반가워요!" + "속닥(굵게) 과 함께 진짜 한국어를 배워봐요." (2줄) */}
          <View style={[styles.welcomeSection, styles.welcomeRow]}>
            <Image source={JJAEKI_AVATAR} style={styles.welcomeAvatar} resizeMode="cover" />
            <Text style={styles.welcomeText}>
              반가워요!{'\n'}<Text style={styles.welcomeTextBold}>속닥</Text> 과 함께 진짜 한국어를 배워봐요.
            </Text>
          </View>

          {/* ── 입력 폼 ── Figma: List/Item/Log up (327×48) × 4 */}
          <View style={styles.form}>
            <FormField
              icon={User}
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임"
              helper="다른 사용자에게 표시되는 이름이에요."
              error={errors.nickname}
              returnKeyType="next"
            />
            <FormField
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일"
              keyboardType="email-address"
              error={errors.email}
              returnKeyType="next"
            />
            <FormField
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              secureTextEntry
              error={errors.password}
              returnKeyType="next"
            />
            <FormField
              icon={Lock}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="비밀번호 확인"
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

          {signupError ? <Text style={styles.formError}>{signupError}</Text> : null}

          {/* ── 가입하기 버튼 ── Figma: Controls/Buttons/Text Button_02 (320×52) */}
          <TouchableOpacity
            style={[styles.submitBtn, (!isValid || pending) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={pending}
          >
            <Text style={[styles.submitBtnText, (!isValid || pending) && styles.submitBtnTextDisabled]}>
              {pending ? '가입 중…' : '회원가입'}
            </Text>
          </TouchableOpacity>

          {/* ── 로그인 링크 ── Figma: "이미 계정이 있나요? 로그인" */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>이미 계정이 있나요?</Text>
            <TouchableOpacity onPress={() => safeGoBack()}>
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
    paddingHorizontal: 8, backgroundColor: Colors.navBar,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.navBarIconActive },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 4 },

  /* 환영 */
  welcomeSection: { paddingVertical: 24 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  welcomeAvatar: { width: 44, height: 44, borderRadius: 22 },
  welcomeText: {
    flexShrink: 1, fontSize: 18, fontWeight: '400', color: Colors.textPrimary,
    lineHeight: 26, letterSpacing: -0.3,
  },
  welcomeTextBold: { fontWeight: '800' },

  /* 폼 */
  form: { gap: 16, marginBottom: 24 },

  /* 약관 */
  termsSection: { gap: 12, marginBottom: 28 },
  termsError: { fontSize: 11, color: Colors.error, marginTop: 2 },
  formError: { fontSize: 12, color: Colors.error, textAlign: 'center', marginBottom: 12 },

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
