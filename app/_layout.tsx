import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
