import {
  StyleSheet, View, Image,
  TextInput, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Colors, getReadableTextColor } from '@/constants/Colors';
import { cardGloss, fetchWords, isLockedWord, isWordTitleBlurred, type Word } from '@/constants/words';
import { PremiumLockModal, gateLockedWord, lockedTextStyle } from '@/components/PremiumLockModal';
import { getCategoryBySlug, getCategoryName, pickLeastPopular } from '@/constants/categories';
import { languageStore, useLanguage, type Language } from '@/constants/languageStore';
import { authStore } from '@/constants/authStore';
import { speakWord } from '@/constants/speech';
import { AppIcon } from '@/components/AppIcon';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { CharacterEmptyState } from '@/components/CharacterEmptyState';
import { CharacterSuccessFeedback } from '@/components/CharacterSuccessFeedback';
import { getWordSearchMatch, wordMatchesSearch } from '@/constants/wordSearch';
import { Alert } from '@/constants/alert';
import {
  WordFilterBar, SORT_TABS, sortWords, matchesCategories, getInitialConsonant,
} from '@/components/WordFilterBar';
import { Search, Star, Volume2, Heart, X, ArrowUp } from 'lucide-react-native';
import { SCREEN_WIDTH } from '@/constants/layout';

const JJAEKI_ICON = require('../assets/characters/transparent/jjaeki-full.png');
const JJAEKI_QUESTION = require('../assets/characters/transparent/jjaeki-question.png');
const HORANG_CHEER = require('../assets/characters/transparent/horang-cheer.png');
const TIP_CARD_LEFT = 24; // searchWrap과 동일한 marginHorizontal
const TIP_BUBBLE_MAX_WIDTH = SCREEN_WIDTH / 2 - TIP_CARD_LEFT + 40;
const TIP_BUBBLE_PAD = 12;
const TIP_BUBBLE_BORDER = 1; // border-box라 padding처럼 content 폭에서 빠지므로 같이 더해야 함

/** 짹이 성격 — 안 친절하고 까칠한 톤. 매 방문마다 하나를 랜덤으로 골라 보여준다. */
const JJAEKI_HINTS: Record<Language, string[]> = {
  ko: ['이것도 몰라?', '이건 알아야지', '설마 모르는 거야?', '알아두면 좋을걸'],
  en: ['You know this one?', 'You should know this.', 'Not this one too?', 'Worth knowing.'],
  ja: ['これも知らないの?', 'これは知っとかないと', 'まさか知らない?', '知っておくと得だよ'],
  vi: ['Cái này biết chưa?', 'Phải biết cái này chứ', 'Không biết thật à?', 'Biết thì tốt đó'],
  es: ['¿Tampoco esta?', 'Esta hay que saberla.', '¿En serio no la sabes?', 'Te conviene saberla.'],
  de: ['Auch das neu?', 'Das musst du kennen.', 'Echt jetzt nicht?', 'Gut zu wissen.'],
  tr: ['Bunu bilmiyor musun?', 'Bunu bilmelisin.', 'Cidden bilmiyorsun?', 'Bilsen iyi olur.'],
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
  showScrollToTopButton = false,
}: {
  initialCategorySlugs?: string[];
  showTipCard?: boolean;
  initialSortIndex?: number;
  showScrollToTopButton?: boolean;
}) {
  const listRef = useRef<FlatList<Word>>(null);
  const language = useLanguage();
  const t = languageStore.t;
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortIndex, setSortIndex] = useState(initialSortIndex);
  const [query, setQuery] = useState('');
  const [consonant, setConsonant] = useState<string>('전체');
  const [categorySlugs, setCategorySlugs] = useState<string[]>(initialCategorySlugs);
  const [savedIds, setSavedIds] = useState<string[]>(authStore.getSavedWordIds());
  const [savedFeedbackWord, setSavedFeedbackWord] = useState<string | null>(null);
  /* 대사도 방문마다 랜덤 — 인덱스만 고정해 두고 언어 전환 시엔 같은 인덱스의 다른 언어 문장을 보여준다 */
  const [hintIndex] = useState(() => Math.floor(Math.random() * JJAEKI_HINTS.ko.length));
  const [lockModalVisible, setLockModalVisible] = useState(false);

  /* 속어 단어도 검색·목록에 노출(표제어만) — 행 렌더가 블러, 탭이 팝업 게이트를 담당 */
  useEffect(() => { fetchWords({ includeLocked: true }).then(data => { setWords(data); setLoading(false); }); }, []);

  const openWord = (word: Word) => gateLockedWord(word, () => setLockModalVisible(true));

  /* 카테고리 상세에서 다른 카테고리로 이동하면 필터를 새 slug로 리셋 */
  useEffect(() => { setCategorySlugs(initialCategorySlugs); }, [initialCategorySlugs.join(',')]);

  useFocusEffect(useCallback(() => { setSavedIds(authStore.getSavedWordIds()); }, []));
  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(() => setSavedIds(authStore.getSavedWordIds()));
    return () => { unsub(); };
  }, []);
  useEffect(() => {
    if (!savedFeedbackWord) return;
    const timeout = setTimeout(() => setSavedFeedbackWord(null), 2400);
    return () => clearTimeout(timeout);
  }, [savedFeedbackWord]);

  /* 추천 배너 단어 — 항상 인기 단어 대신, (필터가 걸려 있으면 그 안에서) 좋아요가 적어
   * 잘 안 찾아보는 단어부터 랜덤하게 고른다. 필터가 바뀔 때만 다시 뽑는다. */
  const tipWord = useMemo(() => {
    /* 잠긴 속어는 추천 배너에서 제외 — 배너는 상세로 바로 보내는 자리라 게이트가 없다 */
    const pool = words.filter(w => matchesCategories(w, categorySlugs) && !isLockedWord(w));
    return pool.length > 0 ? pickLeastPopular(pool, w => w.likes) : pool[0];
  }, [words, categorySlugs]);

  const filtered = useMemo(() => {
    const base = words
      .filter(w => matchesCategories(w, categorySlugs))
      .filter(w => wordMatchesSearch(w, query));
    return sortWords(base, sortIndex);
  }, [words, sortIndex, query, categorySlugs]);

  const voiceSearchContext = useMemo(
    () => words.map(word => word.word).filter(Boolean).slice(0, 100),
    [words],
  );

  const showConsonantRow = sortIndex === 2;
  const visible = useMemo(() => {
    if (!showConsonantRow || consonant === '전체') return filtered;
    return filtered.filter(w => getInitialConsonant(w.word) === consonant);
  }, [filtered, showConsonantRow, consonant]);

  /* 단어 저장은 회원 전용(무료 회원 최대 FREE_WORD_SAVE_LIMIT개, 프리미엄 무제한).
   * 저장 해제는 한도와 무관하게 항상 허용, 새로 저장할 때만 로그인·한도 체크. */
  const toggleSave = (word: Word) => {
    const alreadySaved = authStore.isWordSaved(word.id);
    if (!alreadySaved && !authStore.isLoggedIn()) {
      Alert.alert(t('loginRequiredTitle'), t('loginRequiredSave'), [
        { text: t('cancelLabel'), style: 'cancel' },
        { text: t('goToLogin'), onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    if (!alreadySaved && !authStore.canSaveMoreWords()) {
      Alert.alert(t('saveLimitReachedTitle'), t('saveLimitReachedMessage'));
      return;
    }
    authStore.toggleWordSaved(word.id);
    setSavedIds(authStore.getSavedWordIds());
    if (!alreadySaved) setSavedFeedbackWord(word.word);
  };

  const toggleCategory = (slug: string) => {
    setCategorySlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
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
              />
              {query.length > 0 && (
                <AppIcon
                  icon={X}
                  size={16}
                  color={Colors.textSecondary}
                  hitSlop={8}
                  onPress={() => setQuery('')}
                  accessibilityLabel={t('clearWordSearch')}
                />
              )}
              <VoiceSearchButton onTranscript={setQuery} contextualStrings={voiceSearchContext} />
            </View>

            {/* ── 추천 단어 배너 – Figma: Callout Card/Recommend_짹이 ── */}
            {showTipCard && tipWord && (
              <TouchableOpacity accessibilityRole="button"
                style={styles.tipCard}
                onPress={() => router.push(`/tabs/dictionary/${tipWord.id}`)}
                activeOpacity={0.85}
              >
                {/* 캐릭터 고정, 말풍선은 내용 크기(운영자 규칙). 예전의 고스트 실측 장치는
                 * 웹에서 줄어든 컨테이너 폭이 다시 측정을 제한하는 되먹임 락을 만들어 삭제 —
                 * 힌트 문구가 말풍선 최대 폭에 맞게 짧아진 지금은 자연 크기로 충분하다. */}
                <View style={styles.tipTextWrap}>
                  <View style={styles.bubbleTailOuter} pointerEvents="none" />
                  <View style={styles.bubbleTailInner} pointerEvents="none" />
                  <Text style={styles.tipHint} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
                    {JJAEKI_HINTS[language][hintIndex]}
                  </Text>
                  <Text style={styles.tipWord} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    &quot;{tipWord.word}&quot;
                  </Text>
                  <Text style={styles.tipClick}>{t('mascotBubbleCta')}</Text>
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
          const locked = isLockedWord(item);
          const searchMatch = getWordSearchMatch(item, query);
          const translationSearchMatch = searchMatch?.field === 'translation' ? searchMatch.translation : null;
          return (
            /* role="button" 금지 — 행 안에 별/발음 Pressable(button)이 있어 웹에서
             * <button> 중첩 = invalid HTML + hydration 오류 (카테고리 그리드와 동일 규칙) */
            <TouchableOpacity
              style={[
                styles.wordItem,
                index === 0 && styles.wordItemFirst,
                index === visible.length - 1 && styles.wordItemLast,
              ]}
              onPress={() => openWord(item)}
              activeOpacity={0.7}
            >
              {/* 순위 번호 삭제(운영자 결정 2026-09-02) — 좁은 폭에서 초성 단어(ㅠㅠ)가 세로로 꺾이던 원인 */}
              <View style={styles.wordItemLeft}>
                <View style={styles.wordTopRow}>
                  <Text style={[styles.wordText, isWordTitleBlurred(item) && lockedTextStyle]}>{item.word}</Text>
                  {/* 로마자는 표제어의 읽기라 표제어와 같은 기준으로만 가린다 — 뜻(wordDesc)은 locked 기준 */}
                  <Text style={[styles.wordReading, isWordTitleBlurred(item) && lockedTextStyle]} numberOfLines={1}>{item.romanization}</Text>
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
                  {translationSearchMatch ? (
                    <Text
                      style={styles.searchMatchEvidence}
                      numberOfLines={1}
                      testID={`translation-search-match-${item.id}`}
                    >
                      {t('translationSearchMatch')} {translationSearchMatch.lang}
                    </Text>
                  ) : (
                    <Text style={[styles.wordDesc, locked && lockedTextStyle]} numberOfLines={1}>{cardGloss(item, language)}</Text>
                  )}
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
                  onPress={() => toggleSave(item)}
                  accessibilityLabel={t('a11ySaveWord')}
                />
                <AppIcon
                  icon={Volume2}
                  size={20}
                  style={styles.iconBtn}
                  hitSlop={6}
                  /* 표제어 블러 중엔 발음이 단어를 유출하므로 같은 게이트로 보낸다 */
                  onPress={() => (isWordTitleBlurred(item) ? openWord(item) : speakWord(item))}
                  accessibilityLabel={t('a11yPlayPronunciation')}
                />
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
              <CharacterEmptyState
                image={JJAEKI_QUESTION}
                title={t('noSearchResults')}
                testID="dictionary-search-empty-state"
              />
            </View>
          )
        }
        contentContainerStyle={visible.length === 0 ? { flexGrow: 1 } : styles.listContent}
      />
      <PremiumLockModal visible={lockModalVisible} onClose={() => setLockModalVisible(false)} />
      {savedFeedbackWord ? (
        <View pointerEvents="none" style={styles.saveFeedbackWrap}>
          <CharacterSuccessFeedback
            image={HORANG_CHEER}
            title={t('savedLabel')}
            word={savedFeedbackWord}
            testID="word-saved-success-feedback"
          />
        </View>
      ) : null}
      {showScrollToTopButton && (
        <TouchableOpacity accessibilityRole="button"
          style={styles.scrollTopBtn}
          onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
          activeOpacity={0.85}
          accessibilityLabel={t('a11yScrollToTop')}
        >
          <AppIcon icon={ArrowUp} size={20} color={Colors.navBarIconActive} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingBottom: 24 },
  saveFeedbackWrap: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 16,
  },
  scrollTopBtn: {
    position: 'absolute', right: 16, bottom: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 24, marginTop: 16,
    minHeight: 44, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12,
  },
  /* TextInput은 AppText를 안 거쳐 기본 서체가 시스템 산세리프라 카테고리 검색창과 달랐음 — 명시 지정 */
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: 'NotoSerifKR_400Regular' },

  /* 가로는 marginHorizontal:24가 검색창과 동일해 이미 고정 폭 — 세로는 카테고리 말풍선 실측값(105)으로 고정 */
  /* 말풍선+캐릭터를 한 그룹으로 중앙 배치 — 말풍선 크기에 따라 그룹이 함께 움직인다(운영자 규칙) */
  tipCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    marginHorizontal: 24, marginTop: 16, minHeight: 105,
  },
  /* minWidth:0 없으면 Text 내용 너비가 최소 크기로 잡혀 flexShrink가 안 먹고 오른쪽 캐릭터와 겹친다.
   * 말풍선 배경 자체를 이 View가 담당 — 3줄 텍스트 크기에 맞춰 폭/높이가 정해지고 사방 8px 여백만 준다. */
  tipTextWrap: {
    alignSelf: 'center', flexShrink: 1, minWidth: 0, maxWidth: TIP_BUBBLE_MAX_WIDTH, gap: 4,
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
  searchMatchEvidence: { flexShrink: 1, fontSize: 11, color: Colors.point1, fontFamily: undefined, fontWeight: '600' },
  wordItemRight: { alignItems: 'center', gap: 4 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },

  /* 카테고리 선택 모달 */
});
