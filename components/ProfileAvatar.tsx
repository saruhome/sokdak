import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';

type ProfileAvatarProps = {
  uri?: string | null;
  emoji: string;
  size?: number;
  style?: ViewStyle;
};

export default function ProfileAvatar({ uri, emoji, size = 40, style }: ProfileAvatarProps) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <Text style={[styles.emoji, { fontSize: Math.round(size * 0.55) }]}>{emoji}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emoji: {
    lineHeight: 1,
  },
});
