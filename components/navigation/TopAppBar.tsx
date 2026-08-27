import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import { AppText as Text } from '@/components/AppText';
import { AppIcon } from '@/components/AppIcon';
import { Colors } from '@/constants/Colors';
import { languageStore } from '@/constants/languageStore';
import { fetchUnreadNotificationCount } from '@/constants/notifications';
import { SokDakLogo } from '@/components/icons/SokDakLogo';

/**
 * 탭 최상위 화면 공통 다크 헤더 — Figma Navigation/TopAppBar (375×44, bg Secondary).
 * - variant "home": 워드마크 로고 + 검색 + 알림 (Navigation/TopAppBar/Home 626:3288)
 * - variant "title": 가운데 타이틀 + 알림 (Navigation/TopAppBar/Default 645:3307)
 * 읽지 않은 알림 뱃지 상태(포커스 시 재조회)는 네 개 탭 화면이 전부 복붙하던 로직이라
 * 여기서 소유한다. 서브 화면의 back/post/write 헤더는 이 컴포넌트 범위 밖(별도 패턴 유지).
 */
export function TopAppBar({ variant, title }: { variant: 'home' | 'title'; title?: string }) {
  const t = languageStore.t;
  const [hasUnread, setHasUnread] = useState(false);

  useFocusEffect(useCallback(() => {
    fetchUnreadNotificationCount().then(count => setHasUnread(count > 0));
  }, []));

  const bell = (
    <View style={styles.iconBtn}>
      <AppIcon
        icon={Bell}
        size={22}
        color={Colors.navBarIconActive}
        onPress={() => router.push('/notifications')}
        accessibilityLabel={t('a11yOpenNotifications')}
      />
      {/* 색뿐 아니라 별도 점 요소로 전달되는 미확인 상태 — 스크린리더에는 라벨로 노출 */}
      {hasUnread && <View style={styles.notifDot} accessibilityElementsHidden />}
    </View>
  );

  if (variant === 'home') {
    return (
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.logoBtn}
          onPress={() => router.push('/tabs')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="SokDak"
        >
          <SokDakLogo width={83} />
        </TouchableOpacity>
        <View style={styles.topBarIcons}>
          {/* 다크 헤더 위라 기본 gray-600 대신 밝은색으로 대비 확보 */}
          <AppIcon
            icon={Search}
            size={22}
            color={Colors.navBarIconActive}
            style={styles.iconBtn}
            onPress={() => router.push('/search')}
            accessibilityLabel={t('a11yOpenSearch')}
          />
          {bell}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.topBar, styles.topBarCentered]}>
      <Text style={styles.topBarTitle}>{title}</Text>
      <View style={styles.bellAbsolute}>{bell}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 6,
    backgroundColor: Colors.navBar,
  },
  topBarCentered: { justifyContent: 'center', paddingLeft: 0, paddingRight: 0 },
  topBarTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  logoBtn: { height: 44, justifyContent: 'center' },
  topBarIcons: { flexDirection: 'row' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bellAbsolute: { position: 'absolute', right: 6 },
  /* Figma: data-badge="on" — 벨 아이콘 우측 상단 알림 점 */
  notifDot: {
    position: 'absolute', top: 10, right: 12,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.error,
  },
});
