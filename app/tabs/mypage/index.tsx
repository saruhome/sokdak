import {
  StyleSheet, View, Image, SafeAreaView,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Colors } from '../../../constants/Colors';
import { authStore } from '../../../constants/authStore';
import { languageStore } from '../../../constants/languageStore';

const JJAEKI_AVATAR = require('../../../assets/characters/jjaeki.png');

import { AppIcon } from '@/components/AppIcon';
import { Bookmark, FileText, HelpCircle, Lightbulb, Settings } from 'lucide-react-native';

/** Figma: 5-1.마이페이지-2 와이어프레임(524:1871) — 저장한 단어 / 내 활동 / 자주 묻는 질문 / 제안하기.
 *  내 정보 관리는 별도 메뉴가 아니라 프로필 행(›)으로 진입. */
const ACTIVITY_MENU = [
  { key: 'savedWords', route: '/tabs/mypage/saved' },
  { key: 'myActivity', route: '/tabs/mypage/my-posts' },
  { key: 'suggestNewSlang', route: '/tabs/mypage/suggest' },
] as const;

export default function MyPageScreen() {
  const [loggedIn, setLoggedIn] = useState(authStore.isLoggedIn());
  const [savedCount, setSavedCount] = useState(authStore.getSavedWordIds().length);
  const [likedCount, setLikedCount] = useState(authStore.getLikedPostIds().length);
  const [language, setLanguage] = useState(languageStore.getLanguage());
  const user = authStore.getUser();
  const t = (key: Parameters<typeof languageStore.t>[0]) => languageStore.t(key);

  /* 화면 포커스 때마다 로그인 상태 갱신 */
  useFocusEffect(
    useCallback(() => {
      setLoggedIn(authStore.isLoggedIn());
      setSavedCount(authStore.getSavedWordIds().length);
      setLikedCount(authStore.getLikedPostIds().length);
    }, []),
  );

  /* 스토어 변경 구독 */
  useEffect(() => {
    const unsub = authStore.subscribe(setLoggedIn);
    const unsubBookmarks = authStore.subscribeBookmarks(() => {
      setSavedCount(authStore.getSavedWordIds().length);
      setLikedCount(authStore.getLikedPostIds().length);
    });
    const unsubLanguage = languageStore.subscribe(setLanguage);
    languageStore.initialize().then(() => setLanguage(languageStore.getLanguage()));
    return () => { unsub(); unsubBookmarks(); unsubLanguage(); };
  }, []);

  const handleLogout = () => {
    authStore.logout();
    setLoggedIn(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar */}
      <View style={styles.topBar}>
        <View style={styles.backBtn} />
        <Text style={styles.topBarTitle}>{t('mypage')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll}>
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => router.push(loggedIn ? '/tabs/mypage/profile' : '/auth/login')}
          activeOpacity={0.75}
        >
          <View style={[styles.avatar, !loggedIn && styles.avatarGuest]}>
            <Text style={styles.avatarText}>
              {loggedIn && user ? user.emoji : '👤'}
            </Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileName}>{loggedIn && user ? user.name : t('loginNeeded')}</Text>
            <Text style={styles.profileEmail}>{loggedIn ? t('tapToLogin') : t('tapToLogin')}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>{t('activity')}</Text>
        </View>

        <View style={styles.activityCards}>
          {ACTIVITY_MENU.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.activityCard, i === ACTIVITY_MENU.length - 1 && styles.activityCardLast]}
              onPress={() => loggedIn ? router.push(item.route) : router.push('/auth/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.activityCardTitle} numberOfLines={1} ellipsizeMode="tail">
                {languageStore.t(item.key)}
              </Text>
              <Text style={styles.activityCardArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>{t('settings')}</Text>
        </View>

        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/tabs/mypage/notifications')}
            activeOpacity={0.85}
          >
            <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">
              {t('notifications')}
            </Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/tabs/mypage/settings/language')}
            activeOpacity={0.85}
          >
            <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">
              {language === 'en' ? 'English' : '한국어'}
            </Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.supportRow} onPress={() => router.push('/tabs/mypage/support')} activeOpacity={0.8}>
          <Text style={styles.supportLabel}>고객센터</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  scroll: { flex: 1 },

  /* Display/UserProfile — Figma: 5-1.마이페이지-2 와이어프레임 (아바타 + 통계) */
  profileRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12, gap: 20,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarGuest: { backgroundColor: Colors.border },
  avatarText: { fontSize: 34 },
  profileInfo: { gap: 3 },
  profileName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  profileEmail: { fontSize: 13, color: Colors.textTertiary },
  statsRow: { flex: 1, flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  profileNameBar: {
    fontSize: 15, fontWeight: '700', color: Colors.textPrimary,
    paddingHorizontal: 24, marginBottom: 12,
  },

  sectionHeaderRow: {
    marginTop: 24, marginHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 16, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 20, padding: 16,
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  profileInfoRow: {
    marginLeft: 16,
  },
  activityCards: {
    marginHorizontal: 16, gap: 12,
  },
  activityCard: {
    width: '100%', height: 48,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  activityCardLast: {},
  activityCardTitle: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  activityCardArrow: { fontSize: 18, color: Colors.border },
  settingsGroup: {
    marginHorizontal: 16, gap: 8, marginTop: 8,
  },
  settingRow: {
    width: '100%', height: 48,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  settingLabel: { fontSize: 14, color: Colors.textPrimary },
  settingArrow: { fontSize: 18, color: Colors.border },
  supportRow: {
    marginHorizontal: 16, marginTop: 24,
    paddingVertical: 16, alignItems: 'center',
  },
  supportLabel: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  logoutBtn: {
    marginHorizontal: 16, marginTop: 12, height: 48, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { fontSize: 15, color: Colors.textPrimary, fontWeight: '600' },

  /* 비로그인 배너 */
  loginBanner: {
    marginHorizontal: 16, marginBottom: 12, padding: 16,
    backgroundColor: Colors.navBar, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
  },
  loginBannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  loginBannerAvatar: { width: 40, height: 40, borderRadius: 20 },
  loginBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive },
  loginBannerSub: { fontSize: 12, color: Colors.navBarIconMuted, marginTop: 3 },
  loginBannerArrow: { fontSize: 22, color: Colors.navBarIconMuted },

  /* 메뉴 섹션 */
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, marginBottom: 6, paddingLeft: 4 },
  menuGroup: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuIconWrap: { width: 26 },
  menuLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  menuArrow: { fontSize: 18, color: Colors.border },

  /* 하단 링크 */
  footerLinks: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, marginTop: 20, marginBottom: 16,
  },
  footerLink: { fontSize: 12, color: Colors.textTertiary },
  footerDot: { fontSize: 12, color: Colors.border },

  /* Controls/Buttons/Text Button_02 (320×52) */
  logoutBtn: {
    marginHorizontal: 24, height: 52, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { fontSize: 15, color: Colors.error, fontWeight: '600' },
  loginBtn: {
    marginHorizontal: 24, height: 52, borderRadius: 12,
    backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center',
  },
  loginBtnText: { fontSize: 15, color: Colors.navBarIconActive, fontWeight: '700' },
});
