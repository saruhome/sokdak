import {
  StyleSheet, View, Image, SafeAreaView,
  TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { BackIcon, FacebookLogo, GoogleLogo, AppleLogo } from '@/components/icons/SocialIcons';

const AVATAR_JJAEKI = require('../../assets/characters/jjaeki-full.png');
const AVATAR_HORANG = require('../../assets/characters/horang-full.png');

/** Figma: Continue with Facebook/Google/Apple / Centre / Fixed */
function SocialButton({
  icon, label, bg, textColor, shadow, onPress,
}: {
  icon: React.ReactNode; label: string;
  bg: string; textColor: string; shadow?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.socialBtn, { backgroundColor: bg }, shadow && styles.socialBtnShadow]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon}
      <Text style={[styles.socialBtnLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Figma node 1288:16671(속닥 Sokdak) — 로그인 페이지
 *  소셜 로그인(Facebook/Google/Apple)은 Supabase 쪽 OAuth 프로바이더 설정(클라이언트 ID·
 *  리다이렉트 URI 등)이 별도로 필요해 이번 백엔드 연동 범위 밖 — 실제 인증은 이메일 로그인으로. */
export default function LoginScreen() {
  const handleSocialLogin = (provider: string) => {
    Alert.alert(`${provider} 로그인`, '소셜 로그인은 준비 중이에요. 이메일로 로그인해주세요.');
  };

  const handleEmailLogin = () => {
    router.push('/auth/email-login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Controls/Icon/Back ── */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <BackIcon size={24} color={Colors.navBar} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 로고 섹션 ── */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>SOK-DAK</Text>
          <Text style={styles.logoTagline}>속닥속닥 배우는{'\n'}교과서에는 없던 진짜국어</Text>
        </View>

        {/* ── 캐릭터 일러스트 ── Figma: Character/짹이/Default + Character/호랭/Default */}
        <View style={styles.characterSection}>
          <Image source={AVATAR_JJAEKI} style={styles.jjaekiImg} resizeMode="contain" />
          <Image source={AVATAR_HORANG} style={styles.horangImg} resizeMode="contain" />
        </View>

        {/* ── 소셜 로그인 버튼 ── Figma: Continue with Facebook/Google/Apple */}
        <View style={styles.socialSection}>
          <SocialButton
            icon={<FacebookLogo size={20} />}
            label="Log In with Facebook"
            bg="#1877F2"
            textColor="#fff"
            onPress={() => handleSocialLogin('Facebook')}
          />
          <SocialButton
            icon={<GoogleLogo size={20} />}
            label="Log In with Google"
            bg="#fff"
            textColor="rgba(0,0,0,0.54)"
            shadow
            onPress={() => handleSocialLogin('Google')}
          />
          <SocialButton
            icon={<AppleLogo size={20} />}
            label="Log In with Apple"
            bg="#000"
            textColor="#fff"
            shadow
            onPress={() => handleSocialLogin('Apple')}
          />

          {/* 이메일로 로그인 */}
          <TouchableOpacity style={styles.emailLoginBtn} onPress={handleEmailLogin}>
            <Text style={styles.emailLoginText}>이메일로 로그인</Text>
          </TouchableOpacity>
        </View>

        {/* ── 회원가입 링크 ── */}
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
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 14 },

  scroll: { paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },

  /* ── 로고 ── */
  logoSection: { alignItems: 'center', marginTop: 8, gap: 16 },
  logoText: {
    fontSize: 32, fontWeight: '600', color: Colors.navBar,
    lineHeight: 36, textAlign: 'center',
  },
  logoTagline: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, fontFamily: undefined },

  /* ── 캐릭터 ── */
  characterSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 32,
    gap: 11,
    height: 158,
  },
  jjaekiImg: { width: 69, height: 91, transform: [{ scaleX: -1 }] },
  horangImg: { width: 102, height: 158 },

  /* ── 소셜 버튼 ── */
  socialSection: { width: '100%', maxWidth: 282, alignSelf: 'center', marginTop: 40, gap: 16 },
  socialBtn: {
    height: 44, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12,
  },
  socialBtnShadow: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17, shadowRadius: 1.5, elevation: 2,
  },
  socialBtnLabel: { fontSize: 16, fontWeight: '500', fontFamily: undefined },

  emailLoginBtn: { alignItems: 'center', paddingTop: 4 },
  emailLoginText: { fontSize: 14, color: Colors.textTertiary, fontFamily: undefined },

  /* ── 회원가입 링크 ── */
  signupRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, marginTop: 32,
  },
  signupPrompt: { fontSize: 14, color: Colors.textTertiary, fontFamily: undefined },
  signupLink: { fontSize: 14, fontWeight: '600', color: Colors.navBar, textDecorationLine: 'underline' },
});
