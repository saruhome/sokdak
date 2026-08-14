import {
  StyleSheet, View, SafeAreaView, TextInput, Modal,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { BOARD_COLORS, getBoardLabel, type PostBoard } from '../../../constants/mockPosts';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { Camera, Link2, Type, Bold, Italic, Check } from 'lucide-react-native';
import { authStore } from '../../../constants/authStore';
import { createPost, fetchPost, updatePost, uploadPostImage } from '../../../constants/community';
import { validateCommunityPost } from '../../../constants/communitySafety';
import { BackIcon } from '@/components/icons/SocialIcons';

const BOARD_OPTIONS: PostBoard[] = ['궁금해요', 'Q&A', '질문하기'];

/** Figma: Controls/Icon/Icon Group — 하단 툴바 아이콘 */
const TOOLBAR_ITEMS = [
  { icon: Camera, key: '사진', labelKey: 'toolbarPhoto' } as const,
  { icon: Link2, key: '링크', labelKey: 'toolbarLink' } as const,
  { icon: Type, key: '서식', labelKey: 'toolbarFormat' } as const,
];

export default function WritePostScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const [board, setBoard]       = useState<PostBoard>('궁금해요');
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* 사진/링크/서식 툴바 — 마지막으로 알려진 커서/선택 위치에 마크업을 끼워 넣는다 */
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const contentInputRef = useRef<TextInput>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);

  /* 수정 진입 — editId로 열리면 기존 글을 불러와 채워둔다 */
  useEffect(() => {
    if (!editId) return;
    fetchPost(editId).then(post => {
      if (!post) return;
      setBoard(post.board);
      setTitle(post.title);
      setContent(post.content);
    });
  }, [editId]);

  if (!authStore.isLoggedIn()) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>{t('loginRequiredTitle')}</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.notFoundBtnText}>{t('goToLogin')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isValid = title.trim().length >= 2 && content.trim().length >= 10;

  /* 선택된 구간(없으면 커서 위치)을 before/after 마크업으로 감싼다 — 서식(굵게/기울임)용 */
  const wrapSelection = (before: string, after: string, placeholder: string) => {
    const { start, end } = selection;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    const cursor = start + before.length + selected.length + after.length;
    setContent(next);
    setSelection({ start: cursor, end: cursor });
    setFormatMenuOpen(false);
    contentInputRef.current?.focus();
  };

  /* 선택 구간을 지우고 그 자리에 텍스트를 끼워 넣는다 — 링크/사진용 */
  const insertAtCursor = (text: string) => {
    const { start, end } = selection;
    const next = content.slice(0, start) + text + content.slice(end);
    const cursor = start + text.length;
    setContent(next);
    setSelection({ start: cursor, end: cursor });
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissionNeededTitle'), t('galleryPermissionMessage'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    setUploadingPhoto(true);
    const { url, error } = await uploadPostImage(result.assets[0].uri);
    setUploadingPhoto(false);
    if (error || !url) {
      Alert.alert(t('uploadFailedTitle'), error ?? t('unknownError'));
      return;
    }
    insertAtCursor(`\n![](${url})\n`);
  };

  const openLinkModal = () => {
    const { start, end } = selection;
    setLinkLabel(content.slice(start, end));
    setLinkUrl('');
    setLinkModalOpen(true);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      Alert.alert(t('inputCheckTitle'), t('linkUrlRequiredMessage'));
      return;
    }
    const label = linkLabel.trim() || linkUrl.trim();
    /* 링크는 선택 구간을 대체하므로, 선택돼 있던 텍스트(label 프리필 출처)까지 포함해 지운다 */
    insertAtCursor(`[${label}](${linkUrl.trim()})`);
    setLinkModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert(t('validationTitle'), t('validationMessage'));
      return;
    }

    const safety = validateCommunityPost(title, content);
    if (!safety.ok) {
      Alert.alert('게시할 수 없는 내용이에요', safety.message);
      return;
    }

    const acceptedGuidelines = await authStore.hasAcceptedCommunityGuidelines();
    if (!acceptedGuidelines) {
      Alert.alert(
        '운영정책 동의가 필요해요',
        '안전한 커뮤니티 운영을 위해 게시글을 작성하기 전에 운영정책에 동의해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '운영정책 보기', onPress: () => router.push('/tabs/mypage/community-guidelines') },
        ],
      );
      return;
    }

    setSubmitting(true);
    const params = { board, title: title.trim(), content: content.trim() };
    const { error, id } = editId
      ? await updatePost(editId, params).then(res => ({ ...res, id: editId }))
      : await createPost(params).then(res => ({ error: res.error, id: res.data?.id }));
    setSubmitting(false);
    if (error || !id) {
      Alert.alert(t('submitFailedTitle'), error ?? t('unknownError'));
      return;
    }
    router.replace(`/tabs/community/${id}`);
  };

  const cancelDestination = editId ? `/tabs/community/${editId}` : '/tabs/community';
  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        t('cancelWriteTitle'),
        t('cancelWriteMessage'),
        [
          { text: t('keepWriting'), style: 'cancel' },
          { text: t('cancelLabel'), style: 'destructive', onPress: () => router.replace(cancelDestination) },
        ],
      );
    } else {
      router.replace(cancelDestination);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ── TopAppBar – Figma: Navigation/TopAppBar/Write with Title(724:4248), state=작성 전/완료 */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={handleCancel}>
            <BackIcon size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{t('writeTitle')}</Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={!isValid || submitting}
          >
            <Text style={[styles.submitText, isValid && !submitting && styles.submitTextActive]}>
              {submitting ? t('submitting') : t('submitComplete')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* ── Controls/Accordion/게시물 종류 (375×44) */}
          <TouchableOpacity
            style={styles.accordion}
            onPress={() => setAccordionOpen(p => !p)}
            activeOpacity={0.8}
          >
            <View style={[styles.boardBadge, { backgroundColor: BOARD_COLORS[board].bg }]}>
              <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[board].fg }]}>{getBoardLabel(board, language)}</Text>
            </View>
            <Text style={styles.accordionLabel}>{t('boardSelectLabel')}</Text>
            <Text style={styles.accordionArrow}>{accordionOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {accordionOpen && (
            <View style={styles.boardOptions}>
              {BOARD_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.boardOption,
                    board === opt && { backgroundColor: BOARD_COLORS[opt].bg + '15' },
                  ]}
                  onPress={() => { setBoard(opt); setAccordionOpen(false); }}
                >
                  <View style={[styles.boardBadge, { backgroundColor: BOARD_COLORS[opt].bg }]}>
                    <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[opt].fg }]}>{getBoardLabel(opt, language)}</Text>
                  </View>
                  <Text style={styles.boardOptionDesc}>
                    {opt === '궁금해요' && t('boardDescCurious')}
                    {opt === 'Q&A'      && t('boardDescQA')}
                    {opt === '질문하기' && t('boardDescAsk')}
                  </Text>
                  {board === opt && <AppIcon icon={Check} size={16} color={BOARD_COLORS[opt].fg} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Controls/Text Field/Title_02 (375×44) */}
          <TextInput
            style={styles.titleInput}
            placeholder={t('titlePlaceholder')}
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            returnKeyType="next"
          />
          <View style={styles.divider} />

          {/* ── 내용 입력 (Frame 28) */}
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            placeholder={t('contentPlaceholder')}
            placeholderTextColor={Colors.textTertiary}
            value={content}
            onChangeText={setContent}
            onSelectionChange={e => setSelection(e.nativeEvent.selection)}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />

          {/* 글자수 카운터 */}
          <View style={styles.charCountRow}>
            <Text style={styles.charCount}>{content.length} / 2000</Text>
          </View>
        </ScrollView>

        {/* ── Controls/Icon/Icon Group (375×52) – 하단 툴바 */}
        <View style={styles.toolbar}>
          {TOOLBAR_ITEMS.map(({ icon, key, labelKey }) => {
            const label = t(labelKey);
            const onPress = key === '사진' ? handlePickPhoto
              : key === '링크' ? openLinkModal
              : () => setFormatMenuOpen(p => !p);
            const busy = key === '사진' && uploadingPhoto;
            return (
              <TouchableOpacity
                key={key}
                style={styles.toolbarBtn}
                onPress={onPress}
                disabled={busy}
              >
                <AppIcon icon={icon} size={16} />
                <Text style={styles.toolbarLabel}>{busy ? t('uploadingPhoto') : label}</Text>
              </TouchableOpacity>
            );
          })}
          <View style={styles.toolbarDivider} />
          <View style={styles.charCountCompact}>
            <Text style={[styles.charCount, !isValid && { color: Colors.error }]}>
              {title.trim().length < 2 ? t('titleNeeded') : content.trim().length < 10 ? t('contentNeeded') : t('readyToPost')}
            </Text>
          </View>
        </View>

        {/* ── 서식(굵게/기울임) 팝업 — 툴바 바로 위에 뜬다 ── */}
        <Modal visible={formatMenuOpen} transparent animationType="fade" onRequestClose={() => setFormatMenuOpen(false)}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setFormatMenuOpen(false)}>
            <View style={styles.formatSheet}>
              <TouchableOpacity style={styles.formatOption} onPress={() => wrapSelection('**', '**', t('boldLabel'))}>
                <AppIcon icon={Bold} size={16} color={Colors.textPrimary} />
                <Text style={styles.formatOptionText}>{t('boldLabel')}</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.formatOption} onPress={() => wrapSelection('_', '_', t('italicLabel'))}>
                <AppIcon icon={Italic} size={16} color={Colors.textPrimary} />
                <Text style={styles.formatOptionText}>{t('italicLabel')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ── 링크 추가 모달 ── */}
        <Modal visible={linkModalOpen} transparent animationType="fade" onRequestClose={() => setLinkModalOpen(false)}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setLinkModalOpen(false)}>
            <TouchableOpacity style={styles.linkSheet} activeOpacity={1}>
              <Text style={styles.linkSheetTitle}>{t('linkModalTitle')}</Text>
              <TextInput
                style={styles.linkInput}
                value={linkUrl}
                onChangeText={setLinkUrl}
                placeholder={t('linkUrlPlaceholder')}
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TextInput
                style={styles.linkInput}
                value={linkLabel}
                onChangeText={setLinkLabel}
                placeholder={t('linkLabelPlaceholder')}
                placeholderTextColor={Colors.textTertiary}
              />
              <View style={styles.linkActions}>
                <TouchableOpacity style={styles.linkCancelBtn} onPress={() => setLinkModalOpen(false)}>
                  <Text style={styles.linkCancelText}>{t('cancelLabel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.linkSubmitBtn, !linkUrl.trim() && styles.sendBtnDisabled]}
                  onPress={handleInsertLink}
                  disabled={!linkUrl.trim()}
                >
                  <Text style={styles.linkSubmitText}>{t('linkInsert')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* TopAppBar/Write */
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  submitBtn: { paddingHorizontal: 12, height: 44, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontSize: 14, fontWeight: '600', color: Colors.textTertiary },
  submitTextActive: { color: Colors.navBar, fontWeight: '700' },

  scroll: { flex: 1 },

  /* Controls/Accordion/게시물 종류 (375×44) */
  accordion: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  /* 사전 화면 단어 태그(wordBadge)와 동일 크기 */
  boardBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  boardBadgeText: { fontSize: 10, fontWeight: '700' },
  accordionLabel: { flex: 1, fontSize: 14, color: Colors.textSecondary },
  accordionArrow: { fontSize: 12, color: Colors.textTertiary },

  /* 게시판 선택 옵션 */
  boardOptions: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  boardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  boardOptionDesc: { flex: 1, fontSize: 12, color: Colors.textTertiary },

  /* Controls/Text Field/Title_02 (375×44) */
  titleInput: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  divider: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 16 },

  /* 내용 입력 */
  contentInput: {
    minHeight: 300,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  charCountRow: { paddingHorizontal: 16, paddingBottom: 8, alignItems: 'flex-end' },
  charCount: { fontSize: 11, color: Colors.textTertiary },

  /* Controls/Icon/Icon Group (375×52) */
  toolbar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
    gap: 4,
  },
  toolbarBtn: { paddingHorizontal: 10, alignItems: 'center', flexDirection: 'row', gap: 5 },
  toolbarLabel: { fontSize: 12, color: Colors.textSecondary },
  toolbarDivider: { flex: 1 },
  charCountCompact: { paddingRight: 8 },

  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  notFoundBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  notFoundBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },

  /* 서식/링크 팝업 공용 백드롭 */
  menuBackdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  menuDivider: { height: 1, backgroundColor: Colors.border },

  /* 서식(굵게/기울임) 팝업 — 툴바 바로 위 */
  formatSheet: {
    marginBottom: 60, width: 160, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, overflow: 'hidden',
    shadowColor: '#909090', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  formatOption: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  formatOptionText: { fontSize: 13, color: Colors.textPrimary },

  /* 링크 추가 모달 */
  linkSheet: {
    marginHorizontal: 24, padding: 20, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  linkSheetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  linkInput: {
    height: 44, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background, paddingHorizontal: 12,
    fontSize: 14, color: Colors.textPrimary,
  },
  linkActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  linkCancelBtn: {
    flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  linkCancelText: { fontSize: 14, color: Colors.textSecondary },
  linkSubmitBtn: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.navBar },
  linkSubmitText: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
