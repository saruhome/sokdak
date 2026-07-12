import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '../constants/Colors';

/**
 * 단어 상세 상단 영상 슬롯 (Figma: K-드라마 등 캡션 영상 클립 위치).
 * word.videoUrl이 있으면 실제로 재생되는 플레이어를 보여주고,
 * 없으면 자리만 잡아두는 빈 상태를 보여준다 — 나중에 mockWords.ts에
 * videoUrl: 'https://...mp4' 한 줄만 추가하면 바로 이 자리에서 재생된다.
 */
export function WordVideo({ videoUrl }: { videoUrl?: string }) {
  if (!videoUrl) {
    return (
      <View style={styles.wrap}>
        <View style={styles.placeholder}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.placeholderText}>영상 준비 중</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      <VideoPlayerBox url={videoUrl} />
    </View>
  );
}

function VideoPlayerBox({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      style={styles.player}
      player={player}
      allowsPictureInPicture
      nativeControls
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 24,
    marginTop: 12,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.pageBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  player: { flex: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  playIcon: {
    fontSize: 20, color: Colors.textTertiary,
    width: 44, height: 44, lineHeight: 44, textAlign: 'center',
    borderRadius: 22, borderWidth: 1.5, borderColor: Colors.border,
    overflow: 'hidden',
  },
  placeholderText: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
});
