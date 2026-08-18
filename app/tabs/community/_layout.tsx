import { Stack } from 'expo-router';
import { Colors } from '../../../constants/Colors';

/** 게시글 탐색은 게스트에게도 열어두고, 작성·댓글·반응 등 쓰기 행동은 각 화면에서 로그인으로 안내한다. */
export default function CommunityLayout() {
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
