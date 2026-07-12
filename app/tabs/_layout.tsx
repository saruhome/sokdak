import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { TabIcon, type TabIconName } from '@/components/icons/TabIcon';

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

export default function TabLayout() {
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
        tabBarActiveTintColor:   Colors.navBarIconActive,  // #F6F2EA — Figma는 활성/비활성 라벨색 동일
        tabBarInactiveTintColor: Colors.navBarIconActive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 4,
          fontFamily: undefined,
        },
      }}
    >
      {/* 1. 홈 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
        }}
      />

      {/* 2. 사전 */}
      <Tabs.Screen
        name="dictionary"
        options={{
          title: '사전',
          tabBarIcon: ({ focused }) => <TabBarIcon name="dictionary" focused={focused} />,
        }}
      />

      {/* 3. 카테고리 */}
      <Tabs.Screen
        name="category"
        options={{
          title: '카테고리',
          tabBarIcon: ({ focused }) => <TabBarIcon name="category" focused={focused} />,
        }}
      />

      {/* 4. 커뮤니티 */}
      <Tabs.Screen
        name="community"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ focused }) => <TabBarIcon name="community" focused={focused} />,
        }}
      />

      {/* 5. 마이페이지 */}
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused }) => <TabBarIcon name="mypage" focused={focused} />,
        }}
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
};
