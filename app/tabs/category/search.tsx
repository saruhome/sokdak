import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Colors, getReadableTextColor } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { CATEGORIES, categoryMatchesSearch, getCategoryName } from '../../../constants/categories';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { JjaekiQuestion } from '@/components/icons/JjaekiQuestion';
import { AppIcon } from '@/components/AppIcon';
import { Search, Mic, Clock, ChevronRight, X } from 'lucide-react-native';
import { BackIcon } from '@/components/icons/SocialIcons';

const RECOMMENDED_SLUGS = ['consonant', 'kpop', 'exclamation'];

/** Figma: 798:7553 — 카테고리 검색 (최근 검색/추천 카테고리/검색 결과 없음) */
export default function CategorySearchScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  const recommended = useMemo(
    () => RECOMMENDED_SLUGS.map(slug => CATEGORIES.find(c => c.slug === slug)).filter(Boolean),
    [],
  );

  const handleChangeText = (text: string) => {
    setQuery(text);
    setSubmittedQuery(null);
  };

  const handleSubmit = (raw: string) => {
    const term = raw.trim();
    if (!term) return;
    setQuery(term);
    setSubmittedQuery(term);
    setRecent(prev => [term, ...prev.filter(t => t !== term)].slice(0, 8));
  };

  const removeRecent = (term: string) => {
    setRecent(prev => prev.filter(t => t !== term));
  };

  const results = useMemo(() => {
    const q = submittedQuery?.trim() ?? '';
    if (!q) return [];
    return CATEGORIES.filter(c => categoryMatchesSearch(c, q));
  }, [submittedQuery]);

  const showResults = submittedQuery !== null;
  const showNoResults = showResults && results.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopBar: 다크 헤더 + 검색 인풋 ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack('/tabs/category')}>
          <BackIcon size={24} color={Colors.navBarIconActive} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('categorySearchTitle')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.searchBarWrap}>
        <View style={styles.searchBar}>
          <AppIcon icon={Search} size={15} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('categorySearchPlaceholder')}
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={handleChangeText}
            onSubmitEditing={() => handleSubmit(query)}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <AppIcon
              icon={X}
              size={16}
              color={Colors.textSecondary}
              hitSlop={8}
              onPress={() => handleChangeText('')}
              accessibilityLabel={t('clearCategorySearch')}
            />
          )}
          <AppIcon icon={Mic} size={15} />
        </View>
      </View>

      {showResults ? (
        showNoResults ? (
          /* ── 검색 결과 없음 ── */
          <View style={styles.noResultsWrap}>
            <JjaekiQuestion size={96} />
            <Text style={styles.noResultsText}>
              {t('noCategoryResults').replace('{query}', submittedQuery ?? '')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/tabs/mypage/suggest')}>
              <Text style={styles.suggestLink}>{t('suggestToTeam')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── 검색 결과 리스트 ── */
          <ScrollView contentContainerStyle={styles.resultList}>
            {results.map(item => item && (
              <TouchableOpacity
                key={item.slug}
                style={styles.resultRow}
                onPress={() => router.push(`/tabs/category/${item.slug}`)}
                activeOpacity={0.75}
              >
                <View style={[styles.resultEmojiWrap, { backgroundColor: item.colorBg }]}>
                  <Text style={styles.resultEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.resultText}>
                  <Text style={styles.resultName}>{getCategoryName(item, language)}</Text>
                  <Text style={styles.resultDesc} numberOfLines={1}>{item.description}</Text>
                </View>
                <AppIcon icon={ChevronRight} size={18} color={Colors.border} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )
      ) : (
        /* ── 최근 검색 + 추천 카테고리 ── */
        <ScrollView contentContainerStyle={styles.stateScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('recentSearches')}</Text>
              {recent.length > 0 && (
                <TouchableOpacity onPress={() => setRecent([])}>
                  <Text style={styles.sectionAction}>{t('clearAll')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {recent.length === 0 ? (
              <View style={styles.noHistoryWrap}>
                <JjaekiQuestion size={72} />
                <Text style={styles.noHistoryText}>{t('noRecentSearches')}</Text>
                <Text style={styles.noHistorySub}>{t('trySearchingCategory')}</Text>
              </View>
            ) : (
              recent.map(term => (
                <View key={term} style={styles.recentRow}>
                  <TouchableOpacity
                    style={styles.recentRowLeft}
                    onPress={() => handleSubmit(term)}
                    activeOpacity={0.7}
                  >
                    <AppIcon icon={Clock} size={14} />
                    <Text style={styles.recentText}>{term}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeRecent(term)} hitSlop={8}>
                    <AppIcon icon={X} size={14} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('recommendedCategories')}</Text>
            <View style={styles.chipWrap}>
              {recommended.map(item => item && (
                <TouchableOpacity
                  key={item.slug}
                  style={[styles.chip, { backgroundColor: item.colorBg }]}
                  onPress={() => handleSubmit(getCategoryName(item, language))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, { color: getReadableTextColor(item.colorBg) }]} numberOfLines={1}>
                    {getCategoryName(item, language)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.navBar,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.navBarIconActive },

  searchBarWrap: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 44, borderRadius: 12, paddingHorizontal: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: 'NotoSerifKR_400Regular' },

  stateScroll: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginTop: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  sectionAction: { fontSize: 12, color: Colors.textTertiary },

  recentRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10,
  },
  recentRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recentText: { fontSize: 15, color: Colors.textPrimary },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  chipText: { fontSize: 14, fontWeight: '600' },

  noHistoryWrap: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  noHistoryText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  noHistorySub: { fontSize: 12, color: Colors.textTertiary },

  noResultsWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 40 },
  noResultsText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  suggestLink: { fontSize: 13, color: Colors.textTertiary, textDecorationLine: 'underline' },

  resultList: { padding: 20, gap: 4 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  resultEmojiWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  resultEmoji: { fontSize: 18 },
  resultText: { flex: 1, gap: 2 },
  resultName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  resultDesc: { fontSize: 12, color: Colors.textTertiary },
});
