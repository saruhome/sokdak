import type { ImageSourcePropType } from 'react-native';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';

type CharacterEmptyStateProps = {
  image: ImageSourcePropType;
  title: string;
  description?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  testID?: string;
};

/**
 * 캐릭터는 결과가 비어 있는 이유를 보조적으로 전달하는 장식 요소다.
 * 따라서 스크린 리더에는 중복된 캐릭터 이름을 읽히지 않고 제목·설명·CTA만 노출한다.
 */
export function CharacterEmptyState({
  image,
  title,
  description,
  ctaLabel,
  onPressCta,
  testID,
}: CharacterEmptyStateProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Image source={image} style={styles.character} resizeMode="contain" accessible={false} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {ctaLabel && onPressCta ? (
        <TouchableOpacity
          style={styles.cta}
          onPress={onPressCta}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      ) : null}
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
    marginHorizontal: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  character: { height: 112, marginBottom: 12, width: 112 },
  copy: { alignItems: 'center', gap: 6 },
  title: { color: Colors.textPrimary, fontFamily: 'NotoSerifKR_600SemiBold', fontSize: 16, textAlign: 'center' },
  description: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  cta: {
    alignItems: 'center',
    backgroundColor: Colors.navBar,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 44,
    paddingHorizontal: 18,
  },
  ctaText: { color: Colors.navBarIconActive, fontSize: 14, fontWeight: '700' },
});
