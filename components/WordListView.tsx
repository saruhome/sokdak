import {
  StyleSheet, View, Image,
  TextInput, FlatList, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Colors, getReadableTextColor } from '@/constants/Colors';
import { MOCK_WORDS, type Word } from '@/constants/mockWords';
import { getCategoryBySlug, getCategoryName, pickLeastPopular } from '@/constants/categories';
import { languageStore, useLanguage } from '@/constants/languageStore';
import { authStore } from '@/constants/authStore';
import { AppIcon } from '@/components/AppIcon';
import {
  WordFilterBar, SORT_TABS, sortWords, matchesCategories, getInitialConsonant,
} from '@/components/WordFilterBar';
import { CalloutBubble, CALLOUT_BUBBLE_ASPECT } from '@/components/icons/CalloutBubble';
import { Search, Star, Volume2, Mic, Heart } from 'lucide-react-native';

const JJAEKI_ICON = require('../assets/characters/jjaeki-full.png');
/* 카테고리 추천 카드(Callout Card/Recommend_호랭)와 같은 말풍선 배경을 재사용 —
 * 카드 높이(108)에 맞춰 원본 비율로만 키우고 왼쪽에 붙여, 꼬리가 항상 짹이 쪽에 오도록 고정한다. */
const TIP_BUBBLE_HEIGHT = 108;
const TIP_BUBBLE_WIDTH = TIP_BUBBLE_HEIGHT * CALLOUT_BUBBLE_ASPECT;

/**
 * 사전 화면과 카테고리 상세 화면이 공유하는 단어 목록 뷰.
 * 두 화면 모두 "카테고리로 걸러진 단어 목록"이라 검색·정렬·카테고리 필터·행 UI가 동일하다.
 * 상단 앱바만 각 화면이 따로 그리고, 그 아래 전체를 이 컴포넌트가 담당한다.
 *
 * @param initialCategorySlugs 진입 시 미리 적용할 카테고리 필터 (카테고리 상세에서 사용)
 * @param showTipCard 추천 단어 배너 노출 여부
 * @param initialSortIndex 진입 시 미리 적용할 정렬 (홈 "새로운 신조어" 더보기 → 최신순 진입 등에 사용)
 */
export function WordListView({
  initialCategorySlugs = [],
  showTipCard = true,
  initialSortIndex = 0,
}: {
  initialCategorySlugs?: string[];
  showTipCard?: boolean;
  initialSortIndex?: number;
}) {
  const language = useLanguage();
  const t = languageStore.t;
  const [sortIndex, setSortIndex] = useState(initialSortIndex);
  const [query, setQuery] = useState('');
  const [consonant, setConsonant] = useState<string>('전체');
  const [categorySlugs, setCategorySlugs] = useState<string[]>(initialCategorySlugs);
  const [savedIds, setSavedIds] = useState<string[]>(authStore.getSavedWordIds());

  /* 카테고리 상세에서 다른 카테고리로 이동하면 필터를 새 slug로 리셋 */
  useEffect(() => { setCategorySlugs(initialCategorySlugs); }, [initialCategorySlugs.join(',')]);

  useFocusEffect(useCallback(() => { setSavedIds(authStore.getSavedWordIds()); }, []));
  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(() => setSavedIds(authStore.getSavedWordIds()));
    return () => { unsub(); };
  }, []);

  /* 추천 배너 단어 — 항상 인기 단어 대신, (필터가 걸려 있으면 그 안에서) 좋아요가 적어
   * 잘 안 찾아보는 단어부터 랜덤하게 고른다. 필터가 바뀔 때만 다시 뽑는다. */
  const tipWord = useMemo(() => {
    const pool = MOCK_WORDS.filter(w => matchesCategories(w, categorySlugs));
    return pool.length > 0 ? pickLeastPopular(pool, w => w.likes) : MOCK_WORDS[0];
  }, [categorySlugs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = MOCK_WORDS
      .filter(w => matchesCategories(w, categorySlugs))
      .filter(w => !q || w.word.includes(q) || w.shortDesc.includes(q) || w.category.toLowerCase().includes(q));
    return sortWords(base, sortIndex);
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
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
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
                <View style={styles.bubbleLayer} pointerEvents="none">
                  <CalloutBubble width={TIP_BUBBLE_WIDTH} height={TIP_BUBBLE_HEIGHT} />
                </View>
                <View style={styles.tipTextWrap}>
                  <Text style={styles.tipHint} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {t('tipHint').replace('\n', ' ')}
                  </Text>
                  <Text style={styles.tipWord} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    &quot;{tipWord.word}&quot;
                  </Text>
                  <Text style={styles.tipClick}>Click &gt;</Text>
                </View>
                <Image source={JJAEKI_ICON} style={styles.tipImg} resizeMode="contain" />
              </TouchableOpacity>
            )}

            <WordFilterBar
              total={filtered.length}
              sortIndex={sortIndex}
              onCycleSort={() => setSortIndex(p => (p + 1) % SORT_TABS.length)}
              categorySlugs={categorySlugs}
              onToggleCategory={toggleCategory}
              onClearCategories={() => setCategorySlugs([])}
              consonant={consonant}
              onSelectConsonant={setConsonant}
            />
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
                  <Text style={styles.wordReading} numberOfLines={1}>{item.romanization}</Text>
                  {category && (
                    <View style={[styles.wordBadge, { backgroundColor: category.colorBg }]}>
                      <Text style={[styles.wordBadgeText, { color: getReadableTextColor(category.colorBg) }]} numberOfLines={1} ellipsizeMode="tail">{getCategoryName(category, language)}</Text>
                    </View>
                  )}
                  {secondaryCategory && (
                    <View style={[styles.wordBadge, { backgroundColor: secondaryCategory.colorBg }]}>
                      <Text style={[styles.wordBadgeText, { color: getReadableTextColor(secondaryCategory.colorBg) }]} numberOfLines={1} ellipsizeMode="tail">{getCategoryName(secondaryCategory, language)}</Text>
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
            <Text style={styles.emptyText}>{t('noSearchResults')}</Text>
          </View>
        }
        contentContainerStyle={visible.length === 0 ? { flexGrow: 1 } : styles.listContent}
      />

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
  /* TextInput은 AppText를 안 거쳐 기본 서체가 시스템 산세리프라 카테고리 검색창과 달랐음 — 명시 지정 */
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: 'NotoSerifKR_400Regular' },

  tipCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 24, marginTop: 16, paddingLeft: 16,
    height: 108,
  },
  /* 카드 폭 전체로 늘리면 꼬리 비율이 밀려 짹이와 겹쳐서, 원본 비율 그대로 왼쪽에만 붙인다 */
  bubbleLayer: { position: 'absolute', left: 0, top: 0 },
  /* minWidth:0 없으면 Text 내용 너비가 최소 크기로 잡혀 flexShrink가 안 먹고 오른쪽 캐릭터와 겹친다 */
  tipTextWrap: { flexShrink: 1, minWidth: 0, gap: 4 },
  tipHint: { fontSize: 14, color: Colors.textEmphasis, fontFamily: undefined },
  tipWord: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textEmphasis },
  tipClick: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  tipImg: { width: 93, height: 107, marginRight: 8 },




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
  /* 태그가 항상 단어 옆 한 줄에 붙어 있도록 줄바꿈을 막고, 대신 로마자 표기가
   * 공간이 부족할 때 먼저 줄어들게(shrink+ellipsis) 해서 카드가 항상 2줄로 고정된다 */
  wordTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordText: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBar, flexShrink: 0 },
  wordReading: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined, flexShrink: 1, minWidth: 0 },
  wordBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, flexShrink: 0 },
  wordBadgeText: { fontSize: 10, fontWeight: '600' },
  wordDesc: { flexShrink: 1, fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  wordItemRight: { alignItems: 'center', gap: 4 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: Colors.textTertiary },

  /* 카테고리 선택 모달 */
});
