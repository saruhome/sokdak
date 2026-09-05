import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';
import { BOARD_COLORS, getBoardLabel } from '@/constants/mockPosts';
import { tFor, type Language } from '@/constants/languageStore';
import type { CommunityPostSummary } from '@/constants/community';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { Eye, Heart, MessageCircle } from 'lucide-react-native';

/** 본문 마크업(이미지/링크/서식)을 걷어낸 1줄 미리보기 텍스트 */
export function previewText(content: string): string {
  return content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')      // ![](url) 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // [label](url) 링크 → label
    .replace(/\*\*|_/g, '')                    // 굵게/기울임 마커
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 커뮤니티 게시글 카드 — board → 질문 제목 → 짧은 맥락 → author/time/comments 계층.
 * router/스토어/fetch를 모르는 순수 표시 컴포넌트: post와 콜백만 받는다.
 */
export function CommunityPostCard({
  post,
  language,
  onPress,
  testID,
}: {
  post: CommunityPostSummary;
  language: Language;
  onPress: () => void;
  testID?: string;
}) {
  const boardLabel = getBoardLabel(post.board, language);
  const preview = previewText(post.content);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={
        `${boardLabel}. ${post.title}. ${post.author.name}. ` +
        `${tFor(language, 'commentsLabel')} ${post.commentCount}`
      }
    >
      <View style={[styles.boardBadge, { backgroundColor: BOARD_COLORS[post.board].bg }]}>
        <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[post.board].fg }]}>{boardLabel}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
      {preview ? <Text style={styles.preview} numberOfLines={1}>{preview}</Text> : null}
      <View style={styles.metaRow}>
        <Text style={styles.author} numberOfLines={1}>{post.author.emoji} {post.author.name}</Text>
        <Text style={styles.date}>{post.createdAt}</Text>
        <View style={styles.stats}>
          {/* 댓글수가 참여 신호라 조회/좋아요보다 진한 색으로 우선순위를 준다 */}
          <View style={styles.commentStat}>
            <AppIcon icon={MessageCircle} size={12} color={Colors.textSecondary} />
            <Text style={styles.commentStatText}>{post.commentCount}</Text>
          </View>
          <IconStat icon={Eye} value={post.views} textStyle={styles.weakStatText} color={Colors.textTertiary} />
          <IconStat icon={Heart} value={post.likes} textStyle={styles.weakStatText} color={Colors.textTertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 24, paddingVertical: 12, gap: 8, minHeight: 92, justifyContent: 'center' },
  /* 사전 화면 단어 태그(wordBadge)와 동일 크기 */
  boardBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  boardBadgeText: { fontSize: 10, fontFamily: 'NotoSerifKR_600SemiBold' },
  title: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, lineHeight: 20 },
  preview: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  author: { fontSize: 11, color: Colors.textSecondary, flexShrink: 1 },
  date: { fontSize: 11, color: Colors.textTertiary },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 'auto' },
  commentStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  commentStatText: { fontSize: 11, color: Colors.textSecondary, fontFamily: 'NotoSerifKR_600SemiBold' },
  weakStatText: { fontSize: 11, color: Colors.textTertiary },
});
