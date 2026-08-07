import {
  StyleSheet, View, SafeAreaView,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Colors } from '../../../constants/Colors';
import { authStore } from '../../../constants/authStore';
import { hasUnseenReply } from '../../../constants/support';
import { languageStore } from '../../../constants/languageStore';
import ProfileAvatar from '@/components/ProfileAvatar';
import { AppIcon } from '@/components/AppIcon';
import { ChevronRight, Crown, Flame } from 'lucide-react-native';

/** Figma: 5-1.마이페이지-2 와이어프레임(524:1871) — 저장한 단어 / 내 활동 / 자주 묻는 질문 / 제안하기.
 *  내 정보 관리는 별도 메뉴가 아니라 프로필 행(›)으로 진입. */
const ACTIVITY_MENU = [
  { key: 'favoritesLabel', route: '/tabs/mypage/saved' },
  { key: 'myActivity', route: '/tabs/mypage/my-posts' },
  { key: 'suggestNewSlang', route: '/tabs/mypage/suggest' },
] as const;

export default function MyPageScreen() {
  const [loggedIn, setLoggedIn] = useState(authStore.isLoggedIn());
  const [savedCount, setSavedCount] = useState(authStore.getSavedWordIds().length);
  const [likedCount, setLikedCount] = useState(authStore.getLikedPostIds().length);
  const [isPremium, setIsPremium] = useState(authStore.isPremium());
  const [streakCount, setStreakCount] = useState(authStore.getStreakCount());
  const [hasUnseenTicketReply, setHasUnseenTicketReply] = useState(false);
  const [language, setLanguage] = useState(languageStore.getLanguage());
  const user = authStore.getUser();
  const t = (key: Parameters<typeof languageStore.t>[0]) => languageStore.t(key);

  /* 화면 포커스 때마다 로그인 상태 갱신 */
  useFocusEffect(
    useCallback(() => {
      setLoggedIn(authStore.isLoggedIn());
      setSavedCount(authStore.getSavedWordIds().length);
      setLikedCount(authStore.getLikedPostIds().length);
      setIsPremium(authStore.isPremium());
      setStreakCount(authStore.getStreakCount());
      if (authStore.isLoggedIn()) hasUnseenReply().then(setHasUnseenTicketReply);
    }, []),
  );

  /* 스토어 변경 구독 */
  useEffect(() => {
    const unsub = authStore.subscribe(loggedIn => {
      setLoggedIn(loggedIn);
      setIsPremium(authStore.isPremium());
      setStreakCount(authStore.getStreakCount());
    });
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
      {/* TopAppBar — Figma: 마이페이지 루트는 뒤로가기 없이 진한 올리브 배경(navBar) */}
      <View style={styles.topBar}>
        <View style={styles.backBtn} />
        <Text style={styles.topBarTitle}>{t('mypage')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => router.push(loggedIn ? '/tabs/mypage/profile' : '/auth/login')}
          activeOpacity={0.75}
        >
          <View style={styles.profileRowLeft}>
            <ProfileAvatar
              uri={loggedIn ? user?.avatarUrl : null}
              emoji={loggedIn && user ? user.emoji : '👤'}
              size={40}
            />
            <Text style={styles.profileName}>{loggedIn && user ? user.name : t('loginNeeded')}</Text>
          </View>
          <AppIcon icon={ChevronRight} size={20} color={Colors.textTertiary} />
        </TouchableOpacity>

        {loggedIn && (
          <TouchableOpacity
            style={[styles.premiumRow, isPremium && styles.premiumRowActive]}
            onPress={() => router.push('/tabs/mypage/premium')}
            activeOpacity={0.85}
          >
            <View style={styles.premiumRowLeft}>
              <AppIcon icon={Crown} size={20} color={isPremium ? Colors.premium : Colors.navBarIconMuted} />
              <Text style={[styles.premiumRowLabel, isPremium && styles.premiumRowLabelActive]}>
                {isPremium ? t('premiumActiveLabel') : t('premiumUpgradeCta')}
              </Text>
            </View>
            {streakCount > 0 && (
              <View style={styles.streakChip}>
                <AppIcon icon={Flame} size={13} color={Colors.point1} />
                <Text style={styles.streakChipText}>{streakCount}{t('streakDaysSuffix')}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.sectionHeader}>{t('activity')}</Text>
        <View style={styles.activityCards}>
          {ACTIVITY_MENU.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.groupRow,
                i === 0 && styles.groupRowFirst,
                i === ACTIVITY_MENU.length - 1 && styles.groupRowLast,
              ]}
              onPress={() => loggedIn ? router.push(item.route) : router.push('/auth/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.groupRowLabel} numberOfLines={1} ellipsizeMode="tail">
                {languageStore.t(item.key)}
              </Text>
              <AppIcon icon={ChevronRight} size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>{t('settings')}</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/tabs/mypage/notifications')}
            activeOpacity={0.85}
          >
            <Text style={styles.groupRowLabel} numberOfLines={1} ellipsizeMode="tail">
              {t('notifications')}
            </Text>
            <AppIcon icon={ChevronRight} size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/tabs/mypage/settings/language')}
            activeOpacity={0.85}
          >
            <Text style={styles.groupRowLabel} numberOfLines={1} ellipsizeMode="tail">
              {language === 'en' ? 'English' : '한국어'}
            </Text>
            <AppIcon icon={ChevronRight} size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.supportRow} onPress={() => router.push('/tabs/mypage/support')} activeOpacity={0.8}>
          <Text style={styles.supportLabel}>{t('customerService')}</Text>
          {hasUnseenTicketReply && <View style={styles.supportDot} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* Figma: 마이페이지 루트 TopAppBar — 뒤로가기 없이 navBar 배경 */
  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.navBar,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },

  /* 프로필 행 — 눌러서 내 정보 관리로 진입 */
  profileRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 56, paddingHorizontal: 16,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  profileRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileName: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },

  /* 프리미엄 상태/업그레이드 행 */
  premiumRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 52, paddingHorizontal: 16, marginTop: 10,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  premiumRowActive: { backgroundColor: Colors.premium + '12', borderColor: Colors.premium },
  premiumRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  premiumRowLabel: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  premiumRowLabelActive: { color: Colors.premium },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
    backgroundColor: Colors.point1 + '15',
  },
  streakChipText: { fontSize: 12, fontWeight: '700', color: Colors.point1 },

  sectionHeader: {
    fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary,
    marginTop: 24, marginBottom: 12,
  },

  /* 활동 3항목 — 하나의 카드로 병합(첫/끝만 라운드, 내부 구분선은 다음 행의 top border) */
  activityCards: {},
  groupRow: {
    height: 48, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderColor: Colors.border,
  },
  groupRowFirst: { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  groupRowLast: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderBottomWidth: 1 },
  groupRowLabel: { fontSize: 16, color: Colors.textSecondary, fontFamily: undefined },

  /* 설정 2항목 — 각각 독립된 카드 */
  settingsGroup: { gap: 8 },
  settingRow: {
    height: 48, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },

  supportRow: { marginTop: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  supportLabel: { fontSize: 16, color: Colors.textSecondary, fontFamily: undefined },
  supportDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.error },

  logoutBtn: {
    marginTop: 12, height: 48, borderRadius: 10,
    backgroundColor: Colors.divider, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 1,
  },
  logoutText: { fontSize: 16, color: Colors.textSecondary, fontFamily: undefined },
});
