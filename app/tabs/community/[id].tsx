import {
  StyleSheet, View, SafeAreaView, ScrollView, Modal,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { BOARD_COLORS, getBoardLabel } from '../../../constants/mockPosts';
import { authStore } from '../../../constants/authStore';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { fetchPost, deletePost, createComment, type CommunityComment, type CommunityPostDetail } from '../../../constants/community';
import { AppIcon, IconStat } from '@/components/AppIcon';
import {
  Star, MessageCircle, Bookmark, Share2, MoreVertical, Eye,
  Pencil, Trash2, Flag, Ban,
} from 'lucide-react-native';

const ACTIVE_STAR_COLOR = '#FACC15';

export default function PostDetailScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<CommunityPostDetail | null | undefined>(undefined);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sendingComment, setSendingComment] = useState(false);
  /* 댓글은 서버에서 등록순(오래된 순)으로 오므로, 최신순은 그냥 뒤집어서 보여준다 */
  const [commentSort, setCommentSort] = useState<'oldest' | 'newest'>('oldest');
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const load = useCallback(() => {
    if (!id) return;
    fetchPost(id).then(data => {
      setPost(data);
      if (data) {
        setLiked(authStore.isPostLiked(data.id));
        setSaved(authStore.isPostSaved(data.id));
        setLikeCount(data.likes);
      }
    });
  }, [id]);

  /* 화면 재진입 시(마이페이지 좋아요 해제 등) 최신 상태로 다시 불러옴 */
  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(() => {
      if (post) setSaved(authStore.isPostSaved(post.id));
    });
    return unsub;
  }, [post]);

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
        <Text style={styles.notFoundText}>{t('postNotFound')}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/tabs/community')}>
          <Text style={styles.backBtnText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const boardColor = BOARD_COLORS[post.board];

  const handleLike = () => {
    if (!authStore.isLoggedIn()) {
      Alert.alert(t('loginRequiredTitle'), t('loginRequiredLike'), [
        { text: t('cancelLabel'), style: 'cancel' },
        { text: t('goToLogin'), onPress: () => router.push('/auth/login') },
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
      Alert.alert(t('loginRequiredTitle'), t('loginRequiredComment'), [
        { text: t('cancelLabel'), style: 'cancel' },
        { text: t('goToLogin'), onPress: () => router.push('/auth/login') },
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
      Alert.alert(t('commentFailedTitle'), error);
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

  const handleToggleSave = () => {
    if (!post) return;
    authStore.togglePostSaved(post.id);
    setSaved(authStore.isPostSaved(post.id));
  };

  const isOwner = authStore.getUser()?.id === post.authorId;

  const handleEdit = () => {
    setMenuOpen(false);
    router.push(`/tabs/community/write?editId=${post.id}`);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    Alert.alert('게시글 삭제', '정말 삭제하시겠어요? 되돌릴 수 없어요.', [
      { text: t('cancelLabel'), style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deletePost(post.id);
          if (error) { Alert.alert('삭제 실패', error); return; }
          router.replace('/tabs/community');
        },
      },
    ]);
  };

  const handleReport = () => {
    setMenuOpen(false);
    Alert.alert('신고 접수', '신고가 접수됐어요. 운영팀이 확인할게요.');
  };

  const handleBlock = () => {
    setMenuOpen(false);
    Alert.alert('사용자 차단', `${post.author.name}님을 차단했어요.`);
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/tabs/community')}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.topBarRight}>
            <AppIcon icon={Share2} size={20} style={styles.iconButton} onPress={() => {}} />
            <AppIcon icon={MoreVertical} size={20} style={styles.iconButton} onPress={() => setMenuOpen(true)} />
          </View>
        </View>

        {/* ── 케밥 메뉴 – 내 글: 수정/삭제, 다른 사람 글: 신고/차단 ── */}
        <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuOpen(false)}>
            <View style={styles.menuSheet}>
              {isOwner ? (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                    <AppIcon icon={Pencil} size={14} color={Colors.textPrimary} />
                    <Text style={styles.menuItemText}>수정</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                    <AppIcon icon={Trash2} size={14} color={Colors.textPrimary} />
                    <Text style={styles.menuItemText}>삭제</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
                    <AppIcon icon={Flag} size={14} color={Colors.textPrimary} />
                    <Text style={styles.menuItemText}>신고</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
                    <AppIcon icon={Ban} size={14} color={Colors.textPrimary} />
                    <Text style={styles.menuItemText}>차단</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── 게시글 본문 영역 ── */}
          <View style={styles.postSection}>
            <View style={[styles.boardBadge, styles.boardBadgeStandalone, { backgroundColor: boardColor.bg }]}>
              <Text style={[styles.boardBadgeText, { color: boardColor.fg }]}>{getBoardLabel(post.board, language)}</Text>
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
                <AppIcon icon={Star} size={16} fill={liked ? ACTIVE_STAR_COLOR : undefined} color={liked ? ACTIVE_STAR_COLOR : undefined} />
                <Text style={[styles.actionLabel, liked && { color: Colors.error }]}>{likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <AppIcon icon={MessageCircle} size={16} />
                <Text style={styles.actionLabel}>{totalComments}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, saved && styles.actionBtnActive]}
                onPress={handleToggleSave}
              >
                <AppIcon icon={Bookmark} size={16} fill={saved ? Colors.accent : undefined} color={saved ? Colors.accent : undefined} />
                <Text style={[styles.actionLabel, saved && { color: Colors.accent }]}>
                  {saved ? t('savedLabel') : t('saveLabel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <AppIcon icon={Share2} size={16} />
                <Text style={styles.actionLabel}>{t('shareLabel')}</Text>
              </TouchableOpacity>
            </View>

            {/* Group 189 – 조회·좋아요·댓글 메타 */}
            <View style={styles.metaRow}>
              <IconStat icon={Eye} value={`${t('viewsLabel')} ${post.views}`} textStyle={styles.metaItem} />
              <Text style={styles.metaDot}>·</Text>
              <IconStat icon={Star} value={`${t('likesCount')} ${likeCount}`} textStyle={styles.metaItem} />
              <Text style={styles.metaDot}>·</Text>
              <IconStat icon={MessageCircle} value={`${t('commentsLabel')} ${totalComments}`} textStyle={styles.metaItem} />
            </View>
          </View>

          {/* ── Display/List Header – 댓글 헤더 + 정렬(등록순/최신순) ── */}
          <View style={styles.commentHeader}>
            <Text style={styles.commentHeaderTitle}>
              {language === 'ko' ? `댓글 ${totalComments}개` : `${totalComments} ${t('commentsLabel')}`}
            </Text>
            <View style={styles.commentSortRow}>
              <TouchableOpacity onPress={() => setCommentSort('oldest')}>
                <Text style={[styles.commentSortText, commentSort === 'oldest' && styles.commentSortTextActive]}>
                  {t('sortOldest')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCommentSort('newest')}>
                <Text style={[styles.commentSortText, commentSort === 'newest' && styles.commentSortTextActive]}>
                  {t('sortNewest')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Controls/TextField/Comment/대댓글 O – 댓글 목록 */}
          <View style={styles.commentList}>
            {(commentSort === 'newest' ? [...post.comments].reverse() : post.comments).map(comment => (
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
              <Text style={styles.replyingText}>{t('replyingLabel')}</Text>
              <TouchableOpacity onPress={() => { setReplyingTo(null); setCommentText(''); }}>
                <Text style={styles.replyingClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.commentInputRow}>
            <TextInput
              ref={inputRef}
              style={styles.commentInput}
              placeholder={t('commentPlaceholder')}
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
              <Text style={styles.sendBtnText}>{sendingComment ? t('sendingLabel') : t('sendLabel')}</Text>
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
            <AppIcon icon={Star} size={13} fill={liked ? ACTIVE_STAR_COLOR : undefined} color={liked ? ACTIVE_STAR_COLOR : undefined} />
            <Text style={styles.commentActionText}>{liked ? 1 : 0}</Text>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity style={styles.commentAction} onPress={onReply}>
              <Text style={styles.commentActionText}>{languageStore.t('replyLabel')}</Text>
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

  /* 케밥 메뉴 — Figma: 80×72, 라운드 카드 두 줄 (2글자 라벨이 안 줄바꿈되게 92px로 살짝 넓힘) */
  menuBackdrop: { flex: 1 },
  menuSheet: {
    position: 'absolute', top: 44, right: 6, width: 92,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, overflow: 'hidden',
    shadowColor: '#909090', shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  menuItem: {
    height: 36, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12,
  },
  menuItemText: { fontSize: 13, color: Colors.textPrimary, fontFamily: undefined, flexShrink: 0 },
  menuDivider: { height: 1, backgroundColor: Colors.border },
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

  /* 댓글 헤더 – Display/List Header (375×42) + 정렬(등록순/최신순) */
  commentHeader: {
    height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  commentHeaderTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  commentSortRow: { flexDirection: 'row', gap: 12 },
  commentSortText: { fontSize: 11, color: Colors.textTertiary },
  commentSortTextActive: { color: Colors.textPrimary, fontWeight: '700' },

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
