import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, Image, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { fetchWords, type Word } from '../../constants/words';
import { BOARD_COLORS } from '../../constants/mockPosts';
import { fetchPosts, type CommunityPostSummary } from '../../constants/community';
import { fetchUnreadNotificationCount } from '../../constants/notifications';
import { getCategoryBySlug, getCategoryName } from '../../constants/categories';
import { getBoardLabel } from '../../constants/mockPosts';
import { sortWords } from '@/components/WordFilterBar';
import { SCREEN_WIDTH } from '../../constants/layout';
import { languageStore, useLanguage } from '../../constants/languageStore';
import { authStore } from '../../constants/authStore';
import { SokDakLogo } from '@/components/icons/SokDakLogo';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { Search, Bell, Eye, Heart, MessageCircle, Crown, ChevronRight } from 'lucide-react-native';

const JJAEKI_WAVE = require('../../assets/characters/transparent/jjaeki-wave.png');

/** 날짜(YYYY-MM-DD)를 시드로 결정적 난수를 뽑아 오늘 하루 동안은 항상 같은 결과가 나오게 한다 */
function pickDaily<T>(items: T[], count: number, seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const idx = h % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

/** "오늘의 실전 표현" — 한국 거주 외국인이 바로 써먹는 상황별 표현.
 * 신조어 사전과는 다른 결의 콘텐츠라 별도 로컬 데이터로 관리한다(다른 화면의
 * HORANG_HINTS 등과 동일한 컨벤션 — 아직 사전 콘텐츠처럼 5개 언어로 번역하진 않음). */
type Situation = 'cafe' | 'subway' | 'work' | 'hospital' | 'sns' | 'dinner';
const SITUATION_LABEL_KEY: Record<Situation, Parameters<typeof languageStore.t>[0]> = {
  cafe: 'situationCafe', subway: 'situationSubway', work: 'situationWork',
  hospital: 'situationHospital', sns: 'situationSns', dinner: 'situationDinner',
};
const EXPRESSIONS: { situation: Situation; ko: string; en: string }[] = [
  { situation: 'cafe', ko: '이거 하나 주세요', en: 'One of these, please (pointing at the menu)' },
  { situation: 'cafe', ko: '테이크아웃 할게요', en: "I'll take it to go" },
  { situation: 'subway', ko: '이번 역에서 내리세요?', en: 'Are you getting off at this stop?' },
  { situation: 'subway', ko: '여기 자리 있어요?', en: 'Is this seat taken?' },
  { situation: 'work', ko: '먼저 퇴근하겠습니다', en: "I'll head out first (leaving before others)" },
  { situation: 'work', ko: '확인 후 회신 드리겠습니다', en: "I'll check and get back to you" },
  { situation: 'hospital', ko: '여기가 아파요', en: 'It hurts here' },
  { situation: 'hospital', ko: '실비보험 있어요', en: 'I have private (supplemental) insurance' },
  { situation: 'sns', ko: '선팔하고 갈게요', en: "I'll follow you first" },
  { situation: 'sns', ko: '댓글 감사해요', en: 'Thanks for the comment' },
  { situation: 'dinner', ko: '제가 한 잔 따라드릴게요', en: 'Let me pour you a drink' },
  { situation: 'dinner', ko: '저는 술을 잘 못 마셔요', en: "I don't drink well (polite way to decline alcohol)" },
];

/** 히어로 캐러셀 자동 재생 간격(ms) */
const HERO_AUTOPLAY_INTERVAL = 4000;

export default function HomeScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [heroIndex, setHeroIndex] = useState(0);
  const [communityPosts, setCommunityPosts] = useState<CommunityPostSummary[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  /** Figma: Card/Recommend2 — 오늘의 단어 캐러셀 (날짜 기반 랜덤 3개, 매일 자정 기준으로 바뀜) */
  const [heroWords, setHeroWords] = useState<Word[]>([]);
  /** Figma: 새로운 신조어 섹션 — new-slang 카테고리 단어 미리보기 */
  const [newSlangWords, setNewSlangWords] = useState<Word[]>([]);
  const heroScrollRef = useRef<ScrollView>(null);
  const heroPausedRef = useRef(false);
  const [isPremium, setIsPremium] = useState(authStore.isPremium());
  /** 오늘의 실전 표현 2개 — 날짜 시드로 결정적 선택(자정 지나면 갱신) */
  const todayExpressions = pickDaily(EXPRESSIONS, 1, 'expr-' + new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchWords().then(words => {
      setHeroWords(pickDaily(words, 5, new Date().toISOString().slice(0, 10)));
      /* 사전 화면의 최신순(SORT_TABS[1])과 동일한 순서 */
      setNewSlangWords(sortWords(words.filter(w => w.category === 'new-slang'), 1));
    });
  }, []);

  useFocusEffect(useCallback(() => {
    fetchPosts().then(data => setCommunityPosts(data.slice(0, 3)));
    fetchUnreadNotificationCount().then(count => setHasUnreadNotifications(count > 0));
    setIsPremium(authStore.isPremium());
  }, []));

  useEffect(() => {
    const unsub = authStore.subscribe(() => setIsPremium(authStore.isPremium()));
    return () => { unsub(); };
  }, []);

  /* 히어로 캐러셀 자동 재생 — 오른쪽에서 왼쪽으로 넘어가도록 다음 인덱스로 스크롤.
   * 사용자가 직접 스와이프하는 동안(heroPausedRef)에는 타이머가 끼어들지 않게 건너뜀. */
  useEffect(() => {
    if (heroWords.length === 0) return;
    const timer = setInterval(() => {
      if (heroPausedRef.current) return;
      setHeroIndex(prev => {
        const next = (prev + 1) % heroWords.length;
        // 웹(react-native-web)에서는 animated:true인 scrollTo가 실제로 스크롤을
        // 이동시키지 않는 버그가 있어(로컬 검증 완료) 웹만 즉시 이동으로 처리.
        heroScrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: Platform.OS !== 'web' });
        return next;
      });
    }, HERO_AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [heroWords.length]);

  const handleHeroScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setHeroIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
    heroPausedRef.current = false;
  };

  /* 커뮤니티 탐색은 게스트에게도 열어두고, 작성·반응 등은 각 행동 화면에서 로그인으로 안내한다. */
  const openCommunity = (path: string) => {
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── Figma: Navigation/TopAppBar/Home (375×44, bg #52514e) — 실제 SokDak 워드마크 SVG */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.logoBtn} onPress={() => router.push('/tabs')} activeOpacity={0.8}>
          <SokDakLogo width={83} />
        </TouchableOpacity>
        <View style={styles.topBarIcons}>
          {/* 다크 헤더 위라 기본 gray-600 대신 밝은색으로 대비 확보 */}
          <AppIcon icon={Search} size={22} color={Colors.navBarIconActive} style={styles.iconBtn} onPress={() => router.push('/search')} />
          <View style={styles.iconBtn}>
            <AppIcon icon={Bell} size={22} color={Colors.navBarIconActive} onPress={() => router.push('/notifications')} />
            {hasUnreadNotifications && <View style={styles.notifDot} />}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── 홈 학습 히어로 ── 오늘의 학습 목적을 먼저 제시하고 사전 탐색으로 연결 */}
        <View style={styles.learningHero}>
          <View style={styles.learningHeroCopy}>
            <Text style={styles.learningHeroEyebrow}>{t('todayExpressionTitle')}</Text>
            <Text style={styles.learningHeroTitle}>{t('todayExpressionSub')}</Text>
            <TouchableOpacity style={styles.learningHeroCta} onPress={() => router.push('/tabs/dictionary')} activeOpacity={0.85}>
              <Text style={styles.learningHeroCtaText}>{t('dictionary')}</Text>
              <AppIcon icon={ChevronRight} size={16} color={Colors.navBarIconActive} />
            </TouchableOpacity>
          </View>
          <Image source={JJAEKI_WAVE} style={styles.learningHeroCharacter} resizeMode="contain" accessible={false} />
        </View>

        {/* ── 히어로 캐러셀 ── Figma: Card/Recommend2 (375×250) */}
        <View>
          <ScrollView
            ref={heroScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={() => { heroPausedRef.current = true; }}
            onMomentumScrollEnd={handleHeroScrollEnd}
          >
            {heroWords.map(word => {
              const category = getCategoryBySlug(word.category);
              return (
                <TouchableOpacity
                  key={word.id}
                  style={[styles.heroCard, { backgroundColor: category?.colorBg ?? Colors.navBar }]}
                  onPress={() => router.push(`/tabs/dictionary/${word.id}`)}
                  activeOpacity={0.9}
                >
                  {word.thumbnailUrl && (
                    <Image source={{ uri: word.thumbnailUrl }} style={styles.heroThumbnail} resizeMode="cover" />
                  )}
                  <View style={styles.heroScrim} />
                  <View style={styles.heroContent}>
                    {category && (
                      <View style={[styles.heroBadge, { backgroundColor: category.colorBg }]}>
                        <Text style={[styles.heroBadgeText, { color: category.colorFg }]} numberOfLines={1}>{getCategoryName(category, language)}</Text>
                      </View>
                    )}
                    <Text style={styles.heroWord}>{word.word}</Text>
                    <Text style={styles.heroDesc} numberOfLines={2}>{word.shortDesc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.dotsRow}>
            {heroWords.map((_, i) => (
              <View key={i} style={[styles.dot, i === heroIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── 오늘의 실전 표현 ── 리텐션 훅: 3분 학습, 매일 갱신 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('todayExpressionTitle')}</Text>
            <Text style={styles.sectionSub}>{t('todayExpressionSub')}</Text>
          </View>
          <View style={styles.exprCard}>
            {todayExpressions.map((expr, i) => (
              <View key={i} style={[styles.exprRow, i > 0 && styles.exprRowBorder]}>
                <View style={styles.exprSituationBadge}>
                  <Text style={styles.exprSituationText}>{t(SITUATION_LABEL_KEY[expr.situation])}</Text>
                </View>
                <Text style={styles.exprKo}>{expr.ko}</Text>
                <Text style={styles.exprEn}>{expr.en}</Text>
              </View>
            ))}
            {!isPremium && (
              <TouchableOpacity
                style={styles.exprPremiumTeaser}
                onPress={() => router.push('/tabs/mypage/premium')}
                activeOpacity={0.8}
              >
                <AppIcon icon={Crown} size={14} color={Colors.premium} />
                <Text style={styles.exprPremiumTeaserText}>{t('dictionaryPremiumBannerText')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {/* ── 새로운 신조어 ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('newSlangSection')}</Text>
            <View style={styles.sectionSubRow}>
              <Text style={styles.sectionSub}>{t('newSlangSub')}</Text>
              <TouchableOpacity
                style={styles.moreLink}
                onPress={() => router.push({ pathname: '/tabs/dictionary', params: { sort: 'recent' } })}
              >
                <Text style={styles.moreLinkText}>{t('moreLink')}</Text>
                <AppIcon icon={ChevronRight} size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wordCardRow}
          >
            {newSlangWords.map(word => (
              <TouchableOpacity
                key={word.id}
                style={styles.wordCard}
                onPress={() => router.push(`/tabs/dictionary/${word.id}`)}
                activeOpacity={0.85}
              >
                {word.thumbnailUrl && (
                  <>
                    <Image source={{ uri: word.thumbnailUrl }} style={styles.wordCardThumbnail} resizeMode="cover" />
                    <View style={styles.wordCardScrim} />
                  </>
                )}
                <Text style={[styles.wordCardTitle, word.thumbnailUrl && styles.wordCardTitleOnImage]}>{word.word}</Text>
                <Text style={[styles.wordCardDesc, word.thumbnailUrl && styles.wordCardDescOnImage]} numberOfLines={2}>{word.shortDesc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionDivider} />

        {/* ── 커뮤니티 ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('community')}</Text>
            <View style={styles.sectionSubRow}>
              <Text style={styles.sectionSub}>{t('communitySub')}</Text>
              <TouchableOpacity style={styles.moreLink} onPress={() => openCommunity('/tabs/community')}>
                <Text style={styles.moreLinkText}>{t('moreLink')}</Text>
                <AppIcon icon={ChevronRight} size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {communityPosts.length === 0 && (
            <Text style={styles.communityEmpty}>{t('noPostsYet')}</Text>
          )}
          {communityPosts.map((post, i) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.postItem, i > 0 && styles.postItemBorder]}
              onPress={() => openCommunity(`/tabs/community/${post.id}`)}
              activeOpacity={0.75}
            >
              <View style={styles.postItemLeft}>
                <View style={[styles.postBadge, { backgroundColor: BOARD_COLORS[post.board].bg }]}>
                  <Text style={[styles.postBadgeText, { color: BOARD_COLORS[post.board].fg }]}>
                    {getBoardLabel(post.board, language)}
                  </Text>
                </View>
                <Text style={styles.postTitle} numberOfLines={1}>{post.title}</Text>
                <View style={styles.postMetaRow}>
                  <Text style={styles.postAuthor}>{post.author.name}</Text>
                  <Text style={styles.postDate}>{post.createdAt}</Text>
                  <View style={styles.postStats}>
                    <IconStat icon={Eye} value={post.views} textStyle={styles.postStat} />
                    <IconStat icon={Heart} value={post.likes} textStyle={styles.postStat} />
                    <IconStat icon={MessageCircle} value={post.commentCount} textStyle={styles.postStat} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* TopAppBar */
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 6,
    backgroundColor: Colors.navBar,
  },
  logoBtn: { height: 44, justifyContent: 'center' },
  topBarIcons: { flexDirection: 'row' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  /* Figma: data-badge="on" — 벨 아이콘 우측 상단 알림 점 */
  notifDot: {
    position: 'absolute', top: 10, right: 12,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.error,
  },

  content: { paddingBottom: 24 },

  learningHero: {
    minHeight: 148, marginHorizontal: 16, marginTop: 16, padding: 18,
    borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.navBar,
    flexDirection: 'row', alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 8, elevation: 4,
  },
  learningHeroCopy: { flex: 1, zIndex: 1, paddingRight: 8 },
  learningHeroEyebrow: { fontSize: 11, fontWeight: '700', color: Colors.point1, marginBottom: 6 },
  learningHeroTitle: { fontSize: 21, lineHeight: 30, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  learningHeroCta: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 14 },
  learningHeroCtaText: { fontSize: 13, fontWeight: '700', color: Colors.navBarIconActive },
  learningHeroCharacter: { width: 118, height: 118, marginRight: -18, marginBottom: -12 },

  /* 히어로 캐러셀 */
  heroCard: {
    width: SCREEN_WIDTH, height: 250,
    paddingHorizontal: 24, paddingVertical: 10,
    justifyContent: 'flex-end',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    overflow: 'hidden',
  },
  heroScrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.pageBackground,
    opacity: 0.55,
  },
  heroThumbnail: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  /* 태그→제목→소제목 간격을 오늘의 실전 표현 카드(exprRow)와 동일하게: gap 6 + 제목에 marginTop 2 */
  heroContent: { gap: 6, marginBottom: 20 }, // heroCard는 justifyContent:'flex-end'라 marginBottom만큼 문구가 위로 올라감
  heroBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '600', fontFamily: 'NotoSerifKR_600SemiBold' },
  heroWord: {
    fontSize: 24, lineHeight: 36, color: '#000',
    fontFamily: 'NotoSerifKR_600SemiBold', marginTop: 2,
  },
  heroDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 18, fontFamily: undefined, opacity: 0.9 },

  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, paddingVertical: 12,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(113,113,122,0.3)',
    borderWidth: 0.5, borderColor: Colors.border,
  },
  dotActive: { width: 14, backgroundColor: 'rgba(38,43,49,0.7)' },

  /* 섹션 공통 */
  section: { paddingHorizontal: 24, marginTop: 16, gap: 16 },
  sectionDivider: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 24, marginTop: 16 },
  /* 대제목→소제목 간격도 exprRow의 제목→소제목 간격(6)과 동일하게 */
  sectionHeader: { gap: 6 },
  sectionTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  sectionSubRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined, flexShrink: 1 },
  moreLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreLinkText: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },

  /* 오늘의 실전 표현 카드 */
  exprCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  exprRow: { padding: 16, gap: 6 },
  exprRowBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  /* 사전 화면 단어 태그(wordBadge)와 동일 크기 */
  exprSituationBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12, backgroundColor: Colors.point1 + '15',
  },
  exprSituationText: { fontSize: 10, fontWeight: '700', color: Colors.point1 },
  exprKo: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, marginTop: 2 },
  exprEn: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  exprPremiumTeaser: {
    flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center',
    paddingVertical: 12, backgroundColor: Colors.premium + '12',
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
  exprPremiumTeaserText: { fontSize: 12, fontWeight: '600', color: Colors.premium },

  /* 새로운 신조어 카드 */
  wordCardRow: { gap: 16, paddingRight: 24 },
  wordCard: {
    width: 256, height: 144,
    backgroundColor: Colors.pageBackground,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    padding: 16, justifyContent: 'flex-end', gap: 8,
    shadowColor: '#8B8B8B', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 2.5, elevation: 3,
    overflow: 'hidden',
  },
  wordCardThumbnail: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  wordCardScrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  wordCardTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  wordCardTitleOnImage: { color: '#fff' },
  wordCardDesc: { fontSize: 12, color: Colors.textTertiary, lineHeight: 16, fontFamily: undefined },
  wordCardDescOnImage: { color: 'rgba(255,255,255,0.85)' },

  /* 커뮤니티 리스트 */
  communityEmpty: { fontSize: 13, color: Colors.textTertiary, paddingVertical: 24, textAlign: 'center' },
  postItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, gap: 12 },
  postItemBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  postItemLeft: { flex: 1, gap: 8 },
  /* 사전 화면 단어 태그(wordBadge)와 동일 크기 */
  postBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  postBadgeText: { fontSize: 10, fontFamily: 'NotoSerifKR_600SemiBold' },
  postTitle: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, lineHeight: 18 },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  postAuthor: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  postDate: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  postStats: { flexDirection: 'row', gap: 8 },
  postStat: { fontSize: 12, color: Colors.textTertiary },
});
