import { useCallback, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from 'expo-speech-recognition';
import { AppText as Text } from '@/components/AppText';
import { AppIcon } from '@/components/AppIcon';
import { VoiceSearchPermissionDialog } from '@/components/VoiceSearchPermissionDialog';
import { Alert } from '@/constants/alert';
import { Colors } from '@/constants/Colors';
import { languageStore, useLanguage } from '@/constants/languageStore';
import { Mic, Square } from 'lucide-react-native';

const KOREAN_SPEECH_LOCALE = 'ko-KR';

function getErrorMessage(error: ExpoSpeechRecognitionErrorCode) {
  const t = languageStore.t;
  if (error === 'not-allowed') return t('voiceSearchPermissionMessage');
  if (error === 'no-speech' || error === 'speech-timeout') return t('voiceSearchNoMatchMessage');
  return t('voiceSearchUnavailableMessage');
}

/**
 * 사전 검색용 단문 한국어 음성 인식 컨트롤.
 *
 * 녹음 파일은 저장하거나 SokDak 서버로 전송하지 않는다. 네이티브 음성 인식 서비스가
 * 반환한 최종 텍스트만 검색어에 반영한다. Android 우선 비공개 베타에서 지원하며,
 * Expo Go가 아닌 config plugin이 포함된 development/release build가 필요하다.
 */
export function VoiceSearchButton({
  onTranscript,
  contextualStrings = [],
}: {
  onTranscript: (transcript: string) => void;
  contextualStrings?: string[];
}) {
  useLanguage();
  const t = languageStore.t;
  const [recognizing, setRecognizing] = useState(false);
  const [permissionDialogMode, setPermissionDialogMode] = useState<'retry' | 'settings' | null>(null);
  /* 웹: 브라우저 내장 Web Speech API 세션 — stop을 위해 보관 */
  const webRecognitionRef = useRef<{ stop: () => void } | null>(null);

  const showPermissionDialog = useCallback((canAskAgain?: boolean) => {
    setPermissionDialogMode(canAskAgain === false ? 'settings' : 'retry');
  }, []);

  const showNoMatch = useCallback(() => {
    Alert.alert(t('voiceSearchLabel'), t('voiceSearchNoMatchMessage'));
  }, [t]);

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('nomatch', showNoMatch);
  useSpeechRecognitionEvent('result', event => {
    if (!event.isFinal) return;
    const transcript = event.results[0]?.transcript.trim();
    if (!transcript) {
      showNoMatch();
      return;
    }
    onTranscript(transcript);
  });
  useSpeechRecognitionEvent('error', event => {
    setRecognizing(false);
    if (event.error === 'aborted') return;
    if (event.error === 'not-allowed') {
      void ExpoSpeechRecognitionModule.getPermissionsAsync()
        .then(permission => showPermissionDialog(permission.canAskAgain))
        .catch(() => showPermissionDialog(false));
      return;
    }
    Alert.alert(t('voiceSearchLabel'), getErrorMessage(event.error));
  });

  /* 웹은 브라우저 내장 Web Speech API 사용(의존성 0) — Chrome/Edge/Safari 지원, ko-KR 인식.
   * 오디오는 우리 서버로 오지 않고 브라우저의 음성 서비스가 처리한다. Firefox 등 미지원
   * 브라우저는 정직하게 '사용 불가' 안내. */
  const startWebRecognition = useCallback(() => {
    const SR = (window as unknown as Record<string, any>).SpeechRecognition
      ?? (window as unknown as Record<string, any>).webkitSpeechRecognition;
    if (!SR) {
      Alert.alert(t('voiceSearchLabel'), t('voiceSearchUnavailableMessage'));
      return;
    }
    const recognition = new SR();
    recognition.lang = KOREAN_SPEECH_LOCALE;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.onstart = () => setRecognizing(true);
    recognition.onend = () => { setRecognizing(false); webRecognitionRef.current = null; };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onTranscript(transcript);
      else showNoMatch();
    };
    recognition.onerror = (event: any) => {
      setRecognizing(false);
      if (event.error === 'aborted') return;
      if (event.error === 'not-allowed') { showPermissionDialog(true); return; }
      Alert.alert(t('voiceSearchLabel'),
        event.error === 'no-speech' ? t('voiceSearchNoMatchMessage') : t('voiceSearchUnavailableMessage'));
    };
    webRecognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript, showNoMatch, showPermissionDialog, t]);

  const startRecognition = useCallback(async () => {
    if (Platform.OS === 'web') {
      startWebRecognition();
      return;
    }

    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        Alert.alert(t('voiceSearchLabel'), t('voiceSearchUnavailableMessage'));
        return;
      }

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        showPermissionDialog(permission.canAskAgain);
        return;
      }

      setRecognizing(true);
      ExpoSpeechRecognitionModule.start({
        lang: KOREAN_SPEECH_LOCALE,
        interimResults: false,
        continuous: false,
        maxAlternatives: 3,
        contextualStrings: contextualStrings.slice(0, 100),
        androidIntent: 'android.speech.action.RECOGNIZE_SPEECH',
      });
    } catch {
      setRecognizing(false);
      Alert.alert(t('voiceSearchLabel'), t('voiceSearchUnavailableMessage'));
    }
  }, [contextualStrings, showPermissionDialog, startWebRecognition, t]);

  const handleRetryPermission = () => {
    setPermissionDialogMode(null);
    void startRecognition();
  };

  const handleOpenSettings = useCallback(async () => {
    setPermissionDialogMode(null);
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert(t('voiceSearchLabel'), t('voiceSearchSettingsOpenError'));
    }
  }, [t]);

  const handlePress = () => {
    if (recognizing) {
      if (Platform.OS === 'web') webRecognitionRef.current?.stop();
      else ExpoSpeechRecognitionModule.stop();
      return;
    }
    void startRecognition();
  };

  return (
    <View style={styles.wrap}>
      <AppIcon
        icon={recognizing ? Square : Mic}
        size={16}
        color={recognizing ? Colors.point1 : Colors.textSecondary}
        style={[styles.button, recognizing && styles.buttonListening]}
        hitSlop={8}
        onPress={handlePress}
        accessibilityLabel={recognizing ? t('voiceSearchStopLabel') : t('voiceSearchLabel')}
      />
      {recognizing && (
        <Text style={styles.status} accessibilityLiveRegion="polite">
          {t('voiceSearchListening')}
        </Text>
      )}
      <VoiceSearchPermissionDialog
        mode={permissionDialogMode}
        onClose={() => setPermissionDialogMode(null)}
        onRetryPermission={handleRetryPermission}
        onOpenSettings={handleOpenSettings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-end' },
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  buttonListening: { backgroundColor: Colors.point1 + '18' },
  status: {
    position: 'absolute',
    right: 0,
    top: 38,
    maxWidth: 220,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.navBar,
    color: Colors.navBarIconActive,
    fontSize: 12,
    lineHeight: 17,
    zIndex: 2,
  },
});
