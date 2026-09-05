import { StyleSheet, View, ScrollView, Modal, Share, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Colors } from '../../../constants/Colors';
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
import { TopAppBar } from '@/components/navigation/TopAppBar';
import { safeGoBack } from '@/constants/navigation';
import { CommunityCommentItem } from '@/src/features/community/components/CommunityCommentItem';
import { CommunityCommentComposer } from '@/src/features/community/components/CommunityCommentComposer';
import { CommunitySafetyActionSheet } from '@/src/features/community/components/CommunitySafetyActionSheet';
import { Star, MessageCircle, Bookmark, Eye } from 'lucide-react-native';

/* 즐겨찾기 별과 동일한 활성색 — Figma Point/5 골드 (하드코딩 hex 제거) */
const ACTIVE_STAR_COLOR = Colors.premium;

export default function PostDetailScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<CommunityPostDetail | null | undefined>(undefined);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  /* 답글 대상 — 배너에 닉네임을 보여주기 위해 id와 함께 이름을 들고 있는다 */
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [sendingComment, setSendingComment] = useState(false);
  /* 댓글 좋아요 낙관적 상태 — 아이템 컴포넌트가 스토어를 모르도록 부모가 소유 */
  const [commentLikes, setCommentLikes] = useState<Record<string, { liked: boolean; count: number }>>({});
  /* 댓글은 서버에서 등록순(오래된 순)으로 오므로, 최신순은 그냥 뒤집어서 보여준다 */
  const [commentSort, setCommentSort] = useState<'oldest' | 'newest'>('oldest');
  type MenuTarget = { kind: 'post' } | { kind: 'comment'; comment: CommunityComment };
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);
  /* 케밥 메뉴는 항상 눌린 케밥 버튼 바로 아래에 뜬다 — 버튼 X는 모두 고정(menuSheet의 right)이라
   * 눌렀을 때의 세로 위치(pageY)만 잡아서 top으로 넘긴다 */
  const [menuAnchorTop, setMenuAnchorTop] = useState(44);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; message: string; confirmLabel: string; onConfirm: () => Promise<void>;
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  /* 댓글 헤더의 세로 위치 — "댓글" 액션이 여기로 스크롤한다 */
  const commentsYRef = useRef(0);

  const load = useCallback(() => {
    if (!id || !authStore.isLoggedIn()) return;
    fetchPost(id).then(data => {
      setPost(data);
      if (data) {
        setLiked(authStore.isPostLiked(data.id));
        setSaved(authStore.isPostSaved(data.id));
        setLikeCount(data.likes);
        /* 서버 집계가 새로 왔으니 낙관적 오버라이드는 버린다 */
        setCommentLikes({});
      }
    });
  }, [id]);

  /* 화면 재진입 시(마이페이지 좋아요 해제 등) 최신 상태로 다시 불러옴 */
  useFocusEffect(useCallback(() => { load(); }, [load]));

  /* 게시글 상세는 로그인 회원 전용(운영자 정책) — 로그인 상태를 구독해 로그인 직후 자동 로드 */
  const [loggedIn, setLoggedIn] = useState(authStore.isLoggedIn());
  useFocusEffect(useCallback(() => { setLoggedIn(authStore.isLoggedIn()); }, []));
  useEffect(() => authStore.subscribe(() => setLoggedIn(authStore.isLoggedIn())), []);

  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(() => {
      if (post) setSaved(authStore.isPostSaved(post.id));
    });
    return unsub;
  }, [post]);

  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>{t('loginRequiredPostView')}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.backBtnText}>{t('goToLogin')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
      parentCommentId: replyingTo?.id ?? null,
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
    setReplyingTo({ id: comment.id, name: comment.author.name });
    setCommentText(`@${comment.author.name} `);
    inputRef.current?.focus?.();
  };

  /* "댓글" 액션 — 장식이 아니라 실제로 댓글 목록으로 스크롤하고 입력창에 포커스한다 */
  const handleGoToComments = () => {
    scrollRef.current?.scrollTo?.({ y: commentsYRef.current, animated: true });
    inputRef.current?.focus?.();
  };

  /* 댓글 좋아요 — 로그인 게이트 + 낙관적 토글. 아이템은 결과만 받아 그린다 */
  const likeStateOf = (comment: CommunityComment) =>
    commentLikes[comment.id] ?? { liked: authStore.isCommentLiked(comment.id), count: comment.likes };

  const handleToggleCommentLike = (comment: CommunityComment) => {
    if (!authStore.isLoggedIn()) {
      Alert.alert(t('loginRequiredTitle'), t('loginRequiredLike'), [
        { text: t('cancelLabel'), style: 'cancel' },
        { text: t('goToLogin'), onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    const current = likeStateOf(comment);
    authStore.toggleCommentLiked(comment.id);
    setCommentLikes(prev => ({
      ...prev,
      [comment.id]: { liked: !current.liked, count: current.count + (current.liked ? -1 : 1) },
    }));
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

  /* 시트가 조합해준 reason(slug + 자유 입력)을 기존 서버 contract 그대로 한 문자열로 보낸다 */
  const handleSubmitReport = async (reason: string) => {
    if (!menuTarget) return { error: null };
    return menuTarget.kind === 'post'
      ? reportPost({ postId: post.id, reportedUserId: post.authorId, reason })
      : reportComment({
          commentId: menuTarget.comment.id,
          postId: post.id,
          reportedUserId: menuTarget.comment.authorId,
          reason,
        });
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
        {/* ── TopAppBar – Figma: Navigation/TopAppBar/Post (710:4873 · 736:6169)
         * back은 직접 진입(딥링크) 시에도 항상 커뮤니티 목록으로 돌아가는 기존 동작 유지 */}
        <TopAppBar
          variant="post"
          onBack={() => safeGoBack('/tabs/community')}
          onShare={handleShare}
          onMenu={() => { setMenuAnchorTop(44); setMenuTarget({ kind: 'post' }); }}
        />

        {/* ── 안전 액션 시트 — 내 글/댓글: 수정/삭제, 남의 글/댓글: 신고(사유 chip)/차단.
         * 신고 form/sending/success는 시트 내부 상태, 삭제/차단 확인은 아래 confirm 다이얼로그 담당 */}
        <CommunitySafetyActionSheet
          language={language}
          target={menuTarget ? { kind: menuTarget.kind, isOwner: menuIsOwner } : null}
          anchorTop={menuAnchorTop}
          onClose={() => setMenuTarget(null)}
          onEdit={() => menuTarget?.kind === 'comment' ? handleEditComment(menuTarget.comment) : handleEdit()}
          onDelete={() => menuTarget?.kind === 'comment' ? handleDeleteComment(menuTarget.comment) : handleDelete()}
          onBlock={() => menuTarget?.kind === 'comment' ? handleBlockComment(menuTarget.comment) : handleBlock()}
          onSubmitReport={handleSubmitReport}
        />

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

        <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
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
              <TouchableOpacity
                style={[styles.actionBtn, liked && styles.actionBtnActive]}
                onPress={handleLike}
                accessibilityRole="button"
                accessibilityLabel={`${t('likesCount')} ${likeCount}`}
                accessibilityState={{ selected: liked }}
              >
                <AppIcon icon={Star} size={16} fill={liked ? ACTIVE_STAR_COLOR : undefined} color={liked ? ACTIVE_STAR_COLOR : undefined} />
                <Text style={[styles.actionLabel, liked && { color: Colors.error }]}>{likeCount}</Text>
              </TouchableOpacity>
              {/* 아이콘만 있던 죽은 버튼 → 댓글 목록으로 스크롤 + 입력창 포커스 */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleGoToComments}
                testID="post-comments-action"
                accessibilityRole="button"
                accessibilityLabel={`${t('commentsLabel')} ${totalComments}`}
              >
                <AppIcon icon={MessageCircle} size={16} />
                <Text style={styles.actionLabel}>{totalComments}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, saved && styles.actionBtnActive]}
                onPress={handleToggleSave}
                accessibilityRole="button"
                accessibilityLabel={saved ? t('savedLabel') : t('saveLabel')}
                accessibilityState={{ selected: saved }}
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
          <View
            style={styles.commentHeader}
            onLayout={e => { commentsYRef.current = e.nativeEvent.layout.y; }}
          >
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
                <CommunityCommentItem
                  comment={comment}
                  language={language}
                  liked={likeStateOf(comment).liked}
                  likeCount={likeStateOf(comment).count}
                  onToggleLike={() => handleToggleCommentLike(comment)}
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
                    <CommunityCommentItem
                      comment={reply}
                      language={language}
                      isReply
                      liked={likeStateOf(reply).liked}
                      likeCount={likeStateOf(reply).count}
                      onToggleLike={() => handleToggleCommentLike(reply)}
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

        {/* ── Controls/Text Field/Comment – 댓글 입력창 (1줄 → 최대 3줄) */}
        <CommunityCommentComposer
          language={language}
          value={commentText}
          onChangeText={setCommentText}
          onSend={handleSend}
          sending={sendingComment}
          replyingToName={replyingTo?.name ?? null}
          onCancelReply={() => { setReplyingTo(null); setCommentText(''); }}
          inputRef={inputRef}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* 케밥 메뉴 — Figma: 80×72, 라운드 카드 두 줄 (2글자 라벨이 안 줄바꿈되게 92px로 살짝 넓힘)
   * top은 눌린 케밥 버튼 위치에 따라 인라인으로 넘어온다 — right는 모든 케밥 버튼(게시글/댓글)이
   * commentMenuBtn과 동일한 X에 고정돼 있어 여기서는 항상 같은 값 하나만 쓴다 */
  menuBackdrop: { flex: 1, justifyContent: 'center' },

  /* 신고 사유 입력 시트 */
  reportSheet: {
    marginHorizontal: 24,
    padding: 20, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    gap: 10,
  },
  reportTitle: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  reportSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
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
  reportSubmitText: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  /* 사전 화면 단어 태그(wordBadge)와 동일 크기 */
  boardBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12,
  },
  boardBadgeStandalone: { alignSelf: 'flex-start', marginBottom: 12 },
  boardBadgeText: { fontSize: 10, fontFamily: 'NotoSerifKR_600SemiBold' },

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
  userName: { fontSize: 13, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
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
  actionLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'NotoSerifKR_600SemiBold' },

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
  commentHeaderTitle: { fontSize: 13, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  commentSortRow: { flexDirection: 'row', gap: 12 },
  commentSortText: { fontSize: 11, color: Colors.textTertiary },
  commentSortTextActive: { color: Colors.textPrimary, fontFamily: 'NotoSerifKR_600SemiBold' },

  /* 댓글 목록 */
  commentList: {},

  /* 대댓글 들여쓰기 */
  replyWrap: { flexDirection: 'row' },
  replyIndent: { width: 40, marginLeft: 20 },

  sendBtnDisabled: { backgroundColor: Colors.border },

  /* Not found */
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  backBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontFamily: 'NotoSerifKR_600SemiBold' },
});
