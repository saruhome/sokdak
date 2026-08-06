import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '../constants/Colors';
import { PlayIcon } from './icons/PlayIcon';

/**
 * 단어 상세 영상 슬롯 (Figma node 683:3679 — heroicons-solid:play, 311×147).
 * word.videoUrl이 있으면 실제로 재생되는 플레이어를 보여주고,
 * 없으면 자리만 잡아두는 빈 상태(Figma 원본도 이미지 없는 빈 프레임)를 보여준다.
 * 나중에 Supabase words 테이블의 video_url 컬럼에 'https://...mp4'만 채우면
 * 바로 이 자리에서 재생된다.
 */
export function WordVideo({ videoUrl }: { videoUrl?: string }) {
  if (!videoUrl) {
    return (
      <View style={styles.wrap}>
        <PlayIcon size={58} color="#EBEBEB" opacity={0.8} />
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
    width: '100%',
    aspectRatio: 311 / 147,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  player: { flex: 1, width: '100%' },
});
