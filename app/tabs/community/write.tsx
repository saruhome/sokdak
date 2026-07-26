import {
  StyleSheet, View, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { BOARD_COLORS, getBoardLabel, type PostBoard } from '../../../constants/mockPosts';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { Camera, Link2, Type } from 'lucide-react-native';
import { authStore } from '../../../constants/authStore';
import { createPost } from '../../../constants/community';

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
  const [board, setBoard]       = useState<PostBoard>('궁금해요');
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert(t('validationTitle'), t('validationMessage'));
      return;
    }
    setSubmitting(true);
    const { data, error } = await createPost({ board, title: title.trim(), content: content.trim() });
    setSubmitting(false);
    if (error || !data) {
      Alert.alert(t('submitFailedTitle'), error ?? t('unknownError'));
      return;
    }
    router.replace(`/tabs/community/${data.id}`);
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        t('cancelWriteTitle'),
        t('cancelWriteMessage'),
        [
          { text: t('keepWriting'), style: 'cancel' },
          { text: t('cancelLabel'), style: 'destructive', onPress: () => router.replace('/tabs/community') },
        ],
      );
    } else {
      router.replace('/tabs/community');
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
            <Text style={styles.backIcon}>‹</Text>
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
                  {board === opt && <Text style={{ fontSize: 14, color: BOARD_COLORS[opt].fg }}>✓</Text>}
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
            style={styles.contentInput}
            placeholder={t('contentPlaceholder')}
            placeholderTextColor={Colors.textTertiary}
            value={content}
            onChangeText={setContent}
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
            return (
              <TouchableOpacity
                key={key}
                style={styles.toolbarBtn}
                onPress={() => Alert.alert(label, `${label} ${t('featureComingSoon')}`)}
              >
                <AppIcon icon={icon} size={16} />
                <Text style={styles.toolbarLabel}>{label}</Text>
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
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34, marginTop: -2 },
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
  boardBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  boardBadgeText: { fontSize: 11, fontWeight: '700' },
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
  toolbarIcon: { fontSize: 18 },
  toolbarLabel: { fontSize: 12, color: Colors.textSecondary },
  toolbarDivider: { flex: 1 },
  charCountCompact: { paddingRight: 8 },

  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  notFoundBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  notFoundBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
