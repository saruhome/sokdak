import { Image, Linking, View, type StyleProp, type TextStyle } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';
import { SCREEN_WIDTH } from '@/constants/layout';

/**
 * 글쓰기 툴바(사진/링크/서식)가 만들어내는 아주 작은 마크다운 서브셋을 렌더링한다.
 * - 이미지 전용 줄: ![](url)
 * - 링크: [라벨](url)
 * - 굵게: **text**   기울임: _text_
 * DB에는 이 마크업이 그대로 plain text로 저장된다(스키마 변경 없이 동작).
 */
const IMAGE_LINE_RE = /^!\[\]\(([^)]+)\)$/;
const INLINE_RE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|_([^_]+)_/g;

function openLink(url: string) {
  const href = /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`;
  Linking.openURL(href).catch(() => {});
}

function renderInline(text: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      const url = match[2];
      nodes.push(
        <Text key={`${keyPrefix}-${i++}`} style={styles.link} onPress={() => openLink(url)}>
          {match[1]}
        </Text>,
      );
    } else if (match[3] !== undefined) {
      nodes.push(<Text key={`${keyPrefix}-${i++}`} style={styles.bold}>{match[3]}</Text>);
    } else if (match[4] !== undefined) {
      nodes.push(<Text key={`${keyPrefix}-${i++}`} style={styles.italic}>{match[4]}</Text>);
    }
    lastIndex = INLINE_RE.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function PostRichText({
  content, textStyle, imageWidth = SCREEN_WIDTH - 40,
}: { content: string; textStyle?: StyleProp<TextStyle>; imageWidth?: number }) {
  const lines = content.split('\n');
  return (
    <View>
      {lines.map((line, idx) => {
        const imgMatch = line.trim().match(IMAGE_LINE_RE);
        if (imgMatch) {
          return (
            <Image
              key={idx}
              source={{ uri: imgMatch[1] }}
              style={[styles.image, { width: imageWidth, height: imageWidth }]}
              resizeMode="cover"
            />
          );
        }
        if (line.trim().length === 0) return <View key={idx} style={styles.blankLine} />;
        return (
          <Text key={idx} style={textStyle}>
            {renderInline(line, String(idx))}
          </Text>
        );
      })}
    </View>
  );
}

const styles = {
  link: { color: Colors.accent, textDecorationLine: 'underline' as const },
  bold: { fontFamily: 'NotoSerifKR_600SemiBold' as const },
  italic: { fontStyle: 'italic' as const },
  image: { borderRadius: 10, marginVertical: 8, backgroundColor: Colors.border },
  blankLine: { height: 8 },
};
