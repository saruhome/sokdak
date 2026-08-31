import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useFonts } from 'expo-font';
// 배럴(index.js)에서 import하면 두 웨이트만 써도 metro 웹 번들에 8개 웨이트(91MB)가
// 전부 딸려온다 — 서브패스로 필요한 웨이트만 개별 import.
import { NotoSerifKR_400Regular } from '@expo-google-fonts/noto-serif-kr/400Regular';
import { NotoSerifKR_600SemiBold } from '@expo-google-fonts/noto-serif-kr/600SemiBold';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { IS_PHONE_VIEWPORT, SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants/layout';
import { authStore } from '../constants/authStore';
import { languageStore } from '../constants/languageStore';
import { reportAppError } from '../constants/errorReporting';
import { RouteAwareAppErrorBoundary } from '@/components/AppErrorBoundary';
import { useRefreshPrivateSignedMediaUrls } from '@/hooks/useRefreshPrivateSignedMediaUrls';

const SPLASH = require('../assets/splash-screen.png');

/** 웹 프리뷰 전용: 브라우저 창 크기와 무관하게 앱을 360×800 프레임에 고정
 *  (?device=iphone 쿼리로 390×844 아이폰 프레임으로 전환 가능 — constants/layout.ts 참고).
 *  네이티브(안드로이드/iOS)에서는 그대로 전체 화면을 사용한다. */
function DeviceFrame({ children }: { children: React.ReactNode }) {
  // 폰 브라우저(테스터의 아이폰 사파리 등)는 프레임 없이 실기기처럼 뷰포트를 채운다
  if (Platform.OS !== 'web' || IS_PHONE_VIEWPORT) return <>{children}</>;
  return (
    <View style={frameStyles.outer}>
      <View style={frameStyles.device}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, width: '100%', backgroundColor: Colors.background },
});

const frameStyles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#2B2A28',
    alignItems: 'center',
  },
  device: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
});

export default function RootLayout() {
  useRefreshPrivateSignedMediaUrls();
  const [fontsLoaded] = useFonts({
    NotoSerifKR_400Regular,
    NotoSerifKR_600SemiBold,
  });
  const [authReady, setAuthReady] = useState(authStore.isInitialized());
  const [languageReady, setLanguageReady] = useState(languageStore.isInitialized());
  /* 폰트·세션·언어 로딩이 빨리 끝나도 스플래시가 깜빡이고 사라지지 않도록 최소 노출 시간 확보 */
  const [splashDone, setSplashDone] = useState(false);
  /* fade out이 끝나야 언마운트 — 그 전까지 앱 위에 겹쳐 둔다 */
  const [splashVisible, setSplashVisible] = useState(true);
  const splashFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    authStore.initialize()
      .catch(error => {
        reportAppError(error, { source: 'auth_initialization', route: 'root' });
      })
      .finally(() => setAuthReady(true));

    languageStore.initialize()
      .catch(error => {
        reportAppError(error, { source: 'language_initialization', route: 'root' });
      })
      .finally(() => setLanguageReady(true));

    const t = setTimeout(() => setSplashDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const ready = fontsLoaded && authReady && languageReady && splashDone;

  useEffect(() => {
    if (!ready) return;
    Animated.timing(splashFade, {
      toValue: 0,
      duration: 400,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => setSplashVisible(false));
  }, [ready, splashFade]);

  return (
    <DeviceFrame>
      <SafeAreaProvider>
        <RouteAwareAppErrorBoundary>
          {!ready ? (
            <Image source={SPLASH} style={styles.splash} resizeMode="contain" />
          ) : (
            <>
              <StatusBar style="dark" />
              <Stack>
                <Stack.Screen name="tabs" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="search" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
              </Stack>
              {splashVisible && (
                <Animated.Image
                  source={SPLASH}
                  style={[StyleSheet.absoluteFill, styles.splash, { opacity: splashFade }]}
                  resizeMode="contain"
                />
              )}
            </>
          )}
        </RouteAwareAppErrorBoundary>
      </SafeAreaProvider>
    </DeviceFrame>
  );
}
