import { Stack } from 'expo-router';
import { Colors } from '../../../constants/Colors';

export default function MyPageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="word/[id]" />
      <Stack.Screen name="my-posts" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="suggest" />
      <Stack.Screen name="support" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="premium" />
      <Stack.Screen name="community-guidelines" />
      <Stack.Screen name="legal" />
    </Stack>
  );
}
