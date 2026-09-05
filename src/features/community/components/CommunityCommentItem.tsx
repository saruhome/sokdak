import { StyleSheet, TextInput, TouchableOpacity, View, type GestureResponderEvent } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';
import { tFor, type Language } from '@/constants/languageStore';
import type { CommunityComment } from '@/constants/community';
import { AppIcon } from '@/components/AppIcon';
import { MoreVertical, Star } from 'lucide-react-native';

/** 즐겨찾기 별과 동일한 활성색 — Figma Point/5 골드 */
const ACTIVE_STAR_COLOR = Colors.premium;

/**
 * 댓글 단일 아이템 — 순수 표시 컴포넌트. 좋아요 상태·수까지 부모가 소유하고,
 * 여기는 comment와 콜백만 받는다(스토어/라우터 접근 없음).
 * 좋아요/답글/더보기 액션은 44pt 터치 타깃(hitSlop)과 스크린리더 라벨을 가진다.
 */
export function CommunityCommentItem({
  comment,
  language,
  isReply = false,
  liked,
  likeCount,
  onToggleLike,
  onReply,
  onMenuPress,
  isEditing,
  editText,
  onChangeEditText,
  onSaveEdit,
  onCancelEdit,
  savingEdit,
}: {
  comment: CommunityComment;
  language: Language;
  isReply?: boolean;
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  onReply: () => void;
  onMenuPress: (pageY: number) => void;
  isEditing: boolean;
  editText: string;
  onChangeEditText: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  savingEdit: boolean;
}) {
  return (
    <View style={[styles.commentItem, isReply && styles.commentItemReply]}>
      <View style={styles.commentAvatar}>
        <Text style={{ fontSize: isReply ? 14 : 16 }}>{comment.author.emoji}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentAuthorRow}>
          <Text style={styles.commentAuthor}>{comment.author.name}</Text>
          <Text style={styles.commentDate}>{comment.createdAt}</Text>
        </View>
        {isEditing ? (
          <View style={styles.commentEditWrap}>
            <TextInput
              style={styles.commentEditInput}
              value={editText}
              onChangeText={onChangeEditText}
              autoFocus
            />
            <View style={styles.commentEditActions}>
              <TouchableOpacity style={styles.commentEditCancelBtn} onPress={onCancelEdit} accessibilityRole="button">
                <Text style={styles.commentEditCancelText}>{tFor(language, 'cancelLabel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.commentEditSaveBtn, (!editText.trim() || savingEdit) && styles.btnDisabled]}
                onPress={onSaveEdit}
                disabled={!editText.trim() || savingEdit}
                accessibilityRole="button"
              >
                <Text style={styles.commentEditSaveText}>
                  {savingEdit ? tFor(language, 'savingLabel') : tFor(language, 'saveBtnLabel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.commentContent}>{comment.content}</Text>
        )}
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.commentAction}
            onPress={onToggleLike}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={`${tFor(language, 'likesCount')} ${likeCount}`}
            accessibilityState={{ selected: liked }}
          >
            <AppIcon icon={Star} size={13} fill={liked ? ACTIVE_STAR_COLOR : undefined} color={liked ? ACTIVE_STAR_COLOR : undefined} />
            <Text style={styles.commentActionText}>{likeCount}</Text>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity
              style={styles.commentAction}
              onPress={onReply}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={tFor(language, 'replyLabel')}
            >
              <Text style={styles.commentActionText}>{tFor(language, 'replyLabel')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <AppIcon
        icon={MoreVertical} size={14} color={Colors.textTertiary}
        style={styles.commentMenuBtn}
        hitSlop={12}
        accessibilityLabel={tFor(language, 'moreLink')}
        onPress={(e: GestureResponderEvent) => onMenuPress(e.nativeEvent.pageY)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /* flex:1 — replyWrap(row) 안에서도 항상 남은 너비를 다 채우게 해서, position:relative 기준
   * 박스가 화면 우측 끝까지 이어지고 commentMenuBtn의 절대 위치(X)가 항상 동일하게 나온다 */
  commentItem: {
    flex: 1, position: 'relative',
    flexDirection: 'row', paddingHorizontal: 20,
    paddingVertical: 14, gap: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  commentItemReply: { backgroundColor: Colors.background + 'cc' },
  commentAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  commentBody: { flex: 1, gap: 5 },
  /* paddingRight — commentMenuBtn(절대 위치)이 이 줄과 같은 높이라 날짜와 겹치지 않게 비워둔다 */
  commentAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 24 },
  commentAuthor: { fontSize: 12, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  commentDate: { fontSize: 11, color: Colors.textTertiary, marginLeft: 'auto' },
  /* right:17 — topBar 케밥과 아이콘 중심 X가 일치하도록 계산한 값 */
  commentMenuBtn: {
    position: 'absolute', top: 14, right: 17,
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
  },
  commentContent: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  commentActions: { flexDirection: 'row', gap: 14 },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 20 },
  commentActionText: { fontSize: 12, color: Colors.textTertiary },

  /* 댓글 인라인 수정 */
  commentEditWrap: { gap: 8 },
  commentEditInput: { fontFamily: 'NotoSerifKR_400Regular',
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 14, color: Colors.textPrimary,
  },
  commentEditActions: { flexDirection: 'row', gap: 8 },
  commentEditCancelBtn: {
    flex: 1, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  commentEditCancelText: { fontSize: 12, color: Colors.textSecondary },
  commentEditSaveBtn: {
    flex: 1, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar,
  },
  commentEditSaveText: { fontSize: 12, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  btnDisabled: { backgroundColor: Colors.border },
});
