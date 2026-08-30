import { StyleSheet, View, Image, ImageBackground, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Colors, getCategoryLabelColor } from '../../../constants/Colors';
import { CATEGORIES, getCategoryName, pickLeastPopular, type Category } from '../../../constants/categories';
import { fetchWords, type Word } from '../../../constants/words';
import { authStore, BETA_UNLIMITED_ENTITLEMENTS } from '../../../constants/authStore';
import { languageStore, useLanguage, type Language } from '../../../constants/languageStore';
import { Alert } from '@/constants/alert';
import { AppIcon } from '@/components/AppIcon';
import { TopAppBar } from '@/components/navigation/TopAppBar';
import { Search, Mic, Star, ChevronDown, Crown } from 'lucide-react-native';
import { SCREEN_WIDTH } from '../../../constants/layout';

const HORANG_ICON = require('../../../assets/Callout Card/image 146.png');
/* 활성 별 채움 — Figma 팔레트의 point5(골드)를 재사용, 임의 hex 금지 규칙 준수 */
const ACTIVE_STAR_COLOR = Colors.premium;
const RECOMMEND_CARD_LEFT = 24; // FlatList contentContainerStyle paddingHorizontal과 동일
const RECOMMEND_BUBBLE_MAX_WIDTH = SCREEN_WIDTH / 2 - RECOMMEND_CARD_LEFT + 40;
const RECOMMEND_BUBBLE_PAD = 12;
const RECOMMEND_BUBBLE_BORDER = 1; // border-box라 padding처럼 content 폭에서 빠지므로 같이 더해야 함

/** 호랭이 성격 — 책 읽는 걸 좋아하는 붙임성 있는 서생 톤. 매 방문마다 하나를 랜덤으로 골라 보여준다. */
const HORANG_HINTS: Record<Language, string[]> = {
  ko: ['아직 안 가봤죠?', '오늘은 여기부터!', '여기도 궁금하죠?', '한번 둘러봐요!'],
  en: ['New ground for you!', 'Start here today?', 'Curious about this?', 'Take a look!'],
  ja: ['まだ見てないよね?', '今日はここから!', 'ここも気になる?', 'のぞいてみてね!'],
  vi: ['Chưa ghé nhỉ?', 'Hôm nay bắt đầu đây!', 'Tò mò chứ?', 'Ghé xem thử nhé!'],
  es: ['¿Aún sin explorar?', '¿Empezamos aquí?', '¿Te pica la curiosidad?', '¡Échale un ojo!'],
  de: ['Noch unentdeckt!', 'Heute hier starten?', 'Auch neugierig?', 'Schau mal rein!'],
};

type SortMode = '인기순' | '가나다순';

/** Figma: 229:2528 — 카테고리 그리드 */
export default function CategoryScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [sortMode, setSortMode] = useState<SortMode>('인기순');
  const [, forceUpdate] = useState(0);
  const [isPremium, setIsPremium] = useState(authStore.isPremium());
  const [words, setWords] = useState<Word[]>([]);
  /* 항상 같은(가장 인기 있는) 카테고리 대신, 잘 안 찾아보는 카테고리부터 랜덤하게 추천 —
   * 화면을 다시 열 때마다 바뀌도록 마운트당 한 번만 뽑고, 좋아요 토글 등 재렌더로는 안 바뀌게 고정한다. */
  const [topCategory, setTopCategory] = useState<Category | null>(null);

  useFocusEffect(useCallback(() => {
    setIsPremium(authStore.isPremium());
  }, []));

  useEffect(() => {
    const unsub = authStore.subscribe(() => setIsPremium(authStore.isPremium()));
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    fetchWords().then(data => {
      setWords(data);
      const counts = Object.fromEntries(CATEGORIES.map(c => [c.slug, data.filter(w => w.category === c.slug).length]));
      setTopCategory(pickLeastPopular(CATEGORIES, c => counts[c.slug] ?? 0));
    });
  }, []);

  const countBySlug = Object.fromEntries(
    CATEGORIES.map(c => [c.slug, words.filter(w => w.category === c.slug).length])
  );
  /* 대사도 방문마다 랜덤 — 인덱스만 고정해 두고 언어 전환 시엔 같은 인덱스의 다른 언어 문장을 보여준다 */
  const [hintIndex] = useState(() => Math.floor(Math.random() * HORANG_HINTS.ko.length));

  const sortedCategories = [...CATEGORIES].sort((a, b) =>
    sortMode === '인기순'
      ? (countBySlug[b.slug] ?? 0) - (countBySlug[a.slug] ?? 0)
      : getCategoryName(a, language).localeCompare(getCategoryName(b, language), language)
  );

  /* 카테고리 즐겨찾기는 회원 전용(무료 회원 최대 2개, 프리미엄 무제한).
   * 해제는 한도와 무관하게 항상 허용, 새로 추가할 때만 로그인·한도 체크. */
  const handleToggleLike = (category: Category) => {
    const alreadyLiked = authStore.isCategoryLiked(category.slug);
    if (!alreadyLiked && !authStore.isLoggedIn()) {
      Alert.alert(t('loginRequiredTitle'), t('loginRequiredCategoryLike'), [
        { text: t('cancelLabel'), style: 'cancel' },
        { text: t('goToLogin'), onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    if (!alreadyLiked && !authStore.canLikeMoreCategories()) {
      Alert.alert(t('categoryLikeLimitReachedTitle'), t('categoryLikeLimitReachedMessage'));
      return;
    }
    authStore.toggleCategoryLiked(category.slug);
    forceUpdate(n => n + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar variant="title" title={t('category')} />

      <FlatList
        data={sortedCategories}
        keyExtractor={item => item.slug}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <>
            {/* ── 검색바 – Figma: Controls/Search Bar (진입 시 /tabs/category/search로 이동) */}
            <TouchableOpacity
              style={styles.searchBarWrap}
              onPress={() => router.push('/tabs/category/search')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('categorySearchPlaceholder')}
            >
              <View style={styles.searchBar}>
                <AppIcon icon={Search} size={15} />
                <Text style={styles.searchPlaceholder}>{t('categorySearchPlaceholder')}</Text>
                <AppIcon icon={Mic} size={15} />
              </View>
            </TouchableOpacity>

            {/* ── 추천 카테고리 – Figma: Callout Card/Recommend_호랭 (말풍선 배경 + 호랭) */}
            {topCategory && (
              <TouchableOpacity
                style={styles.recommendCard}
                onPress={() => router.push(`/tabs/category/${topCategory.slug}`)}
                activeOpacity={0.85}
              >
                {/* 캐릭터 고정, 말풍선은 내용 크기(운영자 규칙). 고스트 실측 장치는 웹에서
                 * 줄어든 폭이 측정을 다시 제한하는 되먹임 락 때문에 삭제 — 힌트가 짧아져 불필요. */}
                <View style={styles.recommendTextWrap}>
                  <View style={styles.bubbleTailOuter} pointerEvents="none" />
                  <View style={styles.bubbleTailInner} pointerEvents="none" />
                  <Text style={styles.recommendLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
                    {HORANG_HINTS[language][hintIndex]}
                  </Text>
                  <Text style={styles.recommendName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    &quot;{getCategoryName(topCategory, language)}&quot;
                  </Text>
                  <Text style={styles.recommendClick}>Click &gt;</Text>
                </View>
                <Image source={HORANG_ICON} style={styles.recommendImg} resizeMode="contain" />
              </TouchableOpacity>
            )}

            {/* ── 정렬/카운트 행 ── */}
            <View style={styles.filterRow}>
              <Text style={styles.countLabel}>
                {t('totalPrefix')} <Text style={styles.countNumber}>{CATEGORIES.length}</Text> {t('categoriesSuffix')}
              </Text>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setSortMode(m => (m === '인기순' ? '가나다순' : '인기순'))}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <Text style={styles.sortLabel}>{sortMode === '인기순' ? t('sortPopular') : t('sortAlphabetical')}</Text>
                <AppIcon icon={ChevronDown} size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const liked = authStore.isCategoryLiked(item.slug);
          const labelColor = getCategoryLabelColor(item.colorBg, item.colorFg);
          const locked = item.premiumOnly && !BETA_UNLIMITED_ENTITLEMENTS && !isPremium;
          const CardBg: any = item.image ? ImageBackground : View;
          const cardBgProps = item.image
            /* 이미지 로드 실패 시에도 카테고리 색이 placeholder로 남는다 */
            ? { source: item.image, imageStyle: styles.cardBgImage, style: [styles.cardBg, { backgroundColor: item.colorBg }] }
            : { style: [styles.cardBg, { backgroundColor: item.colorBg }] };
          return (
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push(locked ? '/tabs/mypage/premium' : `/tabs/category/${item.slug}`)}
              activeOpacity={0.85}
              /* role="button"을 주면 웹에서 <button> 안에 별(즐겨찾기) <button>이 중첩돼
               * invalid HTML + hydration 오류 — 내부에 개별 컨트롤이 있는 카드에는 붙이지 않는다 */
            >
              <CardBg {...cardBgProps}>
                <View style={styles.cardOverlay} />
                <View style={styles.cardTopRow}>
                  {item.premiumOnly && !BETA_UNLIMITED_ENTITLEMENTS ? (
                    <View style={styles.likeBtn}>
                      <AppIcon icon={Crown} size={20} color={Colors.premium} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.likeBtn}
                      onPress={e => {
                        e.stopPropagation?.();
                        handleToggleLike(item);
                      }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={t('a11yLikeCategory')}
                      accessibilityState={{ selected: liked }}
                    >
                      <AppIcon
                        icon={Star}
                        size={24}
                        color={Colors.textEmphasis}
                        fill={liked ? ACTIVE_STAR_COLOR : 'none'}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.cardTextWrap}>
                  <Text
                    style={[styles.categoryName, { color: labelColor }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {getCategoryName(item, language)}
                  </Text>
                </View>
              </CardBg>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* Figma: data-badge="on" — 벨 아이콘 우측 상단 알림 점 */

  /* 가로 여백은 FlatList contentContainerStyle(grid)의 paddingHorizontal: 24가 이미 담당한다.
   * 여기서 또 주면 사전 화면(24)보다 두 배로 좁아지므로 세로 여백만 지정할 것. */
  searchBarWrap: { paddingTop: 16, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 36, borderRadius: 8, paddingHorizontal: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: Colors.textTertiary, fontFamily: undefined },

  /* Figma: Callout Card/Recommend_호랭 — 실사 이미지 대신 앱 마스코트(호랭)를 꼬리 쪽에 재사용.
   * 가로는 FlatList grid paddingHorizontal:24가 검색바와 동일해 이미 고정 폭 — 세로는 이 화면
   * 말풍선의 실측값(105)으로 고정 */
  recommendCard: {
    marginTop: 8, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: 105,
  },
  /* minWidth:0 없으면 Text 내용 너비가 최소 크기로 잡혀 flexShrink가 안 먹고 오른쪽 호랭이와 겹친다.
   * 말풍선 배경 자체를 이 View가 담당 — 첫째 줄(힌트) 실측 너비에 맞춰 폭이 늘었다 줄었다 한다. */
  recommendTextWrap: {
    gap: 8, flexShrink: 1, minWidth: 0, maxWidth: RECOMMEND_BUBBLE_MAX_WIDTH,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: RECOMMEND_BUBBLE_PAD, paddingVertical: RECOMMEND_BUBBLE_PAD,
  },
  /* 오른쪽 호랭이를 향한 말풍선 꼬리 — border-triangle 기법. 테두리색 삼각형(Outer) 위에
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
  recommendLabel: { fontSize: 14, color: Colors.textEmphasis, fontFamily: undefined },
  recommendName: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textEmphasis },
  recommendClick: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  /* 호랭이 크기/위치는 고정 — 카드가 고정 폭(312)이라 줄어들 필요가 없다.
   * marginRight 없이 카드 우측 끝(검색바 우측 끝과 동일)에 딱 맞춘다 */
  recommendImg: { width: 93, height: 107, flexShrink: 0 },

  filterRow: {
    paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  countLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  countNumber: { color: Colors.textPrimary, fontFamily: undefined },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sortLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },

  grid: { paddingHorizontal: 24, paddingBottom: 24 },
  row: { gap: 12, marginBottom: 12, justifyContent: 'space-between' },
  /* Figma: Selection/Card/Category (150×104) — 카드 배경은 카테고리별 일러스트. */
  categoryCard: {
    width: 150,
    height: 104,
    borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  /* width/height를 명시하지 않으면 ImageBackground가 이미지 원본 폭(600px)을 기준으로
   * 크기를 잡아 카드가 화면 밖으로 늘어난다(flex: 0 0 auto라 줄어들지도 않음). */
  cardBg: { flex: 1, width: '100%', height: '100%' },
  cardBgImage: { resizeMode: 'cover' },
  cardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  cardTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingTop: 6, paddingRight: 4,
  },
  likeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  likeIcon: { width: 24, height: 24 },
  cardTextWrap: { position: 'absolute', left: 12, right: 12, bottom: 10 },
  /* 카드 텍스트는 기존 대비 더 작게 보여야 하므로 70% 크기로 조정. */
  categoryName: { fontSize: 26, lineHeight: 31, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textEmphasis },
});
