import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Colors } from '../../constants/Colors';
import { TabIcon, type TabIconName } from '@/components/icons/TabIcon';
import { languageStore } from '../../constants/languageStore';
import { authStore } from '../../constants/authStore';

/**
 * Figma(Navigation/BottomBar.svg): 아이콘·라벨 색은 활성/비활성 상태와 무관하게
 * 항상 동일하고, 활성 탭만 배경 하이라이트(rounded pill, #333333)로 구분한다.
 */
function TabBarIcon({ name, focused }: { name: TabIconName; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <TabIcon name={name} size={22} color="#C5C5C5" />
    </View>
  );
}

function DoubleTapTabButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  rootRoute,
  requireAuth,
}: {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityState?: { selected?: boolean };
  rootRoute: string;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const [lastPress, setLastPress] = useState<number>(0);

  const handlePress = () => {
    if (requireAuth && !authStore.isLoggedIn()) {
      router.push('/auth/login');
      return;
    }
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
  const [language, setLanguage] = useState(languageStore.getLanguage());

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
          height: 49,                          // Figma Navigation/BottomBar height
          paddingBottom: 0,
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
            <DoubleTapTabButton {...props as any} rootRoute={ROOT_TAB_ROUTE.community} requireAuth />
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
  iconWrap: {
    width: 44, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  } as const,
  iconWrapActive: {
    backgroundColor: '#333333',
  } as const,
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
};
