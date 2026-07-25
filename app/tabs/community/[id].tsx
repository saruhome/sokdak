import {
  StyleSheet, View, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useState, useRef } from 'react';
import { Colors } from '../../../constants/Colors';
import { BOARD_COLORS } from '../../../constants/mockPosts';
import { authStore } from '../../../constants/authStore';
import { fetchPost, createComment, type CommunityComment, type CommunityPostDetail } from '../../../constants/community';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { Heart, MessageCircle, Bookmark, Share2, MoreVertical, Eye } from 'lucide-react-native';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<CommunityPostDetail | null | undefined>(undefined);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sendingComment, setSendingComment] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const load = useCallback(() => {
    if (!id) return;
    fetchPost(id).then(data => {
      setPost(data);
      if (data) {
        setLiked(authStore.isPostLiked(data.id));
        setLikeCount(data.likes);
      }
    });
  }, [id]);

  /* 화면 재진입 시(마이페이지 좋아요 해제 등) 최신 상태로 다시 불러옴 */
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (post === undefined) {
    return (
      <SafeAreaView style={styles.notFound}>
        <ActivityIndicator color={Colors.textTertiary} />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>게시글을 찾을 수 없어요</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const boardColor = BOARD_COLORS[post.board];

  const handleLike = () => {
    if (!authStore.isLoggedIn()) {
      Alert.alert('로그인이 필요해요', '좋아요를 누르려면 먼저 로그인해주세요.', [
        { text: '취소', style: 'cancel' },
        { text: '로그인하러 가기', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    authStore.togglePostLiked(post.id);
    setLiked(p => !p);
    setLikeCount(p => liked ? p - 1 : p + 1);
  };

  const handleSend = async () => {
    if (!commentText.trim()) return;
    if (!authStore.isLoggedIn()) {
      Alert.alert('로그인이 필요해요', '댓글을 작성하려면 먼저 로그인해주세요.', [
        { text: '취소', style: 'cancel' },
        { text: '로그인하러 가기', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    setSendingComment(true);
    const { error } = await createComment({
      postId: post.id,
      content: commentText.trim(),
      parentCommentId: replyingTo,
    });
    setSendingComment(false);
    if (error) {
      Alert.alert('댓글 등록 실패', error);
      return;
    }
    setCommentText('');
    setReplyingTo(null);
    load();
  };

  const handleReply = (comment: CommunityComment) => {
    setReplyingTo(comment.id);
    setCommentText(`@${comment.author.name} `);
    inputRef.current?.focus();
  };

  const totalComments = post.commentCount;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ── TopAppBar – Figma: Navigation/TopAppBar/Post : 다른 사람 게시물(710:4873)/내 게시물(736:6169) — back + share + more, 뱃지 없음 */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.topBarRight}>
            <AppIcon icon={Share2} size={20} style={styles.iconButton} onPress={() => {}} />
            <AppIcon icon={MoreVertical} size={20} style={styles.iconButton} onPress={() => {}} />
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── 게시글 본문 영역 ── */}
          <View style={styles.postSection}>
            <View style={[styles.boardBadge, styles.boardBadgeStandalone, { backgroundColor: boardColor.bg }]}>
              <Text style={[styles.boardBadgeText, { color: boardColor.fg }]}>{post.board}</Text>
            </View>

            {/* Display/UserInfo (327×40) */}
            <View style={styles.userInfoRow}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarEmoji}>{post.author.emoji}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{post.author.name}</Text>
                <Text style={styles.userMeta}>{post.author.level} · {post.createdAt}</Text>
              </View>
            </View>

            {/* 제목 – 피그마: "'갓벽'이 무슨 뜻인가요?" */}
            <Text style={styles.postTitle}>{post.title}</Text>

            {/* 본문 */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* 액션 버튼들 */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, liked && styles.actionBtnActive]} onPress={handleLike}>
                <AppIcon icon={Heart} size={16} fill={liked ? Colors.error : undefined} color={liked ? Colors.error : undefined} />
                <Text style={[styles.actionLabel, liked && { color: Colors.error }]}>{likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <AppIcon icon={MessageCircle} size={16} />
                <Text style={styles.actionLabel}>{totalComments}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, saved && styles.actionBtnActive]}
                onPress={() => setSaved(p => !p)}
              >
                <AppIcon icon={Bookmark} size={16} fill={saved ? Colors.accent : undefined} color={saved ? Colors.accent : undefined} />
                <Text style={[styles.actionLabel, saved && { color: Colors.accent }]}>
                  {saved ? '저장됨' : '저장'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <AppIcon icon={Share2} size={16} />
                <Text style={styles.actionLabel}>공유</Text>
              </TouchableOpacity>
            </View>

            {/* Group 189 – 조회·좋아요·댓글 메타 */}
            <View style={styles.metaRow}>
              <IconStat icon={Eye} value={`조회 ${post.views}`} textStyle={styles.metaItem} />
              <Text style={styles.metaDot}>·</Text>
              <IconStat icon={Heart} value={`좋아요 ${likeCount}`} textStyle={styles.metaItem} />
              <Text style={styles.metaDot}>·</Text>
              <IconStat icon={MessageCircle} value={`댓글 ${totalComments}`} textStyle={styles.metaItem} />
            </View>
          </View>

          {/* ── Display/List Header – 댓글 헤더 */}
          <View style={styles.commentHeader}>
            <Text style={styles.commentHeaderTitle}>댓글 {totalComments}개</Text>
          </View>

          {/* ── Controls/TextField/Comment/대댓글 O – 댓글 목록 */}
          <View style={styles.commentList}>
            {post.comments.map(comment => (
              <View key={comment.id}>
                <CommentItem
                  comment={comment}
                  onReply={() => handleReply(comment)}
                />
                {/* 대댓글 (들여쓰기) */}
                {comment.replies?.map(reply => (
                  <View key={reply.id} style={styles.replyWrap}>
                    <View style={styles.replyIndent} />
                    <CommentItem
                      comment={reply}
                      isReply
                      onReply={() => handleReply(comment)}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* ── Controls/Text Field/Comment (375×57) – 댓글 입력창 */}
        <View style={styles.commentInputWrap}>
          {replyingTo && (
            <View style={styles.replyingBanner}>
              <Text style={styles.replyingText}>답글 작성 중</Text>
              <TouchableOpacity onPress={() => { setReplyingTo(null); setCommentText(''); }}>
                <Text style={styles.replyingClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.commentInputRow}>
            <TextInput
              ref={inputRef}
              style={styles.commentInput}
              placeholder="댓글을 입력하세요"
              placeholderTextColor={Colors.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!commentText.trim() || sendingComment) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!commentText.trim() || sendingComment}
            >
              <Text style={styles.sendBtnText}>{sendingComment ? '전송 중…' : '전송'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* ── 댓글 단일 아이템 컴포넌트 ── */
function CommentItem({
  comment, isReply = false, onReply,
}: { comment: CommunityComment; isReply?: boolean; onReply: () => void }) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={[styles.commentItem, isReply && styles.commentItemReply]}>
      <View style={styles.commentAvatar}>
        <Text style={{ fontSize: isReply ? 14 : 16 }}>{comment.author.emoji}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentAuthorRow}>
          <Text style={styles.commentAuthor}>{comment.author.name}</Text>
          <Text style={styles.commentLevel}>{comment.author.level}</Text>
          <Text style={styles.commentDate}>{comment.createdAt}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => setLiked(p => !p)}
          >
            <AppIcon icon={Heart} size={13} fill={liked ? Colors.error : undefined} color={liked ? Colors.error : undefined} />
            <Text style={styles.commentActionText}>{liked ? 1 : 0}</Text>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity style={styles.commentAction} onPress={onReply}>
              <Text style={styles.commentActionText}>답글</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* TopAppBar */
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34, marginTop: -2 },
  topBarRight: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  shareIcon: { fontSize: 17 },
  moreIcon: { fontSize: 20, color: Colors.textSecondary },
  boardBadge: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12,
  },
  boardBadgeStandalone: { alignSelf: 'flex-start', marginBottom: 12 },
  boardBadgeText: { fontSize: 11, fontWeight: '700' },

  scroll: { flex: 1 },

  /* 게시글 */
  postSection: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: Colors.divider,
  },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  userAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  userAvatarEmoji: { fontSize: 20 },
  userInfo: { gap: 2 },
  userName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  userMeta: { fontSize: 11, color: Colors.textTertiary },

  postTitle: {
    fontSize: 19, fontWeight: '800', color: Colors.textPrimary,
    lineHeight: 27, marginBottom: 14,
  },
  postContent: {
    fontSize: 15, color: Colors.textPrimary,
    lineHeight: 24, marginBottom: 18,
  },

  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  actionBtnActive: { borderColor: Colors.accent + '60', backgroundColor: Colors.accent + '10' },
  actionIcon: { fontSize: 14 },
  actionLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { fontSize: 12, color: Colors.textTertiary },
  metaDot: { fontSize: 12, color: Colors.border },

  /* 댓글 헤더 – Display/List Header (375×42) */
  commentHeader: {
    height: 42, justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  commentHeaderTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  /* 댓글 목록 */
  commentList: {},
  commentItem: {
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
  commentAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentAuthor: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  commentLevel: {
    fontSize: 10, color: Colors.accent,
    paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: 6, borderWidth: 1, borderColor: Colors.accent + '50',
  },
  commentDate: { fontSize: 11, color: Colors.textTertiary, marginLeft: 'auto' },
  commentContent: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  commentActions: { flexDirection: 'row', gap: 14 },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentActionIcon: { fontSize: 13 },
  commentActionText: { fontSize: 12, color: Colors.textTertiary },

  /* 대댓글 들여쓰기 */
  replyWrap: { flexDirection: 'row' },
  replyIndent: { width: 40, borderLeftWidth: 2, borderLeftColor: Colors.border, marginLeft: 20 },

  /* 댓글 입력창 – Controls/Text Field/Comment (375×57) */
  commentInputWrap: {
    borderTopWidth: 1, borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  replyingBanner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: Colors.navBar + '15',
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  replyingText: { flex: 1, fontSize: 12, color: Colors.navBar, fontWeight: '600' },
  replyingClose: { fontSize: 14, color: Colors.textTertiary, padding: 4 },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8, minHeight: 57,
  },
  commentInput: {
    flex: 1, maxHeight: 100,
    backgroundColor: Colors.surface,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 14, color: Colors.textPrimary,
  },
  sendBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.navBar, borderRadius: 18,
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendBtnText: { fontSize: 13, fontWeight: '700', color: Colors.navBarIconActive },

  /* Not found */
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  backBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
