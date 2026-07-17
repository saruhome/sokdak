import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import {
  useFonts,
  NotoSerifKR_400Regular,
  NotoSerifKR_600SemiBold,
} from '@expo-google-fonts/noto-serif-kr';
import { Colors } from '../constants/Colors';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '../constants/layout';

/** 웹 프리뷰 전용: 브라우저 창 크기와 무관하게 앱을 360×800 프레임에 고정.
 *  네이티브(안드로이드/iOS)에서는 그대로 전체 화면을 사용한다. */
function DeviceFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={frameStyles.outer}>
      <View style={frameStyles.device}>{children}</View>
    </View>
  );
}

const frameStyles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#2B2A28',
    alignItems: 'center',
  },
  device: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSerifKR_400Regular,
    NotoSerifKR_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <DeviceFrame>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="auth"  options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
      </Stack>
    </DeviceFrame>
  );
}
