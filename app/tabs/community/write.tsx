import {
  StyleSheet, View, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { BOARD_COLORS, type PostBoard } from '../../../constants/mockPosts';

const BOARD_OPTIONS: PostBoard[] = ['궁금해요', 'Q&A', '질문하기'];

export default function WritePostScreen() {
  const [board, setBoard]       = useState<PostBoard>('궁금해요');
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');

  const isValid = title.trim().length >= 2 && content.trim().length >= 10;

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert(
        '작성 조건 확인',
        '제목은 2자 이상, 내용은 10자 이상 입력해주세요.',
      );
      return;
    }
    Alert.alert(
      '게시글 등록',
      '게시글이 등록됐어요!',
      [{ text: '확인', onPress: () => router.back() }],
    );
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        '작성 취소',
        '작성 중인 내용이 사라집니다. 취소할까요?',
        [
          { text: '계속 작성', style: 'cancel' },
          { text: '취소', style: 'destructive', onPress: () => router.back() },
        ],
      );
    } else {
      router.back();
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
          <Text style={styles.topBarTitle}>글쓰기</Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={!isValid}
          >
            <Text style={[styles.submitText, isValid && styles.submitTextActive]}>
              작성 완료
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
              <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[board].fg }]}>{board}</Text>
            </View>
            <Text style={styles.accordionLabel}>게시판 선택</Text>
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
                    <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[opt].fg }]}>{opt}</Text>
                  </View>
                  <Text style={styles.boardOptionDesc}>
                    {opt === '궁금해요' && '한국어 신조어가 궁금할 때'}
                    {opt === 'Q&A'      && '질문과 답변을 주고받을 때'}
                    {opt === '질문하기' && '자유롭게 의견을 나눌 때'}
                  </Text>
                  {board === opt && <Text style={{ fontSize: 14, color: BOARD_COLORS[opt].fg }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Controls/Text Field/Title_02 (375×44) */}
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력하세요 (2자 이상)"
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
            placeholder={'내용을 입력해주세요 (10자 이상)\n\n예) "안녕하세요, 속닥속닥 배우는 교과서에는 없던 진짜 국어!"'}
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
          {[
            { icon: '📷', label: '사진' },
            { icon: '🔗', label: '링크' },
            { icon: '📝', label: '서식' },
          ].map(({ icon, label }) => (
            <TouchableOpacity
              key={label}
              style={styles.toolbarBtn}
              onPress={() => Alert.alert(label, `${label} 기능은 준비 중이에요.`)}
            >
              <Text style={styles.toolbarIcon}>{icon}</Text>
              <Text style={styles.toolbarLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.toolbarDivider} />
          <View style={styles.charCountCompact}>
            <Text style={[styles.charCount, !isValid && { color: Colors.error }]}>
              {title.trim().length < 2 ? '제목 필요' : content.trim().length < 10 ? '내용 필요' : '작성 완료 ✓'}
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
});
