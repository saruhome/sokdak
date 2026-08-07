import {
  StyleSheet, View, Image,
  TextInput, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Colors, getReadableTextColor } from '@/constants/Colors';
import { fetchWords, type Word } from '@/constants/words';
import { getCategoryBySlug, getCategoryName, pickLeastPopular } from '@/constants/categories';
import { languageStore, useLanguage, type Language } from '@/constants/languageStore';
import { authStore } from '@/constants/authStore';
import { speakWord } from '@/constants/speech';
import { AppIcon } from '@/components/AppIcon';
import { Alert } from '@/constants/alert';
import {
  WordFilterBar, SORT_TABS, sortWords, matchesCategories, getInitialConsonant,
} from '@/components/WordFilterBar';
import { Search, Star, Volume2, Mic, Heart } from 'lucide-react-native';
import { SCREEN_WIDTH } from '@/constants/layout';

const JJAEKI_ICON = require('../assets/characters/jjaeki-full.png');
const TIP_CARD_LEFT = 24; // searchWrap과 동일한 marginHorizontal
const TIP_BUBBLE_MAX_WIDTH = SCREEN_WIDTH / 2 - TIP_CARD_LEFT + 40;
const TIP_BUBBLE_PAD = 12;
const TIP_BUBBLE_BORDER = 1; // border-box라 padding처럼 content 폭에서 빠지므로 같이 더해야 함

/** 짹이 성격 — 안 친절하고 까칠한 톤. 매 방문마다 하나를 랜덤으로 골라 보여준다. */
const JJAEKI_HINTS: Record<Language, string[]> = {
  ko: ['이것도 몰라? 뭐, 보든가', '이거 모르면 안 되는데', '설마 이것도 모르는 거 아니지?', '알아두면 좋을걸. 몰라도 말고'],
  en: ["Don't know this either? Fine, take a look.", 'You really should know this one.', "Don't tell me you don't know this too.", 'Might wanna know this. Or not, whatever.'],
  ja: ['これも知らないの？まあ、見てみれば？', 'これは知っておかないとね', 'まさかこれも知らないなんてことないよね？', '知っておくと得するかもよ。知らなくても別にいいけど'],
  vi: ['Cái này cũng không biết à? Thôi thì xem đi.', 'Cái này thì phải biết chứ.', 'Đừng nói là cái này cũng không biết đấy nhé?', 'Biết thì tốt. Không biết cũng chẳng sao.'],
  es: ['¿Tampoco sabes esto? Bueno, échale un vistazo.', 'Esto sí que deberías saberlo.', 'No me digas que esto tampoco lo sabías.', 'Podría venirte bien saberlo. O no, tú verás.'],
};

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
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortIndex, setSortIndex] = useState(initialSortIndex);
  const [query, setQuery] = useState('');
  const [consonant, setConsonant] = useState<string>('전체');
  const [categorySlugs, setCategorySlugs] = useState<string[]>(initialCategorySlugs);
  const [savedIds, setSavedIds] = useState<string[]>(authStore.getSavedWordIds());
  /* 대사도 방문마다 랜덤 — 인덱스만 고정해 두고 언어 전환 시엔 같은 인덱스의 다른 언어 문장을 보여준다 */
  const [hintIndex] = useState(() => Math.floor(Math.random() * JJAEKI_HINTS.ko.length));
  /* 말풍선 폭을 첫째 줄(힌트 문구) 실측 너비에 맞춰 늘였다 줄였다 하기 위한 측정값 */
  const [hintWidth, setHintWidth] = useState<number | null>(null);

  useEffect(() => { fetchWords().then(data => { setWords(data); setLoading(false); }); }, []);

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
    const pool = words.filter(w => matchesCategories(w, categorySlugs));
    return pool.length > 0 ? pickLeastPopular(pool, w => w.likes) : words[0];
  }, [words, categorySlugs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = words
      .filter(w => matchesCategories(w, categorySlugs))
      .filter(w => !q || w.word.includes(q) || w.shortDesc.includes(q) || w.category.toLowerCase().includes(q));
    return sortWords(base, sortIndex);
  }, [words, sortIndex, query, categorySlugs]);

  const showConsonantRow = sortIndex === 2;
  const visible = useMemo(() => {
    if (!showConsonantRow || consonant === '전체') return filtered;
    return filtered.filter(w => getInitialConsonant(w.word) === consonant);
  }, [filtered, showConsonantRow, consonant]);

  /* 비로그인도 즐겨찾기 가능 — 세션 동안 유지되고 로그인 시 계정으로 이관된다(authStore).
   * 저장 해제는 한도와 무관하게 항상 허용, 새로 저장할 때만 무료 한도(FREE_WORD_SAVE_LIMIT) 체크. */
  const toggleSave = (id: string) => {
    if (!authStore.isWordSaved(id) && !authStore.canSaveMoreWords()) {
      Alert.alert(t('saveLimitReachedTitle'), t('saveLimitReachedMessage'));
      return;
    }
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
                placeholder={t('wordSearchPlaceholder')}
                placeholderTextColor={Colors.textTertiary}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              <AppIcon icon={Mic} size={15} />
            </View>

            {/* ── 추천 단어 배너 – Figma: Callout Card/Recommend_짹이 ── */}
            {showTipCard && tipWord && (
              <TouchableOpacity
                style={styles.tipCard}
                onPress={() => router.push(`/tabs/dictionary/${tipWord.id}`)}
                activeOpacity={0.85}
              >
                {/* 첫 줄(힌트)은 무조건 전체가 보여야 하므로 폭 상한(maxWidth)보다 우선하고,
                 * flexShrink:0으로 좁은 화면에서도 압축되지 않는다 — 대신 옆의 마스코트가 줄어든다.
                 * maxWidth는 CSS에서 width보다 항상 이기므로 같이 올려줘야 실제로 넓어진다 */}
                <View
                  style={[
                    styles.tipTextWrap,
                    hintWidth != null && {
                      width: hintWidth + TIP_BUBBLE_PAD * 2 + TIP_BUBBLE_BORDER * 2,
                      maxWidth: hintWidth + TIP_BUBBLE_PAD * 2 + TIP_BUBBLE_BORDER * 2,
                      flexShrink: 0,
                    },
                  ]}
                >
                  <View style={styles.bubbleTailOuter} pointerEvents="none" />
                  <View style={styles.bubbleTailInner} pointerEvents="none" />
                  {/* 화면 밖에서 폭 제약 없이 자연 너비를 재는 측정용 사본 — 실제 표시되는 줄과 폭 제약을
                   * 공유하면 잰 값이 잰 값을 되먹임해 너비가 굳어버리므로 별도로 분리한다 */}
                  <Text
                    style={[styles.tipHint, styles.measureGhost]}
                    numberOfLines={1}
                    onLayout={e => setHintWidth(e.nativeEvent.layout.width)}
                  >
                    {JJAEKI_HINTS[language][hintIndex]}
                  </Text>
                  {/* 박스가 이미 이 텍스트의 실측 너비에 맞춰져 있어 adjustsFontSizeToFit이 불필요 —
                   * 오히려 폭이 넓어지기 전 첫 렌더의 축소값이 그대로 굳어버리는 문제가 있었다 */}
                  <Text style={styles.tipHint} numberOfLines={1}>
                    {JJAEKI_HINTS[language][hintIndex]}
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
                <AppIcon icon={Volume2} size={20} style={styles.iconBtn} onPress={() => speakWord(item)} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator color={Colors.textTertiary} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{t('noSearchResults')}</Text>
            </View>
          )
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

  /* 가로는 marginHorizontal:24가 검색창과 동일해 이미 고정 폭 — 세로는 카테고리 말풍선 실측값(105)으로 고정 */
  tipCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 24, marginTop: 16, height: 105,
  },
  /* minWidth:0 없으면 Text 내용 너비가 최소 크기로 잡혀 flexShrink가 안 먹고 오른쪽 캐릭터와 겹친다.
   * 말풍선 배경 자체를 이 View가 담당 — 3줄 텍스트 크기에 맞춰 폭/높이가 정해지고 사방 8px 여백만 준다. */
  tipTextWrap: {
    flexShrink: 1, minWidth: 0, maxWidth: TIP_BUBBLE_MAX_WIDTH, gap: 4,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: TIP_BUBBLE_PAD, paddingVertical: TIP_BUBBLE_PAD,
  },
  /* 오른쪽 짹이를 향한 말풍선 꼬리 — border-triangle 기법. 테두리색 삼각형(Outer) 위에
   * 1px 작은 배경색 삼각형(Inner)을 겹쳐 윤곽선 있는 삼각형처럼 보이게 한다.
   * (이전엔 사각형을 45도 회전시켰는데 보이는 두 변의 조합이 아래쪽을 향해 잘못 그려졌었음) */
  bubbleTailOuter: {
    position: 'absolute', right: -8, top: '50%', marginTop: -7,
    width: 0, height: 0,
    borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 8,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: Colors.border,
  },
  bubbleTailInner: {
    position: 'absolute', right: -7, top: '50%', marginTop: -6,
    width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 7,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: Colors.surface,
  },
  tipHint: { fontSize: 14, color: Colors.textEmphasis, fontFamily: undefined },
  measureGhost: { position: 'absolute', opacity: 0, left: -9999, top: 0 },
  tipWord: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textEmphasis },
  tipClick: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  /* 짹이 크기/위치는 고정 — 카드가 고정 폭(312)이라 줄어들 필요가 없다.
   * marginRight 없이 카드 우측 끝(검색창 우측 끝과 동일)에 딱 맞춘다 */
  tipImg: { width: 93, height: 107, flexShrink: 0 },




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
