import type { ImageSourcePropType } from 'react-native';
import { Image, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';

type CharacterSuccessFeedbackProps = {
  image: ImageSourcePropType;
  title: string;
  word: string;
  testID?: string;
};

/**
 * 저장처럼 짧은 성공 행동을 보조하는 비차단형 캐릭터 피드백이다.
 * 캐릭터 자체는 장식으로 숨기고, 성공 제목과 저장된 단어만 접근성 알림으로 전달한다.
 */
export function CharacterSuccessFeedback({
  image,
  title,
  word,
  testID,
}: CharacterSuccessFeedbackProps) {
  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Image source={image} style={styles.character} resizeMode="contain" accessible={false} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.word} numberOfLines={1}>“{word}”</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  character: { height: 72, width: 72 },
  copy: { flex: 1, gap: 4, minWidth: 0 },
  title: { color: Colors.textPrimary, fontFamily: 'NotoSerifKR_600SemiBold', fontSize: 16 },
  word: { color: Colors.textSecondary, fontSize: 14 },
});
