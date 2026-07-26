import {
  StyleSheet, View, Image, Modal,
  TextInput, FlatList, ScrollView, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { MOCK_WORDS, type Word } from '@/constants/mockWords';
import { CATEGORIES, getCategoryBySlug } from '@/constants/categories';
import { authStore } from '@/constants/authStore';
import { AppIcon } from '@/components/AppIcon';
import { Search, Star, Volume2, Mic, ChevronDown, List, X, Check, Heart } from 'lucide-react-native';

const JJAEKI_ICON = require('../assets/characters/jjaeki-full.png');

const SORT_TABS = ['인기순', '최신순', 'ㄱㄴㄷ순'] as const;

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

/** 단어가 선택된 카테고리들 중 하나라도 속하는지 (주/보조 카테고리 모두 검사) */
function matchesCategories(word: Word, slugs: string[]) {
  if (slugs.length === 0) return true;
  return slugs.includes(word.category) || (!!word.secondaryCategory && slugs.includes(word.secondaryCategory));
}

/**
 * 사전 화면과 카테고리 상세 화면이 공유하는 단어 목록 뷰.
 * 두 화면 모두 "카테고리로 걸러진 단어 목록"이라 검색·정렬·카테고리 필터·행 UI가 동일하다.
 * 상단 앱바만 각 화면이 따로 그리고, 그 아래 전체를 이 컴포넌트가 담당한다.
 *
 * @param initialCategorySlugs 진입 시 미리 적용할 카테고리 필터 (카테고리 상세에서 사용)
 * @param showTipCard 추천 단어 배너 노출 여부
 */
export function WordListView({
  initialCategorySlugs = [],
  showTipCard = true,
}: {
  initialCategorySlugs?: string[];
  showTipCard?: boolean;
}) {
  const [sortIndex, setSortIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [consonant, setConsonant] = useState<string>('전체');
  const [categorySlugs, setCategorySlugs] = useState<string[]>(initialCategorySlugs);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(authStore.getSavedWordIds());

  /* 카테고리 상세에서 다른 카테고리로 이동하면 필터를 새 slug로 리셋 */
  useEffect(() => { setCategorySlugs(initialCategorySlugs); }, [initialCategorySlugs.join(',')]);

  useFocusEffect(useCallback(() => { setSavedIds(authStore.getSavedWordIds()); }, []));
  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(() => setSavedIds(authStore.getSavedWordIds()));
    return () => { unsub(); };
  }, []);

  /** 추천 배너 단어 — 필터가 걸려 있으면 그 안에서, 없으면 무야호 */
  const tipWord = useMemo(() => {
    const pool = MOCK_WORDS.filter(w => matchesCategories(w, categorySlugs));
    return pool.find(w => w.word === '무야호') ?? pool[0] ?? MOCK_WORDS[0];
  }, [categorySlugs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = MOCK_WORDS
      .filter(w => matchesCategories(w, categorySlugs))
      .filter(w => !q || w.word.includes(q) || w.shortDesc.includes(q) || w.category.toLowerCase().includes(q));
    if (sortIndex === 0) return base.sort((a, b) => b.likes - a.likes);
    if (sortIndex === 1) return base.sort((a, b) => Number(b.id) - Number(a.id));
    return base.sort((a, b) => a.word.localeCompare(b.word, 'ko'));
  }, [sortIndex, query, categorySlugs]);

  const showConsonantRow = sortIndex === 2;
  const visible = useMemo(() => {
    if (!showConsonantRow || consonant === '전체') return filtered;
    return filtered.filter(w => getInitialConsonant(w.word) === consonant);
  }, [filtered, showConsonantRow, consonant]);

  /* 비로그인도 즐겨찾기 가능 — 세션 동안 유지되고 로그인 시 계정으로 이관된다(authStore) */
  const toggleSave = (id: string) => {
    authStore.toggleWordSaved(id);
    setSavedIds(authStore.getSavedWordIds());
  };

  const toggleCategory = (slug: string) => {
    setCategorySlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  return (
    <>
      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* ── 검색바 ── */}
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

            {/* ── 추천 단어 배너 – Figma: Callout Card/Recommend_짹이 ── */}
            {showTipCard && (
              <TouchableOpacity
                style={styles.tipCard}
                onPress={() => router.push(`/tabs/dictionary/${tipWord.id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.tipTextWrap}>
                  <Text style={styles.tipHint}>이 표현 알아? 유행 따라가야지</Text>
                  <Text style={styles.tipWord}>&quot;{tipWord.word}&quot;</Text>
                  <Text style={styles.tipClick}>Click &gt;</Text>
                </View>
                <Image source={JJAEKI_ICON} style={styles.tipImg} resizeMode="contain" />
              </TouchableOpacity>
            )}

            {/* ── 총 단어 수 + 정렬/카테고리 트리거 ── */}
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
                <TouchableOpacity style={styles.categoryTrigger} onPress={() => setPickerOpen(true)}>
                  <Text style={styles.categoryTriggerText}>카테고리</Text>
                  <AppIcon icon={List} size={12} color={Colors.textSecondary} />
                  {/* Figma: 필터가 걸려 있으면 버튼에 활성 점 표시 */}
                  {categorySlugs.length > 0 && <View style={styles.filterDot} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* ── 적용된 카테고리 칩 (× 로 개별 해제) ── */}
            {categorySlugs.length > 0 && (
              <View style={styles.chipRow}>
                {categorySlugs.map(slug => {
                  const c = getCategoryBySlug(slug);
                  if (!c) return null;
                  return (
                    <TouchableOpacity key={slug} style={styles.chip} onPress={() => toggleCategory(slug)}>
                      <Text style={styles.chipText}>{c.name}</Text>
                      <AppIcon icon={X} size={12} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* ── ㄱㄴㄷ순 초성 필터 ── */}
            {showConsonantRow && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.consonantRow}>
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
              {/* 인기순일 때만 순위 번호 — 상위 3개는 강조 */}
              {sortIndex === 0 && (
                <Text style={[styles.rank, index < 3 && styles.rankTop]}>{index + 1}</Text>
              )}

              <View style={styles.wordItemLeft}>
                <View style={styles.wordTopRow}>
                  <Text style={styles.wordText}>{item.word}</Text>
                  <Text style={styles.wordReading}>{item.romanization}</Text>
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
                <View style={styles.wordBottomRow}>
                  <Text style={styles.wordDesc} numberOfLines={1}>{item.shortDesc}</Text>
                  <View style={styles.likeRow}>
                    <AppIcon icon={Heart} size={11} color={Colors.textTertiary} />
                    <Text style={styles.likeCount}>{item.likes}</Text>
                  </View>
                </View>
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
        contentContainerStyle={visible.length === 0 ? { flexGrow: 1 } : styles.listContent}
      />

      {/* ── 카테고리 선택 모달 ── */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>카테고리</Text>
              <AppIcon icon={X} size={20} onPress={() => setPickerOpen(false)} hitSlop={8} />
            </View>
            <ScrollView style={styles.modalList}>
              {CATEGORIES.map(c => {
                const on = categorySlugs.includes(c.slug);
                return (
                  <TouchableOpacity key={c.slug} style={styles.modalRow} onPress={() => toggleCategory(c.slug)}>
                    <View style={[styles.modalSwatch, { backgroundColor: c.colorBg }]}>
                      <Text style={styles.modalEmoji}>{c.emoji}</Text>
                    </View>
                    <Text style={styles.modalRowText}>{c.name}</Text>
                    {on && <AppIcon icon={Check} size={18} color={Colors.textPrimary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalReset} onPress={() => setCategorySlugs([])}>
                <Text style={styles.modalResetText}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApply} onPress={() => setPickerOpen(false)}>
                <Text style={styles.modalApplyText}>적용</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 24 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 24, marginTop: 16,
    height: 36, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: undefined },

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
  filterDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.point1 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginHorizontal: 24, marginBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipText: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },

  consonantRow: { gap: 8, paddingHorizontal: 24, paddingBottom: 12 },
  consonantChip: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  consonantChipActive: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  consonantChipText: { fontSize: 13, color: Colors.textSecondary, fontFamily: undefined },
  consonantChipTextActive: { color: Colors.navBarIconActive, fontWeight: '700' },

  wordItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 80,
    paddingHorizontal: 16, marginHorizontal: 24, gap: 10,
    backgroundColor: Colors.pageBackground,
    borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderColor: Colors.border,
  },
  wordItemFirst: { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  wordItemLast: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderBottomWidth: 1 },
  rank: { width: 18, textAlign: 'center', fontSize: 14, fontWeight: '600', color: Colors.textTertiary },
  rankTop: { color: Colors.point1, fontWeight: '800' },
  wordItemLeft: { flex: 1, gap: 8 },
  wordBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' },
  likeCount: { fontSize: 11, color: Colors.textTertiary, fontFamily: undefined },
  wordTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  wordText: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBar },
  wordReading: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  wordBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  wordBadgeText: { fontSize: 10, fontWeight: '600' },
  wordDesc: { flexShrink: 1, fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  wordItemRight: { alignItems: 'center', gap: 4 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: Colors.textTertiary },

  /* 카테고리 선택 모달 */
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    paddingTop: 16, maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 12,
  },
  modalTitle: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  modalList: { paddingHorizontal: 24 },
  modalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  modalSwatch: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modalEmoji: { fontSize: 16 },
  modalRowText: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: undefined },
  modalFooter: { flexDirection: 'row', gap: 8, padding: 24 },
  modalReset: {
    flex: 1, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  modalResetText: { fontSize: 14, color: Colors.textSecondary, fontFamily: undefined },
  modalApply: {
    flex: 2, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar,
  },
  modalApplyText: { fontSize: 14, fontWeight: '600', color: Colors.navBarIconActive, fontFamily: undefined },
});
