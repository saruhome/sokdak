import {
  StyleSheet, View, SafeAreaView,
  TextInput, FlatList, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState, useMemo, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Colors } from '../../../constants/Colors';
import { MOCK_WORDS, type Word } from '../../../constants/mockWords';
import { getCategoryBySlug } from '../../../constants/categories';
import { authStore } from '../../../constants/authStore';

const SORT_TABS = ['인기순', '최신순', 'ㄱㄴㄷ순'] as const;
const TIP_WORD = MOCK_WORDS.find(w => w.word === '무야호') ?? MOCK_WORDS[0];

/** Word.pronunciation("[핵-인-싸]")에서 대괄호만 벗겨 로마자 대신 표시 (실제 로마자 표기 데이터는 없음) */
function readingOf(word: Word) {
  return word.pronunciation ? word.pronunciation.replace(/^\[|\]$/g, '') : null;
}

export default function DictionaryScreen() {
  const [sortIndex, setSortIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(authStore.getSavedWordIds());

  useFocusEffect(useCallback(() => { setSavedIds(authStore.getSavedWordIds()); }, []));
  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(() => setSavedIds(authStore.getSavedWordIds()));
    return () => { unsub(); };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? MOCK_WORDS.filter(w =>
          w.word.includes(q) || w.shortDesc.includes(q) || w.category.toLowerCase().includes(q))
      : [...MOCK_WORDS];
    if (sortIndex === 0) return base.sort((a, b) => b.likes - a.likes);
    if (sortIndex === 1) return base.sort((a, b) => Number(b.id) - Number(a.id));
    return base.sort((a, b) => a.word.localeCompare(b.word, 'ko'));
  }, [sortIndex, query]);

  const toggleSave = (id: string) => {
    authStore.toggleWordSaved(id);
    setSavedIds(authStore.getSavedWordIds());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── Figma: Navigation/TopAppBar/Default/Default (bg #52514e) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>사전</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* ── 검색바 ── Figma: Bars */}
            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="단어를 검색하세요"
                placeholderTextColor={Colors.textTertiary}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              <Text style={styles.voiceIcon}>🎤</Text>
            </View>

            {/* ── 추천 팁 카드 ── Figma: Callout Card/Recommend_짹이 (단순화: 마스코트 일러스트 대신 이모지) */}
            <TouchableOpacity
              style={styles.tipCard}
              onPress={() => router.push(`/tabs/dictionary/${TIP_WORD.id}`)}
              activeOpacity={0.85}
            >
              <Text style={styles.tipMascot}>🐐</Text>
              <View style={styles.tipTextWrap}>
                <Text style={styles.tipHint}>이 표현 알아? 유행 따라가야지</Text>
                <View style={styles.tipWordRow}>
                  <Text style={styles.tipWord}>&quot;{TIP_WORD.word}&quot;</Text>
                  <Text style={styles.tipClick}>Click ›</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* ── 총 단어 수 + 정렬/카테고리 트리거 ── Figma: Filter/Combined/Bar */}
            <View style={styles.filterBar}>
              <Text style={styles.totalCount}>
                총 <Text style={styles.totalCountNumber}>{filtered.length}</Text> 단어
              </Text>
              <View style={styles.filterTriggers}>
                <TouchableOpacity
                  style={styles.sortTrigger}
                  onPress={() => setSortIndex(p => (p + 1) % SORT_TABS.length)}
                >
                  <Text style={styles.sortTriggerText}>{SORT_TABS[sortIndex]}</Text>
                  <Text style={styles.sortTriggerChevron}>⌄</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryTrigger}
                  onPress={() => router.push('/tabs/category')}
                >
                  <Text style={styles.categoryTriggerText}>카테고리</Text>
                  <Text style={styles.categoryTriggerIcon}>≡</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          const category = getCategoryBySlug(item.category);
          const reading = readingOf(item);
          const saved = savedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.wordItem,
                index === 0 && styles.wordItemFirst,
                index === filtered.length - 1 && styles.wordItemLast,
              ]}
              onPress={() => router.push(`/tabs/dictionary/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.wordItemLeft}>
                <View style={styles.wordTopRow}>
                  <Text style={styles.wordText}>{item.word}</Text>
                  {reading && <Text style={styles.wordReading}>{reading}</Text>}
                  {category && <Text style={[styles.wordCategory, { color: category.colorFg }]}>{category.name}</Text>}
                </View>
                <Text style={styles.wordDesc} numberOfLines={1}>{item.shortDesc}</Text>
              </View>
              <View style={styles.wordItemRight}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => toggleSave(item.id)} hitSlop={6}>
                  <Text style={styles.iconGlyph}>{saved ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
                <View style={styles.iconBtn}>
                  <Text style={styles.iconGlyph}>🔊</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>검색 결과가 없어요</Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.navBar,
  },
  topBarTitle: { fontSize: 18, fontWeight: '600', color: Colors.navBarIconActive },

  listContent: { paddingBottom: 24 },

  /* 검색바 */
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 24, marginTop: 16,
    height: 36, backgroundColor: Colors.pageBackground,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: undefined },
  voiceIcon: { fontSize: 14 },

  /* 추천 팁 카드 */
  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 24, marginTop: 16, padding: 16,
    minHeight: 90,
    backgroundColor: Colors.pageBackground,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
  },
  tipMascot: { fontSize: 40 },
  tipTextWrap: { flex: 1, gap: 8 },
  tipHint: { fontSize: 14, color: Colors.textEmphasis, fontFamily: undefined },
  tipWordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipWord: { fontSize: 18, fontWeight: '600', color: Colors.textEmphasis },
  tipClick: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },

  /* 총 단어 + 정렬/카테고리 */
  filterBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 24, marginTop: 24, marginBottom: 12,
  },
  totalCount: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  totalCountNumber: { fontSize: 12, color: Colors.textPrimary, fontWeight: '700', fontFamily: undefined },
  filterTriggers: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortTrigger: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sortTriggerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  sortTriggerChevron: { fontSize: 12, color: Colors.textSecondary },
  categoryTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.divider, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6,
  },
  categoryTriggerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  categoryTriggerIcon: { fontSize: 12, color: Colors.textSecondary },

  /* 단어 리스트 */
  wordItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 80,
    paddingHorizontal: 16, marginHorizontal: 24,
    backgroundColor: Colors.pageBackground,
    borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderColor: Colors.border,
  },
  wordItemFirst: { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  wordItemLast: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderBottomWidth: 1 },
  wordItemLeft: { flex: 1, gap: 8 },
  wordTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  wordText: { fontSize: 16, fontWeight: '600', color: Colors.navBar },
  wordReading: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  wordCategory: { fontSize: 10, fontWeight: '600' },
  wordDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  wordItemRight: { alignItems: 'center', gap: 4 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontSize: 16 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: Colors.textTertiary },
});
