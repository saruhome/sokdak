import {
  StyleSheet, View, SafeAreaView, ScrollView, Modal, Share,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator, type GestureResponderEvent,
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
import {
  fetchPost, deletePost, reportPost, createComment,
  updateComment, deleteComment, reportComment,
  type CommunityComment, type CommunityPostDetail,
} from '../../../constants/community';
import { validateCommunityText } from '../../../constants/communitySafety';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { PostRichText } from '@/components/PostRichText';
import {
  Star, MessageCircle, Bookmark, Share2, MoreVertical, Eye,
  Pencil, Trash2, Flag, Ban, ChevronLeft, X,
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
  type MenuTarget = { kind: 'post' } | { kind: 'comment'; comment: CommunityComment };
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);
  /* 케밥 메뉴는 항상 눌린 케밥 버튼 바로 아래에 뜬다 — 버튼 X는 모두 고정(menuSheet의 right)이라
   * 눌렀을 때의 세로 위치(pageY)만 잡아서 top으로 넘긴다 */
  const [menuAnchorTop, setMenuAnchorTop] = useState(44);
  const [reportTarget, setReportTarget] = useState<MenuTarget | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; message: string; confirmLabel: string; onConfirm: () => Promise<void>;
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
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

    const safety = validateCommunityText(commentText, 'comment');
    if (!safety.ok) {
      Alert.alert('게시할 수 없는 내용이에요', safety.message);
      return;
    }

    if (!authStore.isLoggedIn()) {
      Alert.alert(t('loginRequiredTitle'), t('loginRequiredComment'), [
        { text: t('cancelLabel'), style: 'cancel' },
        { text: t('goToLogin'), onPress: () => router.push('/auth/login') },
      ]);
      return;
    }

    const acceptedGuidelines = await authStore.hasAcceptedCommunityGuidelines();
    if (!acceptedGuidelines) {
      Alert.alert(
        '운영정책 동의가 필요해요',
        '안전한 커뮤니티 운영을 위해 댓글을 작성하기 전에 운영정책에 동의해주세요.',
        [
          { text: t('cancelLabel'), style: 'cancel' },
          { text: '운영정책 보기', onPress: () => router.push('/tabs/mypage/community-guidelines') },
        ],
      );
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

  /* 단어 즐겨찾기와 동일하게 비로그인도 허용 — 세션 동안 유지되고 로그인 시 계정으로 이관된다(authStore) */
  const handleToggleSave = () => {
    if (!post) return;
    authStore.togglePostSaved(post.id);
    setSaved(authStore.isPostSaved(post.id));
  };

  const myId = authStore.getUser()?.id;
  const isOwner = myId === post.authorId;
  const menuIsOwner = menuTarget?.kind === 'comment' ? myId === menuTarget.comment.authorId : isOwner;

  const handleEdit = () => {
    setMenuTarget(null);
    router.push(`/tabs/community/write?editId=${post.id}`);
  };

  const handleDelete = () => {
    setMenuTarget(null);
    setConfirmDialog({
      title: t('deletePostTitle'),
      message: t('deleteConfirmMessage'),
      confirmLabel: t('deleteLabel'),
      onConfirm: async () => {
        const { error } = await deletePost(post.id);
        if (error) { Alert.alert(t('deleteFailedTitle'), error); return; }
        setConfirmDialog(null);
        router.replace('/tabs/community');
      },
    });
  };

  /* OS 네이티브 공유 시트만 띄운다 — 브라우저나 다른 화면으로 나가지 않고 앱 안에 그대로 머문다 */
  const handleShare = () => {
    Share.share({ title: post.title, message: `${post.title}\n\n${post.content}` }).catch(() => {});
  };

  const handleReport = () => {
    setMenuTarget(null);
    setReportReason('');
    setReportTarget({ kind: 'post' });
  };

  const handleBlock = () => {
    setMenuTarget(null);
    setConfirmDialog({
      title: t('blockUserTitle'),
      message: `${t('blockConfirmMessagePrefix')}${post.author.name}${t('blockConfirmMessageSuffix')}`,
      confirmLabel: t('blockLabel'),
      onConfirm: async () => {
        const { error } = await authStore.blockUser(post.authorId);
        if (error) { Alert.alert(t('blockFailedTitle'), error); return; }
        setConfirmDialog(null);
        router.replace('/tabs/community');
      },
    });
  };

  /* ── 댓글 케밥 메뉴 액션 — 게시글과 동일한 패턴, 대상만 댓글로 바뀜 ── */
  const handleEditComment = (comment: CommunityComment) => {
    setMenuTarget(null);
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleSaveCommentEdit = async () => {
    if (!editingCommentId || !editingText.trim()) return;
    setSavingEdit(true);
    const { error } = await updateComment(editingCommentId, editingText.trim());
    setSavingEdit(false);
    if (error) { Alert.alert(t('editFailedTitle'), error); return; }
    setEditingCommentId(null);
    load();
  };

  const handleDeleteComment = (comment: CommunityComment) => {
    setMenuTarget(null);
    setConfirmDialog({
      title: t('deleteCommentTitle'),
      message: t('deleteConfirmMessage'),
      confirmLabel: t('deleteLabel'),
      onConfirm: async () => {
        const { error } = await deleteComment(comment.id);
        if (error) { Alert.alert(t('deleteFailedTitle'), error); return; }
        setConfirmDialog(null);
        load();
      },
    });
  };

  const handleReportComment = (comment: CommunityComment) => {
    setMenuTarget(null);
    setReportReason('');
    setReportTarget({ kind: 'comment', comment });
  };

  const handleBlockComment = (comment: CommunityComment) => {
    setMenuTarget(null);
    setConfirmDialog({
      title: t('blockUserTitle'),
      message: `${t('blockConfirmMessagePrefix')}${comment.author.name}${t('blockConfirmMessageSuffix')}`,
      confirmLabel: t('blockLabel'),
      onConfirm: async () => {
        const { error } = await authStore.blockUser(comment.authorId);
        if (error) { Alert.alert(t('blockFailedTitle'), error); return; }
        setConfirmDialog(null);
        load();
      },
    });
  };

  const handleSubmitReport = async () => {
    if (!reportTarget || !reportReason.trim()) {
      Alert.alert(t('reportReasonRequiredTitle'), t('reportReasonRequiredMessage'));
      return;
    }
    setReporting(true);
    const { error } = reportTarget.kind === 'post'
      ? await reportPost({ postId: post.id, reportedUserId: post.authorId, reason: reportReason.trim() })
      : await reportComment({
          commentId: reportTarget.comment.id,
          postId: post.id,
          reportedUserId: reportTarget.comment.authorId,
          reason: reportReason.trim(),
        });
    setReporting(false);
    if (error) { Alert.alert(t('reportFailedTitle'), error); return; }
    setReportTarget(null);
    Alert.alert(t('reportReceivedTitle'), t('reportReceivedMessage'));
  };

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    setConfirmBusy(true);
    await confirmDialog.onConfirm();
    setConfirmBusy(false);
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
          <AppIcon
            icon={ChevronLeft} size={20} style={styles.backButton}
            onPress={() => router.replace('/tabs/community')}
          />
          <View style={styles.topBarRight}>
            <AppIcon icon={Share2} size={20} style={styles.iconButton} onPress={handleShare} />
            <AppIcon
              icon={MoreVertical} size={20} style={styles.iconButton}
              onPress={() => { setMenuAnchorTop(44); setMenuTarget({ kind: 'post' }); }}
            />
          </View>
        </View>

        {/* ── 케밥 메뉴 – 내 글/댓글: 수정/삭제, 다른 사람 글/댓글: 신고/차단 ── */}
        <Modal visible={!!menuTarget} transparent animationType="fade" onRequestClose={() => setMenuTarget(null)}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuTarget(null)}>
            <View style={[styles.menuSheet, { top: menuAnchorTop }]}>
              {menuIsOwner ? (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => menuTarget?.kind === 'comment' ? handleEditComment(menuTarget.comment) : handleEdit()}
                  >
                    <AppIcon icon={Pencil} size={14} color={Colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('editLabel')}</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => menuTarget?.kind === 'comment' ? handleDeleteComment(menuTarget.comment) : handleDelete()}
                  >
                    <AppIcon icon={Trash2} size={14} color={Colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('deleteLabel')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => menuTarget?.kind === 'comment' ? handleReportComment(menuTarget.comment) : handleReport()}
                  >
                    <AppIcon icon={Flag} size={14} color={Colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('reportLabel')}</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => menuTarget?.kind === 'comment' ? handleBlockComment(menuTarget.comment) : handleBlock()}
                  >
                    <AppIcon icon={Ban} size={14} color={Colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('blockLabel')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ── 신고 사유 입력 (게시글/댓글 공용) ── */}
        <Modal visible={!!reportTarget} transparent animationType="fade" onRequestClose={() => setReportTarget(null)}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setReportTarget(null)}>
            <TouchableOpacity style={styles.reportSheet} activeOpacity={1}>
              <Text style={styles.reportTitle}>{reportTarget?.kind === 'comment' ? t('reportCommentTitle') : t('reportPostTitle')}</Text>
              <Text style={styles.reportSub}>{t('reportSheetSub')}</Text>
              <TextInput
                style={styles.reportInput}
                value={reportReason}
                onChangeText={setReportReason}
                placeholder={t('reportReasonPlaceholder')}
                placeholderTextColor={Colors.textTertiary}
                multiline
                maxLength={300}
              />
              <View style={styles.reportActions}>
                <TouchableOpacity style={styles.reportCancelBtn} onPress={() => setReportTarget(null)}>
                  <Text style={styles.reportCancelText}>{t('cancelLabel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reportSubmitBtn, (!reportReason.trim() || reporting) && styles.sendBtnDisabled]}
                  onPress={handleSubmitReport}
                  disabled={!reportReason.trim() || reporting}
                >
                  <Text style={styles.reportSubmitText}>{reporting ? t('reportSubmittingLabel') : t('reportSubmitBtn')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* ── 삭제/차단 확인 (게시글/댓글 공용) ── */}
        <Modal visible={!!confirmDialog} transparent animationType="fade" onRequestClose={() => setConfirmDialog(null)}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setConfirmDialog(null)}>
            <TouchableOpacity style={styles.reportSheet} activeOpacity={1}>
              <Text style={styles.reportTitle}>{confirmDialog?.title}</Text>
              <Text style={styles.reportSub}>{confirmDialog?.message}</Text>
              <View style={styles.reportActions}>
                <TouchableOpacity style={styles.reportCancelBtn} onPress={() => setConfirmDialog(null)}>
                  <Text style={styles.reportCancelText}>{t('cancelLabel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reportSubmitBtn, confirmBusy && styles.sendBtnDisabled]}
                  onPress={handleConfirm}
                  disabled={confirmBusy}
                >
                  <Text style={styles.reportSubmitText}>{confirmBusy ? t('processingLabel') : confirmDialog?.confirmLabel}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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

            {/* 본문 — 글쓰기 툴바(사진/링크/서식)가 남긴 마크업을 실제로 렌더링 */}
            <PostRichText content={post.content} textStyle={styles.postContent} />

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
                  onMenuPress={pageY => { setMenuAnchorTop(pageY + 16); setMenuTarget({ kind: 'comment', comment }); }}
                  isEditing={editingCommentId === comment.id}
                  editText={editingText}
                  onChangeEditText={setEditingText}
                  onSaveEdit={handleSaveCommentEdit}
                  onCancelEdit={() => setEditingCommentId(null)}
                  savingEdit={savingEdit}
                />
                {/* 대댓글 (들여쓰기) */}
                {comment.replies?.map(reply => (
                  <View key={reply.id} style={styles.replyWrap}>
                    <View style={styles.replyIndent} />
                    <CommentItem
                      comment={reply}
                      isReply
                      onReply={() => handleReply(comment)}
                      onMenuPress={pageY => { setMenuAnchorTop(pageY + 16); setMenuTarget({ kind: 'comment', comment: reply }); }}
                      isEditing={editingCommentId === reply.id}
                      editText={editingText}
                      onChangeEditText={setEditingText}
                      onSaveEdit={handleSaveCommentEdit}
                      onCancelEdit={() => setEditingCommentId(null)}
                      savingEdit={savingEdit}
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
                <AppIcon icon={X} size={14} color={Colors.textTertiary} />
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
  comment, isReply = false, onReply, onMenuPress,
  isEditing, editText, onChangeEditText, onSaveEdit, onCancelEdit, savingEdit,
}: {
  comment: CommunityComment;
  isReply?: boolean;
  onReply: () => void;
  onMenuPress: (pageY: number) => void;
  isEditing: boolean;
  editText: string;
  onChangeEditText: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  savingEdit: boolean;
}) {
  const [liked, setLiked] = useState(() => authStore.isCommentLiked(comment.id));
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleToggleLike = () => {
    if (!authStore.isLoggedIn()) {
      Alert.alert(languageStore.t('loginRequiredTitle'), languageStore.t('loginRequiredLike'), [
        { text: languageStore.t('cancelLabel'), style: 'cancel' },
        { text: languageStore.t('goToLogin'), onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    authStore.toggleCommentLiked(comment.id);
    setLiked(p => !p);
    setLikeCount(p => liked ? p - 1 : p + 1);
  };

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
              <TouchableOpacity style={styles.commentEditCancelBtn} onPress={onCancelEdit}>
                <Text style={styles.commentEditCancelText}>{languageStore.t('cancelLabel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.commentEditSaveBtn, (!editText.trim() || savingEdit) && styles.sendBtnDisabled]}
                onPress={onSaveEdit}
                disabled={!editText.trim() || savingEdit}
              >
                <Text style={styles.commentEditSaveText}>{savingEdit ? languageStore.t('savingLabel') : languageStore.t('saveBtnLabel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.commentContent}>{comment.content}</Text>
        )}
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.commentAction}
            onPress={handleToggleLike}
          >
            <AppIcon icon={Star} size={13} fill={liked ? ACTIVE_STAR_COLOR : undefined} color={liked ? ACTIVE_STAR_COLOR : undefined} />
            <Text style={styles.commentActionText}>{likeCount}</Text>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity style={styles.commentAction} onPress={onReply}>
              <Text style={styles.commentActionText}>{languageStore.t('replyLabel')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <AppIcon
        icon={MoreVertical} size={14} color={Colors.textTertiary}
        style={styles.commentMenuBtn}
        onPress={(e: GestureResponderEvent) => onMenuPress(e.nativeEvent.pageY)}
      />
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
  topBarRight: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },

  /* 케밥 메뉴 — Figma: 80×72, 라운드 카드 두 줄 (2글자 라벨이 안 줄바꿈되게 92px로 살짝 넓힘)
   * top은 눌린 케밥 버튼 위치에 따라 인라인으로 넘어온다 — right는 모든 케밥 버튼(게시글/댓글)이
   * commentMenuBtn과 동일한 X에 고정돼 있어 여기서는 항상 같은 값 하나만 쓴다 */
  menuBackdrop: { flex: 1, justifyContent: 'center' },
  menuSheet: {
    position: 'absolute', right: 6, width: 92,
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

  /* 신고 사유 입력 시트 */
  reportSheet: {
    marginHorizontal: 24,
    padding: 20, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    gap: 10,
  },
  reportTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  reportSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  reportInput: {
    minHeight: 80, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background, padding: 12,
    fontSize: 14, color: Colors.textPrimary, textAlignVertical: 'top',
  },
  reportActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  reportCancelBtn: {
    flex: 1, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  reportCancelText: { fontSize: 14, color: Colors.textSecondary },
  reportSubmitBtn: {
    flex: 1, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar,
  },
  reportSubmitText: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive },
  /* 사전 화면 단어 태그(wordBadge)와 동일 크기 */
  boardBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12,
  },
  boardBadgeStandalone: { alignSelf: 'flex-start', marginBottom: 12 },
  boardBadgeText: { fontSize: 10, fontWeight: '700' },

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
  /* paddingRight — commentMenuBtn(절대 위치, right:17~39)이 이 줄과 같은 높이라
   * marginLeft:'auto'로 오른쪽 끝까지 붙는 날짜가 케밥 버튼과 겹치지 않게 그만큼 비워둔다 */
  commentAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 24 },
  commentAuthor: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  commentDate: { fontSize: 11, color: Colors.textTertiary, marginLeft: 'auto' },
  /* right:17 — topBar 케밥(paddingHorizontal:8 + iconButton 40 폭의 중심)과 아이콘 중심 X가
   * 일치하도록 계산한 값. 댓글마다 화면 위치가 달라도 X는 무조건 이 값 하나로 고정된다 */
  commentMenuBtn: {
    position: 'absolute', top: 14, right: 17,
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
  },
  commentContent: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  commentActions: { flexDirection: 'row', gap: 14 },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentActionText: { fontSize: 12, color: Colors.textTertiary },

  /* 댓글 인라인 수정 */
  commentEditWrap: { gap: 8 },
  commentEditInput: {
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
  commentEditSaveText: { fontSize: 12, fontWeight: '700', color: Colors.navBarIconActive },

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
  commentInputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  /* 입력창 높이를 전송 버튼과 똑같이 고정 — multiline을 빼서 줄바꿈으로 커지는 대신
   * 한 줄 안에서 가로로 계속 이어 쓸 수 있게 했다(웹/네이티브 모두 높이가 안 바뀐다) */
  commentInput: {
    flex: 1, height: 36,
    backgroundColor: Colors.surface,
    borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 14, color: Colors.textPrimary,
  },
  sendBtn: {
    height: 36, paddingHorizontal: 14,
    alignItems: 'center', justifyContent: 'center',
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
