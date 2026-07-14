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

const JJAEKI_AVATAR = require('../../../assets/characters/jjaeki.png');

/** Figma: 5-1.마이페이지 와이어프레임 — 내 정보 관리 / 저장한 단어 / 자주 묻는 질문 / 운영진에게 */
const MAIN_MENU = [
  { label: '내 정보 관리',   emoji: '⚙️', route: '/tabs/mypage/profile' },
  { label: '저장한 단어',    emoji: '📌', route: '/tabs/mypage/saved' },
  { label: '자주 묻는 질문', emoji: '❓', route: '/tabs/mypage/support' },
  { label: '운영진에게',     emoji: '💡', route: '/tabs/mypage/suggest' },
];

export default function MyPageScreen() {
  const [loggedIn, setLoggedIn] = useState(authStore.isLoggedIn());
  const [savedCount, setSavedCount] = useState(authStore.getSavedWordIds().length);
  const [likedCount, setLikedCount] = useState(authStore.getLikedPostIds().length);
  const user = authStore.getUser();

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
    return () => { unsub(); unsubBookmarks(); };
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
        <Text style={styles.topBarTitle}>마이페이지</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/tabs/mypage/settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* ── 프로필 + 통계 ── Figma: 5-1.마이페이지-2 와이어프레임 */}
        <TouchableOpacity
          style={styles.profileRow}
          onPress={!loggedIn ? () => router.push('/auth/login') : undefined}
          activeOpacity={loggedIn ? 1 : 0.75}
        >
          <View style={[styles.avatar, !loggedIn && styles.avatarGuest]}>
            <Text style={styles.avatarText}>
              {loggedIn && user ? user.emoji : '👤'}
            </Text>
          </View>
          {loggedIn ? (
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/tabs/mypage/saved')}
              >
                <Text style={styles.statValue}>{savedCount}</Text>
                <Text style={styles.statLabel}>저장한 단어</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/tabs/mypage/my-posts')}
              >
                <Text style={styles.statValue}>{likedCount}</Text>
                <Text style={styles.statLabel}>좋아요 한 글</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>로그인이 필요해요</Text>
              <Text style={styles.profileEmail}>탭하여 로그인 →</Text>
            </View>
          )}
        </TouchableOpacity>
        {loggedIn && user && (
          <Text style={styles.profileNameBar}>{user.name}</Text>
        )}

        {/* ── 비로그인 배너 ── Figma: 로그인 전 상태 */}
        {!loggedIn && (
          <TouchableOpacity
            style={styles.loginBanner}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.85}
          >
            <View style={styles.loginBannerLeft}>
              <Image source={JJAEKI_AVATAR} style={styles.loginBannerAvatar} resizeMode="cover" />
              <View>
                <Text style={styles.loginBannerTitle}>속닥과 함께 시작해요!</Text>
                <Text style={styles.loginBannerSub}>로그인하면 단어 저장·커뮤니티 이용 가능</Text>
              </View>
            </View>
            <Text style={styles.loginBannerArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── 메인 메뉴 (플랫 4항목) ── Figma: 5-1.마이페이지 와이어프레임 */}
        <View style={styles.section}>
          <View style={styles.menuGroup}>
            {MAIN_MENU.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  i < MAIN_MENU.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => loggedIn
                  ? router.push(item.route as any)
                  : router.push('/auth/login')
                }
              >
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>이용약관</Text>
          </TouchableOpacity>
          <Text style={styles.footerDot}>·</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>개인정보처리방침</Text>
          </TouchableOpacity>
        </View>

        {/* ── Controls/Buttons/Text Button_02 (320×52) ── 로그인/로그아웃 */}
        {loggedIn ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>로그인하기</Text>
          </TouchableOpacity>
        )}

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
  settingsIcon: { fontSize: 18 },
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
  menuEmoji: { fontSize: 18, width: 26 },
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
