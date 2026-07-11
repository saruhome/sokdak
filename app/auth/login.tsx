import {
  StyleSheet, Text, View, SafeAreaView,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { authStore } from '../../constants/authStore';

/** Figma: Continue with Facebook/Google/Apple / Centre / Fixed */
function SocialButton({
  emoji, label, bg, border, textColor, onPress,
}: {
  emoji: string; label: string;
  bg: string; border: string; textColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.socialBtn, { backgroundColor: bg, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.socialBtnEmoji}>{emoji}</Text>
      <Text style={[styles.socialBtnLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function LoginScreen() {
  const handleSocialLogin = (provider: string) => {
    authStore.login({
      name: '속닥 유저',
      email: `user@${provider.toLowerCase()}.com`,
      emoji: provider === 'Facebook' ? '🇫🇷'
           : provider === 'Google'   ? '🇺🇸'
           : '🍎',
    });
    router.back();
  };

  const handleEmailLogin = () => {
    router.push('/auth/email-login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Controls/Icon/Back ── */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 로고 섹션 ── Figma: "SOK-DAK" + 태그라인 */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>SOK-DAK</Text>
          <Text style={styles.logoTagline}>속닥속닥 배우는 교과서에는 없던 진짜 국어</Text>
        </View>

        {/* ── 캐릭터 일러스트 ── Figma: Character/짹이/Default + Character/호랭/Default */}
        <View style={styles.characterSection}>
          {/* 짹이 (여우 캐릭터) */}
          <View style={styles.charWrap}>
            <View style={[styles.charCircle, { backgroundColor: '#F5A623' }]}>
              <Text style={styles.charEmoji}>🦊</Text>
            </View>
            <View style={[styles.charBubble, { right: -8 }]}>
              <Text style={styles.charBubbleText}>안녕!</Text>
            </View>
          </View>

          {/* 중앙 간격 */}
          <View style={styles.charGap} />

          {/* 호랭 (호랑이 캐릭터) */}
          <View style={styles.charWrap}>
            <View style={[styles.charBubble, { left: -8 }]}>
              <Text style={styles.charBubbleText}>반가워!</Text>
            </View>
            <View style={[styles.charCircle, { backgroundColor: '#52514E' }]}>
              <Text style={styles.charEmoji}>🐯</Text>
            </View>
          </View>
        </View>

        {/* ── 소셜 로그인 버튼 ── Figma: Continue with Facebook/Google/Apple */}
        <View style={styles.socialSection}>
          <SocialButton
            emoji="f"
            label="Log In with Facebook"
            bg="#1877F2"
            border="#1877F2"
            textColor="#fff"
            onPress={() => handleSocialLogin('Facebook')}
          />
          <SocialButton
            emoji="G"
            label="Log In with Google"
            bg="#fff"
            border="#DADCE0"
            textColor="#3C4043"
            onPress={() => handleSocialLogin('Google')}
          />
          <SocialButton
            emoji=""
            label="Log In with Apple"
            bg="#000"
            border="#000"
            textColor="#fff"
            onPress={() => handleSocialLogin('Apple')}
          />

          {/* 이메일로 로그인 */}
          <TouchableOpacity style={styles.emailLoginBtn} onPress={handleEmailLogin}>
            <Text style={styles.emailLoginText}>이메일로 로그인</Text>
          </TouchableOpacity>
        </View>

        {/* ── 회원가입 링크 ── Figma: "계정이 없으신가요? 회원가입" */}
        <View style={styles.signupRow}>
          <Text style={styles.signupPrompt}>계정이 없으신가요?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupLink}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topRow: { height: 44, justifyContent: 'center' },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },

  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  /* ── 로고 ── */
  logoSection: { alignItems: 'center', marginTop: 8, marginBottom: 28, gap: 6 },
  logoText: {
    fontSize: 36, fontWeight: '900', color: Colors.textPrimary,
    letterSpacing: 4,
  },
  logoTagline: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  /* ── 캐릭터 ── */
  characterSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 36,
    height: 120,
  },
  charWrap: { alignItems: 'center', position: 'relative' },
  charCircle: {
    width: 86, height: 86, borderRadius: 43,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  charEmoji: { fontSize: 46 },
  charBubble: {
    position: 'absolute', top: -8,
    backgroundColor: Colors.surface,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  charBubbleText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  charGap: { width: 32 },

  /* ── 소셜 버튼 ── */
  socialSection: { gap: 12, marginBottom: 20 },
  socialBtn: {
    height: 50, borderRadius: 12, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10,
  },
  socialBtnEmoji: { fontSize: 18, width: 24, textAlign: 'center', fontWeight: '800' },
  socialBtnLabel: { fontSize: 15, fontWeight: '600' },

  emailLoginBtn: { alignItems: 'center', paddingVertical: 12 },
  emailLoginText: {
    fontSize: 14, color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },

  /* ── 회원가입 링크 ── */
  signupRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, marginTop: 4,
  },
  signupPrompt: { fontSize: 14, color: Colors.textTertiary },
  signupLink: { fontSize: 14, fontWeight: '700', color: Colors.navBar },
});
