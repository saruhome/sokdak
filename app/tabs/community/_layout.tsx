import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Colors } from '../../../constants/Colors';
import { authStore } from '../../../constants/authStore';

/** 커뮤니티는 회원 전용 — 탭바 외 딥링크·뒤로가기 등 다른 경로로 들어와도 여기서 한 번에 막는다 */
export default function CommunityLayout() {
  useFocusEffect(useCallback(() => {
    if (!authStore.isLoggedIn()) router.replace('/auth/login');
  }, []));

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="write"
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
    </Stack>
  );
}
