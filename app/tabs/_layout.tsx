import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, type ReactNode } from 'react';
import { Colors } from '../../constants/Colors';
import { TabIcon, type TabIconName } from '@/components/icons/TabIcon';
import { languageStore } from '../../constants/languageStore';

/** 하단 탭은 화면 공간을 확보하기 위해 아이콘과 접근성 title만 사용한다. */
export function TabBarIcon({ name, focused }: { name: TabIconName; focused: boolean }) {
  return (
    <View style={styles.tabContent}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <TabIcon name={name} size={22} color={focused ? Colors.navBarIconActive : Colors.navBarIconMuted} />
      </View>
    </View>
  );
}

function DoubleTapTabButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  rootRoute,
}: {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityState?: { selected?: boolean };
  accessibilityLabel?: string;
  rootRoute: string;
}) {
  const router = useRouter();
  const [lastPress, setLastPress] = useState<number>(0);

  const handlePress = () => {
    const now = Date.now();
    if (accessibilityState?.selected && now - lastPress < 400) {
      router.replace(rootRoute);
    }
    setLastPress(now);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.tabButton}
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </TouchableOpacity>
  );
}

const ROOT_TAB_ROUTE: Record<string, string> = {
  index: '/tabs',
  category: '/tabs/category',
  dictionary: '/tabs/dictionary',
  community: '/tabs/community',
  mypage: '/tabs/mypage',
};

export default function TabLayout() {
  /* iOS 홈 인디케이터(및 안드로이드 제스처 바) 영역만큼 탭바를 키워 아이콘이 가려지지 않게 —
   * 웹은 inset 0이라 기존 49px 그대로 */
  const insets = useSafeAreaInsets();
  /* 언어 변경 시 탭 title 재렌더용 — 값 자체는 languageStore.t가 직접 읽는다 */
  const [, setLanguage] = useState(languageStore.getLanguage());

  useEffect(() => {
    languageStore.initialize().then(() => setLanguage(languageStore.getLanguage()));
    const unsub = languageStore.subscribe(setLanguage);
    return () => unsub();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.navBar,      // #52514E 다크 올리브 그레이
          borderTopWidth: 0,
          height: 49 + insets.bottom,          // Figma Navigation/BottomBar height + 기기 하단 inset
          paddingBottom: insets.bottom,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor:   Colors.navBarIconActive,  // #F6F2EA — Figma는 활성/비활성 라벨색 동일
        tabBarInactiveTintColor: Colors.navBarIconActive,
      }}
    >
      {/* 1. 홈 */}
      <Tabs.Screen
        name="index"
        options={({ route }) => ({
          title: languageStore.t('home'),
          tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
          tabBarButton: props => (
            <DoubleTapTabButton {...props as any} rootRoute={ROOT_TAB_ROUTE.index} />
          ),
        })}
      />

      {/* 2. 카테고리 */}
      <Tabs.Screen
        name="category"
        options={({ route }) => ({
          title: languageStore.t('category'),
          tabBarIcon: ({ focused }) => <TabBarIcon name="category" focused={focused} />,
          tabBarButton: props => (
            <DoubleTapTabButton {...props as any} rootRoute={ROOT_TAB_ROUTE.category} />
          ),
        })}
      />

      {/* 3. 사전 */}
      <Tabs.Screen
        name="dictionary"
        options={({ route }) => ({
          title: languageStore.t('dictionary'),
          tabBarIcon: ({ focused }) => <TabBarIcon name="dictionary" focused={focused} />,
          tabBarButton: props => (
            <DoubleTapTabButton {...props as any} rootRoute={ROOT_TAB_ROUTE.dictionary} />
          ),
        })}
      />

      {/* 4. 커뮤니티 */}
      <Tabs.Screen
        name="community"
        options={({ route }) => ({
          title: languageStore.t('community'),
          tabBarIcon: ({ focused }) => <TabBarIcon name="community" focused={focused} />,
          tabBarButton: props => (
            <DoubleTapTabButton {...props as any} rootRoute={ROOT_TAB_ROUTE.community} />
          ),
        })}
      />

      {/* 5. 마이페이지 */}
      <Tabs.Screen
        name="mypage"
        options={({ route }) => ({
          title: languageStore.t('mypage'),
          tabBarIcon: ({ focused }) => <TabBarIcon name="mypage" focused={focused} />,
          tabBarButton: props => (
            <DoubleTapTabButton {...props as any} rootRoute={ROOT_TAB_ROUTE.mypage} />
          ),
        })}
      />
    </Tabs>
  );
}

const styles = {
  tabContent: { alignItems: 'center', justifyContent: 'center' } as const,
  iconWrap: {
    width: 44, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  } as const,
  iconWrapActive: {
    backgroundColor: Colors.textPrimary,   // #333333 — Figma BottomBar active pill과 동일 토큰
  } as const,
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
};
