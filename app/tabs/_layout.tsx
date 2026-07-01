import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../constants/Colors';

/** 탭 아이콘: 이모지 기반 플레이스홀더 (추후 SVG 아이콘으로 교체) */
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
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
        tabBarActiveTintColor:   Colors.navBarIconActive,  // #F6F2EA 크림
        tabBarInactiveTintColor: Colors.navBarIconMuted,   // #948E84
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 4,
        },
      }}
    >
      {/* 1. 홈 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} />
          ),
        }}
      />

      {/* 2. 사전 */}
      <Tabs.Screen
        name="dictionary"
        options={{
          title: '사전',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📖" focused={focused} />
          ),
        }}
      />

      {/* 3. 카테고리 */}
      <Tabs.Screen
        name="category"
        options={{
          title: '카테고리',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗂️" focused={focused} />
          ),
        }}
      />

      {/* 4. 커뮤니티 */}
      <Tabs.Screen
        name="community"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" focused={focused} />
          ),
        }}
      />

      {/* 5. 마이페이지 */}
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
