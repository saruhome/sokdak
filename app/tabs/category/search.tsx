import {
  StyleSheet, View, SafeAreaView,
  TextInput, ScrollView, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Colors, getReadableTextColor } from '../../../constants/Colors';
import { CATEGORIES } from '../../../constants/categories';
import { JjaekiQuestion } from '@/components/icons/JjaekiQuestion';
import { AppIcon } from '@/components/AppIcon';
import { Search, Mic, Clock } from 'lucide-react-native';

const RECOMMENDED_SLUGS = ['consonant', 'kpop', 'exclamation'];

/** Figma: 798:7553 — 카테고리 검색 (최근 검색/추천 카테고리/검색 결과 없음) */
export default function CategorySearchScreen() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(['K-POP', '드라마/영화', '자주 쓰는 신조어']);

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
    const q = submittedQuery?.trim().toLowerCase() ?? '';
    if (!q) return [];
    return CATEGORIES.filter(c => c.name.toLowerCase().includes(q) || c.description.includes(q));
  }, [submittedQuery]);

  const showResults = submittedQuery !== null;
  const showNoResults = showResults && results.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopBar: 다크 헤더 + 검색 인풋 ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>카테고리 검색</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.searchBarWrap}>
        <View style={styles.searchBar}>
          <AppIcon icon={Search} size={15} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={handleChangeText}
            onSubmitEditing={() => handleSubmit(query)}
            returnKeyType="search"
            autoFocus
            clearButtonMode="while-editing"
          />
          <AppIcon icon={Mic} size={15} />
        </View>
      </View>

      {showResults ? (
        showNoResults ? (
          /* ── 검색 결과 없음 ── */
          <View style={styles.noResultsWrap}>
            <JjaekiQuestion size={96} />
            <Text style={styles.noResultsText}>
              '{submittedQuery}'에 대한 검색 결과가 없습니다.{'\n'}단어를 다시 한번 확인해 주세요.
            </Text>
            <TouchableOpacity onPress={() => router.push('/tabs/mypage/suggest')}>
              <Text style={styles.suggestLink}>운영진에게 제안하기 ›</Text>
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
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultDesc} numberOfLines={1}>{item.description}</Text>
                </View>
                <Text style={styles.resultArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )
      ) : (
        /* ── 최근 검색 + 추천 카테고리 ── */
        <ScrollView contentContainerStyle={styles.stateScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>최근 검색</Text>
              {recent.length > 0 && (
                <TouchableOpacity onPress={() => setRecent([])}>
                  <Text style={styles.sectionAction}>모두 지우기</Text>
                </TouchableOpacity>
              )}
            </View>

            {recent.length === 0 ? (
              <View style={styles.noHistoryWrap}>
                <JjaekiQuestion size={72} />
                <Text style={styles.noHistoryText}>최근 검색어 내역이 없습니다.</Text>
                <Text style={styles.noHistorySub}>궁금한 카테고리를 검색해 보세요</Text>
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
                    <Text style={styles.recentRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>추천 카테고리</Text>
            <View style={styles.chipWrap}>
              {recommended.map(item => item && (
                <TouchableOpacity
                  key={item.slug}
                  style={[styles.chip, { backgroundColor: item.colorBg }]}
                  onPress={() => handleSubmit(item.name)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, { color: getReadableTextColor(item.colorBg) }]}>
                    {item.name}
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
  backIcon: { fontSize: 28, color: Colors.navBarIconActive, lineHeight: 34 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.navBarIconActive },

  searchBarWrap: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 44, borderRadius: 12, paddingHorizontal: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },

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
  recentRemove: { fontSize: 14, color: Colors.textTertiary, padding: 4 },

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
  resultArrow: { fontSize: 18, color: Colors.border },
});
