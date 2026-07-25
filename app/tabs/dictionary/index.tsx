import {
  StyleSheet, View, SafeAreaView, Image,
  TextInput, FlatList, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState, useMemo, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Colors } from '../../../constants/Colors';
import { MOCK_WORDS, type Word } from '../../../constants/mockWords';
import { AppIcon } from '@/components/AppIcon';
import { Search, Star, Volume2, Mic, Bell, ChevronDown, List } from 'lucide-react-native';
import { getCategoryBySlug } from '../../../constants/categories';
import { authStore } from '../../../constants/authStore';

const JJAEKI_ICON = require('../../../assets/characters/jjaeki-full.png');

const SORT_TABS = ['인기순', '최신순', 'ㄱㄴㄷ순'] as const;
const TIP_WORD = MOCK_WORDS.find(w => w.word === '무야호') ?? MOCK_WORDS[0];

/** 기본(단자음) 초성 14개 — 겹자음(ㄲㄸㅃㅆㅉ)은 필터 UI에 없어 아래 매핑으로 기본 자음에 합친다 */
const CONSONANT_FILTERS = ['전체', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const;
const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const DOUBLED_TO_BASE: Record<string, string> = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };

/** 완성형 한글 음절이면 초성을, 낱자음(ㅋㅋ 같은 초성체 단어)이면 첫 글자 자체를 기본 자음으로 정규화해 반환 */
function getInitialConsonant(word: string): string | null {
  if (!word) return null;
  const code = word.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const cho = CHOSEONG[Math.floor((code - 0xAC00) / (21 * 28))];
    return DOUBLED_TO_BASE[cho] ?? cho;
  }
  const ch = word[0];
  return DOUBLED_TO_BASE[ch] ?? ch;
}

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
    if (!authStore.isLoggedIn()) {
      Alert.alert('로그인이 필요해요', '단어를 저장하려면 먼저 로그인해주세요.', [
        { text: '취소', style: 'cancel' },
        { text: '로그인하러 가기', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    authStore.toggleWordSaved(id);
    setSavedIds(authStore.getSavedWordIds());
  };

  const showConsonantRow = sortIndex === 2;
  const [consonant, setConsonant] = useState<string>('전체');

  const visible = useMemo(() => {
    if (!showConsonantRow || consonant === '전체') return filtered;
    return filtered.filter(w => getInitialConsonant(w.word) === consonant);
  }, [filtered, showConsonantRow, consonant]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── Figma: Navigation/TopAppBar/Default/Default (bg #52514e) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>사전</Text>
        <View style={styles.topBarBell}>
          <AppIcon icon={Bell} size={22} color={Colors.navBarIconActive} onPress={() => router.push('/notifications')} />
          <View style={styles.notifDot} />
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* ── 검색바 ── Figma: Bars */}
            <View style={styles.searchWrap}>
              <AppIcon icon={Search} size={15} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor={Colors.textTertiary}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              <AppIcon icon={Mic} size={15} />
            </View>

            {/* ── 추천 팁 카드 ── Figma: Callout Card/Recommend_짹이 */}
            <TouchableOpacity
              style={styles.tipCard}
              onPress={() => router.push(`/tabs/dictionary/${TIP_WORD.id}`)}
              activeOpacity={0.85}
            >
              <View style={styles.tipTextWrap}>
                <Text style={styles.tipHint}>이 표현 알아? 유행 따라가야지</Text>
                <Text style={styles.tipWord}>&quot;{TIP_WORD.word}&quot;</Text>
                <Text style={styles.tipClick}>Click &gt;</Text>
              </View>
              <Image source={JJAEKI_ICON} style={styles.tipImg} resizeMode="contain" />
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
                  <AppIcon icon={ChevronDown} size={14} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryTrigger}
                  onPress={() => router.push('/tabs/category')}
                >
                  <Text style={styles.categoryTriggerText}>카테고리</Text>
                  <AppIcon icon={List} size={12} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── ㄱㄴㄷ순 초성 필터 – ㄱㄴㄷ순 정렬일 때만 노출 ── */}
            {showConsonantRow && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.consonantRow}
              >
                {CONSONANT_FILTERS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.consonantChip, consonant === c && styles.consonantChipActive]}
                    onPress={() => setConsonant(c)}
                  >
                    <Text style={[styles.consonantChipText, consonant === c && styles.consonantChipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        }
        renderItem={({ item, index }) => {
          const category = getCategoryBySlug(item.category);
          const secondaryCategory = item.secondaryCategory ? getCategoryBySlug(item.secondaryCategory) : undefined;
          const reading = readingOf(item);
          const saved = savedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.wordItem,
                index === 0 && styles.wordItemFirst,
                index === visible.length - 1 && styles.wordItemLast,
              ]}
              onPress={() => router.push(`/tabs/dictionary/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.wordItemLeft}>
                <View style={styles.wordTopRow}>
                  <Text style={styles.wordText}>{item.word}</Text>
                  {reading && <Text style={styles.wordReading}>{reading}</Text>}
                  {category && (
                    <View style={[styles.wordBadge, { backgroundColor: category.colorBg }]}>
                      <Text style={[styles.wordBadgeText, { color: category.colorFg }]}>{category.name}</Text>
                    </View>
                  )}
                  {secondaryCategory && (
                    <View style={[styles.wordBadge, { backgroundColor: secondaryCategory.colorBg }]}>
                      <Text style={[styles.wordBadgeText, { color: secondaryCategory.colorFg }]}>{secondaryCategory.name}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.wordDesc} numberOfLines={1}>{item.shortDesc}</Text>
              </View>
              <View style={styles.wordItemRight}>
                <AppIcon
                  icon={Star}
                  size={20}
                  fill={saved ? '#FACC15' : undefined}
                  color={saved ? '#FACC15' : undefined}
                  style={styles.iconBtn}
                  hitSlop={6}
                  onPress={() => toggleSave(item.id)}
                />
                <AppIcon icon={Volume2} size={20} style={styles.iconBtn} onPress={() => {}} />
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
    height: 44,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar,
  },
  topBarTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  topBarBell: { position: 'absolute', right: 6, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  /* Figma: data-badge="on" — 벨 아이콘 우측 상단 알림 점 */
  notifDot: {
    position: 'absolute', top: 10, right: 12,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.error,
  },

  listContent: { paddingBottom: 24 },

  /* 검색바 */
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 24, marginTop: 16,
    height: 36, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: undefined },

  /* 추천 팁 카드 — Figma: Callout Card/Recommend_짹이 (실제 마스코트 이미지 재사용) */
  tipCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 24, marginTop: 16, paddingLeft: 16,
    height: 108,
    backgroundColor: Colors.pageBackground,
    borderRadius: 10, overflow: 'hidden',
  },
  tipTextWrap: { flexShrink: 1, gap: 4 },
  tipHint: { fontSize: 14, color: Colors.textEmphasis, fontFamily: undefined },
  tipWord: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textEmphasis },
  tipClick: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  tipImg: { width: 93, height: 107, marginRight: 8 },

  /* 총 단어 + 정렬/카테고리 */
  filterBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 24, marginTop: 24, marginBottom: 12,
  },
  totalCount: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  totalCountNumber: { fontSize: 12, color: Colors.textPrimary, fontWeight: '700', fontFamily: undefined },
  filterTriggers: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortTrigger: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sortTriggerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  categoryTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.divider, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6,
  },
  categoryTriggerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },

  /* ㄱㄴㄷ순 초성 필터 */
  consonantRow: { gap: 8, paddingHorizontal: 24, paddingBottom: 12 },
  consonantChip: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  consonantChipActive: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  consonantChipText: { fontSize: 13, color: Colors.textSecondary, fontFamily: undefined },
  consonantChipTextActive: { color: Colors.navBarIconActive, fontWeight: '700' },

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
  wordText: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBar },
  wordReading: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  wordBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  wordBadgeText: { fontSize: 10, fontWeight: '600' },
  wordDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  wordItemRight: { alignItems: 'center', gap: 4 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: Colors.textTertiary },
});
