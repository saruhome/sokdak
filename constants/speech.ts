import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { type Word } from './words';
import { authStore } from './authStore';
import { languageStore } from './languageStore';
import { Alert } from './alert';

const KOREAN_LOCALE = 'ko-KR';

function getTextToSpeak(word: Word): string {
  if (word.pronunciation) {
    return word.pronunciation.replace(/^\[|\]$/g, '');
  }
  return word.word;
}

export function speakWord(word: Word) {
  const t = languageStore.t;

  if (!authStore.isLoggedIn()) {
    Alert.alert(t('loginRequiredTitle'), t('loginRequiredTts'), [
      { text: t('cancelLabel'), style: 'cancel' },
      { text: t('goToLogin'), onPress: () => router.push('/auth/login') },
    ]);
    return;
  }
  if (!authStore.canPlayTtsToday()) {
    Alert.alert(t('ttsLimitReachedTitle'), t('ttsLimitReachedMessage'));
    return;
  }
  authStore.recordTtsPlay();

  const text = getTextToSpeak(word);
  const language = KOREAN_LOCALE;

  Speech.stop();
  Speech.speak(text, {
    language,
    pitch: 1.0,
    rate: 1.0,
  });
}
