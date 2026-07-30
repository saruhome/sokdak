import {
  StyleSheet, View, Image, SafeAreaView,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { safeGoBack } from '../../constants/navigation';
import { BackIcon } from '@/components/icons/SocialIcons';
import { SokDakLogo } from '@/components/icons/SokDakLogo';

const AVATAR_JJAEKI = require('../../assets/characters/jjaeki-full.png');
const AVATAR_HORANG = require('../../assets/characters/horang-full.png');

/** Figma node 1288:16671(속닥 Sokdak) — 로그인 페이지
 *  소셜 로그인(Facebook/Google/Apple)은 Supabase 쪽 OAuth 프로바이더 설정(클라이언트 ID·
 *  리다이렉트 URI 등)이 별도로 필요해 이번 백엔드 연동 범위 밖이라 일단 숨김 — 실제 인증은 이메일 로그인으로. */
export default function LoginScreen() {
  const handleEmailLogin = () => {
    router.push('/auth/email-login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Controls/Icon/Back ── */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
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
          <SokDakLogo width={200} color={Colors.navBar} />
          <Text style={styles.logoTagline}>속닥속닥 배우는{'\n'}교과서에는 없던 진짜국어</Text>
        </View>

        {/* ── 캐릭터 일러스트 ── Figma: Character/짹이/Default + Character/호랭/Default */}
        <View style={styles.characterSection}>
          <Image source={AVATAR_JJAEKI} style={styles.jjaekiImg} resizeMode="contain" />
          <Image source={AVATAR_HORANG} style={styles.horangImg} resizeMode="contain" />
        </View>

        {/* 소셜 로그인(Facebook/Google/Apple)은 일단 숨김 — 이메일 로그인만 남긴다 */}
        <View style={styles.socialSection}>
          <TouchableOpacity style={styles.emailLoginBtn} onPress={handleEmailLogin} activeOpacity={0.85}>
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

  socialSection: { width: '100%', maxWidth: 282, alignSelf: 'center', marginTop: 40, gap: 16 },

  emailLoginBtn: {
    height: 44, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  emailLoginText: { fontSize: 16, fontWeight: '500', color: Colors.navBar, fontFamily: undefined },

  /* ── 회원가입 링크 ── */
  signupRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, marginTop: 32,
  },
  signupPrompt: { fontSize: 14, color: Colors.textTertiary, fontFamily: undefined },
  signupLink: { fontSize: 14, fontWeight: '600', color: Colors.navBar, textDecorationLine: 'underline' },
});
