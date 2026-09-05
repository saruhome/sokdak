import { StyleSheet, View, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { createElement } from 'react';
import { AppText as Text } from '@/components/AppText';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '../constants/Colors';
import { AppIcon } from './AppIcon';
import { ExternalLink, Play } from 'lucide-react-native';

type Props = {
  /** 직접 보유/라이선스한 mp4·스트리밍 URL — 있으면 최우선으로 인앱 재생 */
  videoUrl?: string;
  /** 제3자 유튜브 클립 — videoUrl이 없을 때만 사용. 웹은 임베드, 네이티브는 탭하면 유튜브로 이동
   * (다운로드·재호스팅 없음 — 유튜브 자체 플레이어/서버로만 재생된다) */
  youtubeId?: string;
  videoStartSec?: number;
  videoEndSec?: number;
  /** 재생 가능한 영상이 없는 단어의 정지 이미지(운영자가 직접 올린 캡처컷) */
  thumbnailUrl?: string;
  /** 미디어가 하나도 없을 때 홈 카드와 동일한 타이포 배너를 그리기 위한 단어/카테고리 틴트색 */
  word?: string;
  tintColor?: string;
};

/**
 * 단어 상세 영상 슬롯 (Figma node 683:3679 — heroicons-solid:play, 311×147).
 * 우선순위: videoUrl(보유 클립 인앱 재생) → youtubeId(임베드/딥링크) → thumbnailUrl(정지 이미지) → 빈 상태.
 */
export function WordVideo({ videoUrl, youtubeId, videoStartSec, videoEndSec, thumbnailUrl, word, tintColor }: Props) {
  if (videoUrl) {
    return (
      <View style={styles.wrap}>
        <VideoPlayerBox url={videoUrl} />
      </View>
    );
  }

  if (youtubeId) {
    return (
      <View style={styles.wrap}>
        {Platform.OS === 'web'
          ? <YoutubeEmbed id={youtubeId} start={videoStartSec} end={videoEndSec} />
          : <YoutubeTapToOpen id={youtubeId} start={videoStartSec} thumbnailUrl={thumbnailUrl} />}
      </View>
    );
  }

  if (thumbnailUrl) {
    return (
      <View style={styles.wrap}>
        <Image source={{ uri: thumbnailUrl }} style={styles.player} resizeMode="cover" />
      </View>
    );
  }

  /* 미디어가 없으면 홈 '새로운 신조어' 카드와 동일한 타이포 배너(운영자 결정 2026-09-03) —
   * 단어+카테고리 틴트가 없으면 기존 규칙대로 자리 자체를 만들지 않는다(빈 재생 박스 금지) */
  if (word && tintColor) {
    return (
      <View style={[styles.wrap, { backgroundColor: `${tintColor}14` }]}>
        <Text style={[styles.typoWatermark, { color: `${tintColor}4D` }]} accessible={false}>&rdquo;</Text>
        <Text style={styles.typoWord} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{word}</Text>
      </View>
    );
  }
  return null;
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

/* react-native-web은 순수 웹뷰라 <iframe>을 직접 못 쓰고 createElement로 우회해야
 * 네이티브 번들에서도 타입 에러 없이 공존한다 — 이 파일에서만 쓰는 국소 트릭. */
function YoutubeEmbed({ id, start, end }: { id: string; start?: number; end?: number }) {
  const params = new URLSearchParams({ modestbranding: '1', rel: '0' });
  if (start) params.set('start', String(start));
  if (end) params.set('end', String(end));
  return createElement('iframe', {
    src: `https://www.youtube.com/embed/${id}?${params.toString()}`,
    title: 'YouTube video player',
    style: { width: '100%', height: '100%', border: 0 },
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    allowFullScreen: true,
  });
}

function YoutubeTapToOpen({ id, start, thumbnailUrl }: { id: string; start?: number; thumbnailUrl?: string }) {
  const openInYoutube = () => {
    const t = start ? `&t=${start}s` : '';
    Linking.openURL(`https://www.youtube.com/watch?v=${id}${t}`);
  };
  return (
    <TouchableOpacity style={styles.tapWrap} onPress={openInYoutube} activeOpacity={0.85}>
      {thumbnailUrl && <Image source={{ uri: thumbnailUrl }} style={styles.player} resizeMode="cover" />}
      <View style={styles.playOverlay}>
        <AppIcon icon={Play} size={28} color="#fff" fill="#fff" />
      </View>
      <View style={styles.openLinkRow}>
        <AppIcon icon={ExternalLink} size={12} color={Colors.navBarIconActive} />
        <Text style={styles.openLinkText}>YouTube에서 열기</Text>
      </View>
    </TouchableOpacity>
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
  /* 홈 타이포 카드와 같은 문법 — 대형 세리프 단어 + 따옴표 워터마크 */
  typoWord: { fontSize: 34, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, paddingHorizontal: 24 },
  typoWatermark: {
    position: 'absolute', top: -26, right: 12,
    fontSize: 96, lineHeight: 104, fontFamily: 'NotoSerifKR_600SemiBold',
  },
  tapWrap: { flex: 1, width: '100%', backgroundColor: Colors.navBar },
  playOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  openLinkRow: {
    position: 'absolute', bottom: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  openLinkText: { fontSize: 11, color: Colors.navBarIconActive },
});
