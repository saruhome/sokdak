import { StyleSheet, View, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors, getReadableTextColor } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { CATEGORIES, getCategoryName } from '../../../constants/categories';
import { authStore } from '../../../constants/authStore';
import { submitWordSuggestion } from '../../../constants/suggestions';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { BackIcon } from '@/components/icons/SocialIcons';

const HORANG_CHEER = require('../../../assets/characters/transparent/horang-cheer.png');

/** Figma: 229:3332(입력 전) / 229:3342(입력 후) — 신조어 제안 폼
 * word_suggestions 테이블에 실제로 저장됨 — 운영팀은 Supabase 대시보드에서 검토 */
export default function SuggestScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [word, setWord] = useState('');
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* 단어만 필수 — 카테고리·뜻은 몰라도 제안 가능(운영 결정) */
  const isValid = word.trim().length >= 1;

  const handleSubmit = async () => {
    if (!isValid) return;
    if (!authStore.isLoggedIn()) {
      Alert.alert(t('loginRequiredTitle'), t('loginRequiredSuggest'), [
        { text: t('cancelLabel'), style: 'cancel' },
        { text: t('goToLogin'), onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    setSubmitting(true);
    const { error } = await submitWordSuggestion({
      word: word.trim(),
      categorySlug,
      definition: definition.trim(),
      example: example.trim(),
    });
    setSubmitting(false);
    if (error) { Alert.alert(t('suggestFailedTitle'), error); return; }
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
          <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack('/tabs/mypage')}>
            <BackIcon size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{t('suggestTitle')}</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.doneWrap}>
          <Image
            source={HORANG_CHEER}
            style={styles.doneCharacter}
            resizeMode="contain"
            accessible={false}
          />
          <Text style={styles.doneTitle}>{t('suggestDoneTitle')}</Text>
          <Text style={styles.doneDesc}>
            {t('suggestDoneDescPrefix')}{word}{t('suggestDoneDescSuffix')}
          </Text>

          <View style={styles.donePreviewCard}>
            <View style={styles.donePreviewTop}>
              <Text style={styles.donePreviewWord}>{word}</Text>
              {categorySlug && (() => {
                const selected = CATEGORIES.find(c => c.slug === categorySlug);
                return selected ? (
                  <Text style={styles.donePreviewCategory}>
                    {selected.emoji} {getCategoryName(selected, language)}
                  </Text>
                ) : null;
              })()}
            </View>
            {!!definition.trim() && <Text style={styles.donePreviewDefinition}>{definition}</Text>}
          </View>

          <TouchableOpacity style={styles.doneCtaPrimary} onPress={handleReset} activeOpacity={0.85}>
            <Text style={styles.doneCtaPrimaryText}>{t('suggestAnother')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneCtaSecondary} onPress={() => safeGoBack('/tabs/mypage')}>
            <Text style={styles.doneCtaSecondaryText}>{t('suggestBackToMypage')}</Text>
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
          <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack('/tabs/mypage')}>
            <BackIcon size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{t('suggestTitle')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.introText}>{t('suggestIntro')}</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('suggestWordLabel')}</Text>
            <TextInput
              style={styles.fieldInput}
              value={word}
              onChangeText={setWord}
              placeholder={t('suggestWordPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              maxLength={30}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('suggestCategoryLabel')}</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(c => {
                const selected = categorySlug === c.slug;
                return (
                  <TouchableOpacity
                    key={c.slug}
                    style={[
                      styles.categoryChip,
                      selected && { backgroundColor: c.colorBg, borderColor: c.colorBg },
                    ]}
                    /* 선택 항목이라 같은 칩을 다시 누르면 해제 */
                    onPress={() => setCategorySlug(prev => prev === c.slug ? null : c.slug)}
                    activeOpacity={0.8}
                  >
                    {/* 운영자 규칙: 칩 라벨은 아이콘 없이 무조건 한 줄 */}
                    <Text
                      style={[
                        styles.categoryChipText,
                        selected && { color: getReadableTextColor(c.colorBg) },
                      ]}
                      numberOfLines={1}
                    >
                      {getCategoryName(c, language)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('suggestDefinitionLabel')}</Text>
            <TextInput
              style={styles.textArea}
              value={definition}
              onChangeText={setDefinition}
              placeholder={t('suggestDefinitionPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('suggestExampleLabel')}</Text>
            <TextInput
              style={styles.textArea}
              value={example}
              onChangeText={setExample}
              placeholder={t('suggestExamplePlaceholder')}
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
            disabled={!isValid || submitting}
            activeOpacity={0.85}
          >
            <Text style={[styles.submitBtnText, isValid && { color: Colors.navBarIconActive }]}>
              {submitting ? t('suggestSubmitting') : t('suggestSubmitBtn')}
            </Text>
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
  topBarTitle: { fontSize: 17, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },

  scroll: { padding: 24, paddingBottom: 100 },
  introText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 24 },

  field: { marginBottom: 20, gap: 8 },
  fieldLabel: { fontSize: 13, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textSecondary },
  fieldInput: { fontFamily: 'NotoSerifKR_400Regular',
    height: 48, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingHorizontal: 14,
    fontSize: 15, color: Colors.textPrimary,
  },
  textArea: { fontFamily: 'NotoSerifKR_400Regular',
    minHeight: 88, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Colors.textPrimary, lineHeight: 20,
  },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryChipText: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textSecondary },

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
  submitBtnText: { fontSize: 15, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textTertiary },

  /* 입력 후 */
  doneWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 48 },
  doneCharacter: { width: 132, height: 132, marginBottom: 12 },
  doneTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  doneDesc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 28 },

  donePreviewCard: {
    width: '100%', padding: 16, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    gap: 8, marginBottom: 32,
  },
  donePreviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  donePreviewWord: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  donePreviewCategory: { fontSize: 12, color: Colors.textTertiary },
  donePreviewDefinition: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  doneCtaPrimary: {
    width: '100%', height: 52, borderRadius: 12, backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  doneCtaPrimaryText: { fontSize: 15, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  doneCtaSecondary: { paddingVertical: 10 },
  doneCtaSecondaryText: { fontSize: 13, color: Colors.textTertiary, textDecorationLine: 'underline' },
});
