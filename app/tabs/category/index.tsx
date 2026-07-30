import {
  StyleSheet, View, SafeAreaView, Image, ImageBackground,
  FlatList, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Colors, getCategoryLabelColor } from '../../../constants/Colors';
import { CATEGORIES, getCategoryName, pickLeastPopular, type Category } from '../../../constants/categories';
import { MOCK_WORDS } from '../../../constants/mockWords';
import { authStore } from '../../../constants/authStore';
import { languageStore, useLanguage, type Language } from '../../../constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { CalloutBubble, CALLOUT_BUBBLE_ASPECT } from '@/components/icons/CalloutBubble';
import { Search, Mic, Bell, Star, ChevronDown } from 'lucide-react-native';

const HORANG_ICON = require('../../../assets/Callout Card/image 146.png');
const MIC_ICON = require('../../../assets/categories/icon-mic.png');
const ACTIVE_STAR_COLOR = '#FACC15';
/* Bubble_호랭.svg 원본 비율(228:95)을 유지한 실제 렌더 크기 — 카드 폭까지 늘리면
 * 말풍선 꼬리가 비율대로 밀려나 우측 호랭이와 겹친다. 카드 높이(108)에 맞춰
 * 원본 비율로만 키우고, 왼쪽에 붙여서 꼬리가 항상 호랭이 쪽에 오도록 고정한다. */
const RECOMMEND_BUBBLE_HEIGHT = 108;
const RECOMMEND_BUBBLE_WIDTH = RECOMMEND_BUBBLE_HEIGHT * CALLOUT_BUBBLE_ASPECT;

/** 호랭이 성격 — 책 읽는 걸 좋아하는 붙임성 있는 서생 톤. 매 방문마다 하나를 랜덤으로 골라 보여준다. */
const HORANG_HINTS: Record<Language, string[]> = {
  ko: ['아직 안 가본 카테고리예요!', '오늘은 여기부터 볼까요?', '이 카테고리도 궁금하지 않아요?', '한번 둘러보고 가요!'],
  en: ["A category you haven't explored yet!", 'How about starting here today?', 'Curious about this one too?', 'Take a look around!'],
};

type SortMode = '인기순' | '가나다순';

/** Figma: 229:2528 — 카테고리 그리드 */
export default function CategoryScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [sortMode, setSortMode] = useState<SortMode>('인기순');
  const [, forceUpdate] = useState(0);

  const countBySlug = Object.fromEntries(
    CATEGORIES.map(c => [c.slug, MOCK_WORDS.filter(w => w.category === c.slug).length])
  );

  /* 항상 같은(가장 인기 있는) 카테고리 대신, 잘 안 찾아보는 카테고리부터 랜덤하게 추천 —
   * 화면을 다시 열 때마다 바뀌도록 마운트당 한 번만 뽑고, 좋아요 토글 등 재렌더로는 안 바뀌게 고정한다. */
  const topCategory = useMemo(
    () => pickLeastPopular(CATEGORIES, c => countBySlug[c.slug] ?? 0),
    [],
  );
  /* 대사도 방문마다 랜덤 — 인덱스만 고정해 두고 언어 전환 시엔 같은 인덱스의 다른 언어 문장을 보여준다 */
  const [hintIndex] = useState(() => Math.floor(Math.random() * HORANG_HINTS.ko.length));

  const sortedCategories = [...CATEGORIES].sort((a, b) =>
    sortMode === '인기순'
      ? (countBySlug[b.slug] ?? 0) - (countBySlug[a.slug] ?? 0)
      : getCategoryName(a, language).localeCompare(getCategoryName(b, language), language)
  );

  /* 단어 즐겨찾기(별)와 동일하게 비로그인도 허용 — 세션/로컬에 유지되고 로그인 시 계정으로 이관된다.
   * 예전엔 여기서 로그인 유도 Alert을 띄웠는데, react-native-web은 Alert을 구현하지 않아
   * 웹에서는 하트를 눌러도 아무 반응이 없었다. */
  const handleToggleLike = (category: Category) => {
    authStore.toggleCategoryLiked(category.slug);
    forceUpdate(n => n + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar – Figma: Navigation/TopAppBar/Category (375×44, bg #52514e) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{t('category')}</Text>
        <View style={styles.topBarBell}>
          <AppIcon icon={Bell} size={22} color={Colors.navBarIconActive} onPress={() => router.push('/notifications')} />
          <View style={styles.notifDot} />
        </View>
      </View>

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
            >
              <View style={styles.searchBar}>
                <AppIcon icon={Search} size={15} />
                <Text style={styles.searchPlaceholder}>Search</Text>
                <AppIcon icon={Mic} size={15} />
              </View>
            </TouchableOpacity>

            {/* ── 추천 카테고리 – Figma: Callout Card/Recommend_호랭 (말풍선 배경 + 호랭) */}
            <TouchableOpacity
              style={styles.recommendCard}
              onPress={() => router.push(`/tabs/category/${topCategory.slug}`)}
              activeOpacity={0.85}
            >
              <View style={styles.bubbleLayer} pointerEvents="none">
                <CalloutBubble width={RECOMMEND_BUBBLE_WIDTH} height={RECOMMEND_BUBBLE_HEIGHT} />
              </View>
              <View style={styles.recommendTextWrap}>
                <Text style={styles.recommendLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {HORANG_HINTS[language][hintIndex]}
                </Text>
                <Text style={styles.recommendName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  &quot;{getCategoryName(topCategory, language)}&quot;
                </Text>
                <Text style={styles.recommendClick}>Click &gt;</Text>
              </View>
              <Image source={HORANG_ICON} style={styles.recommendImg} resizeMode="contain" />
            </TouchableOpacity>

            {/* ── 정렬/카운트 행 ── */}
            <View style={styles.filterRow}>
              <Text style={styles.countLabel}>
                {t('totalPrefix')} <Text style={styles.countNumber}>{CATEGORIES.length}</Text> {t('categoriesSuffix')}
              </Text>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setSortMode(m => (m === '인기순' ? '가나다순' : '인기순'))}
                activeOpacity={0.7}
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
          return (
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push(`/tabs/category/${item.slug}`)}
              activeOpacity={0.85}
            >
              <ImageBackground source={item.image} style={styles.cardBg} imageStyle={styles.cardBgImage}>
                <View style={styles.cardOverlay} />
                <View style={styles.cardTopRow}>
                  <Image source={MIC_ICON} style={styles.micIcon} />
                  <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={e => {
                    e.stopPropagation?.();
                    handleToggleLike(item);
                  }}
                  hitSlop={8}
                >
                    <AppIcon
                      icon={Star}
                      size={24}
                      color={Colors.textEmphasis}
                      fill={liked ? ACTIVE_STAR_COLOR : 'none'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardTextWrap}>
                  <Text
                    style={styles.categoryName}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {getCategoryName(item, language)}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

  /* 가로 여백은 FlatList contentContainerStyle(grid)의 paddingHorizontal: 24가 이미 담당한다.
   * 여기서 또 주면 사전 화면(24)보다 두 배로 좁아지므로 세로 여백만 지정할 것. */
  searchBarWrap: { paddingTop: 16, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 36, borderRadius: 8, paddingHorizontal: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: Colors.textTertiary, fontFamily: undefined },

  /* Figma: Callout Card/Recommend_호랭 — 배경은 Bubble_호랭.svg를 그대로 그린 CalloutBubble,
   * 실사 이미지 대신 앱 마스코트(호랭)를 꼬리 쪽에 재사용 */
  recommendCard: {
    marginTop: 8, marginBottom: 16,
    height: 108,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 16,
  },
  /* 카드 폭 전체로 늘리면 꼬리 비율이 밀려 호랭이와 겹쳐서, 원본 비율 그대로 왼쪽에만 붙인다 */
  bubbleLayer: { position: 'absolute', left: 0, top: 0 },
  /* minWidth:0 없으면 Text 내용 너비가 최소 크기로 잡혀 flexShrink가 안 먹고 오른쪽 호랭이와 겹친다 */
  recommendTextWrap: { gap: 8, flexShrink: 1, minWidth: 0 },
  recommendLabel: { fontSize: 14, color: Colors.textEmphasis, fontFamily: undefined },
  recommendName: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textEmphasis },
  recommendClick: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  recommendImg: { width: 93, height: 107, marginRight: 8 },

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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 12, paddingTop: 6, paddingRight: 4,
  },
  micIcon: { width: 16, height: 16, tintColor: '#1A1A1A' },
  likeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  likeIcon: { width: 24, height: 24 },
  cardTextWrap: { position: 'absolute', left: 12, right: 12, bottom: 10 },
  /* 카드 텍스트는 기존 대비 더 작게 보여야 하므로 70% 크기로 조정. */
  categoryName: { fontSize: 26, lineHeight: 31, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textEmphasis },
});
