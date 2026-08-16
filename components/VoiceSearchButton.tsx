import { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from 'expo-speech-recognition';
import { AppText as Text } from '@/components/AppText';
import { AppIcon } from '@/components/AppIcon';
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
    Alert.alert(t('voiceSearchLabel'), getErrorMessage(event.error));
  });

  const startRecognition = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert(t('voiceSearchLabel'), t('voiceSearchUnavailableMessage'));
      return;
    }

    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        Alert.alert(t('voiceSearchLabel'), t('voiceSearchUnavailableMessage'));
        return;
      }

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('permissionNeededTitle'), t('voiceSearchPermissionMessage'));
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
  }, [contextualStrings, t]);

  const handlePress = () => {
    if (recognizing) {
      ExpoSpeechRecognitionModule.stop();
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
