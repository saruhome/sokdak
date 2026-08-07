import * as Speech from 'expo-speech';
import { type Word } from './words';

const KOREAN_LOCALE = 'ko-KR';

function getTextToSpeak(word: Word): string {
  if (word.pronunciation) {
    return word.pronunciation.replace(/^\[|\]$/g, '');
  }
  return word.word;
}

export function speakWord(word: Word) {
  const text = getTextToSpeak(word);
  const language = KOREAN_LOCALE;

  Speech.stop();
  Speech.speak(text, {
    language,
    pitch: 1.0,
    rate: 1.0,
  });
}
