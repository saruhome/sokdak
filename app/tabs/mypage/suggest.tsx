import {
  StyleSheet, View, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { CATEGORIES } from '../../../constants/categories';

/** Figma: 229:3332(입력 전) / 229:3342(입력 후) — 신조어 제안 폼 */
export default function SuggestScreen() {
  const [word, setWord] = useState('');
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = word.trim().length >= 1 && !!categorySlug && definition.trim().length >= 5;

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setWord('');
    setCategorySlug(null);
    setDefinition('');
    setExample('');
    setSubmitted(false);
  };

  /* ── 입력 후: 제안 완료 상태 (Figma: 229:3342) ── */
  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>신조어 제안하기</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>제안 감사해요!</Text>
          <Text style={styles.doneDesc}>
            '{word}' 제안을 잘 받았어요.{'\n'}검토 후 사전에 반영될 수 있어요.
          </Text>

          <View style={styles.donePreviewCard}>
            <View style={styles.donePreviewTop}>
              <Text style={styles.donePreviewWord}>{word}</Text>
              {categorySlug && (
                <Text style={styles.donePreviewCategory}>
                  {CATEGORIES.find(c => c.slug === categorySlug)?.emoji}{' '}
                  {CATEGORIES.find(c => c.slug === categorySlug)?.name}
                </Text>
              )}
            </View>
            <Text style={styles.donePreviewDefinition}>{definition}</Text>
          </View>

          <TouchableOpacity style={styles.doneCtaPrimary} onPress={handleReset} activeOpacity={0.85}>
            <Text style={styles.doneCtaPrimaryText}>다른 단어 제안하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneCtaSecondary} onPress={() => safeGoBack()}>
            <Text style={styles.doneCtaSecondaryText}>마이페이지로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ── 입력 전: 제안 폼 (Figma: 229:3332) ── */
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>신조어 제안하기</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.introText}>
            아직 속닥 사전에 없는 신조어를 알고 계신가요?{'\n'}제안해주시면 검토 후 추가할게요!
          </Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>제안할 단어</Text>
            <TextInput
              style={styles.fieldInput}
              value={word}
              onChangeText={setWord}
              placeholder="예: 갓벽"
              placeholderTextColor={Colors.textTertiary}
              maxLength={30}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>카테고리</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c.slug}
                  style={[styles.categoryChip, categorySlug === c.slug && styles.categoryChipActive]}
                  onPress={() => setCategorySlug(c.slug)}
                >
                  <Text style={[styles.categoryChipText, categorySlug === c.slug && styles.categoryChipTextActive]}>
                    {c.emoji} {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>뜻/설명 (5자 이상)</Text>
            <TextInput
              style={styles.textArea}
              value={definition}
              onChangeText={setDefinition}
              placeholder="이 단어가 무슨 뜻인지 설명해주세요"
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>예문 (선택)</Text>
            <TextInput
              style={styles.textArea}
              value={example}
              onChangeText={setExample}
              placeholder="이 단어를 사용한 예문이 있다면 적어주세요"
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.submitBtn, isValid && { backgroundColor: Colors.navBar }]}
            onPress={handleSubmit}
            disabled={!isValid}
            activeOpacity={0.85}
          >
            <Text style={[styles.submitBtnText, isValid && { color: Colors.navBarIconActive }]}>제안하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  scroll: { padding: 24, paddingBottom: 100 },
  introText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 24 },

  field: { marginBottom: 20, gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  fieldInput: {
    height: 48, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingHorizontal: 14,
    fontSize: 15, color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 88, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Colors.textPrimary, lineHeight: 20,
  },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  categoryChipActive: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  categoryChipText: { fontSize: 12, color: Colors.textSecondary },
  categoryChipTextActive: { color: Colors.navBarIconActive, fontWeight: '600' },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: 16, paddingBottom: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
  submitBtn: {
    height: 52, borderRadius: 12, backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textTertiary },

  /* 입력 후 */
  doneWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 48 },
  doneEmoji: { fontSize: 52, marginBottom: 16 },
  doneTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  doneDesc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 28 },

  donePreviewCard: {
    width: '100%', padding: 16, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    gap: 8, marginBottom: 32,
  },
  donePreviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  donePreviewWord: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  donePreviewCategory: { fontSize: 12, color: Colors.textTertiary },
  donePreviewDefinition: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  doneCtaPrimary: {
    width: '100%', height: 52, borderRadius: 12, backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  doneCtaPrimaryText: { fontSize: 15, fontWeight: '700', color: Colors.navBarIconActive },
  doneCtaSecondary: { paddingVertical: 10 },
  doneCtaSecondaryText: { fontSize: 13, color: Colors.textTertiary, textDecorationLine: 'underline' },
});
