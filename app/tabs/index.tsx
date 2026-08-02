import {
  StyleSheet, View, SafeAreaView, ScrollView,
  TouchableOpacity, Platform,
  type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MOCK_WORDS } from '../../constants/mockWords';
import { BOARD_COLORS } from '../../constants/mockPosts';
import { fetchPosts, type CommunityPostSummary } from '../../constants/community';
import { getCategoryBySlug, getCategoryName } from '../../constants/categories';
import { getBoardLabel } from '../../constants/mockPosts';
import { SCREEN_WIDTH } from '../../constants/layout';
import { languageStore, useLanguage } from '../../constants/languageStore';
import { SokDakLogo } from '@/components/icons/SokDakLogo';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { Search, Bell, Eye, Heart, MessageCircle } from 'lucide-react-native';

/** Figma: Card/Recommend2 — 좋아요 상위 3개 단어로 구성된 캐러셀 */
const HERO_WORDS = [...MOCK_WORDS].sort((a, b) => b.likes - a.likes).slice(0, 3);
/** Figma: 새로운 신조어 섹션 — new-slang 카테고리 단어 미리보기 */
const NEW_SLANG_WORDS = MOCK_WORDS.filter(w => w.category === 'new-slang');

/** 히어로 캐러셀 자동 재생 간격(ms) */
const HERO_AUTOPLAY_INTERVAL = 4000;

export default function HomeScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [heroIndex, setHeroIndex] = useState(0);
  const [communityPosts, setCommunityPosts] = useState<CommunityPostSummary[]>([]);
  const heroScrollRef = useRef<ScrollView>(null);
  const heroPausedRef = useRef(false);

  useFocusEffect(useCallback(() => {
    fetchPosts().then(data => setCommunityPosts(data.slice(0, 3)));
  }, []));

  /* 히어로 캐러셀 자동 재생 — 오른쪽에서 왼쪽으로 넘어가도록 다음 인덱스로 스크롤.
   * 사용자가 직접 스와이프하는 동안(heroPausedRef)에는 타이머가 끼어들지 않게 건너뜀. */
  useEffect(() => {
    const timer = setInterval(() => {
      if (heroPausedRef.current) return;
      setHeroIndex(prev => {
        const next = (prev + 1) % HERO_WORDS.length;
        // 웹(react-native-web)에서는 animated:true인 scrollTo가 실제로 스크롤을
        // 이동시키지 않는 버그가 있어(로컬 검증 완료) 웹만 즉시 이동으로 처리.
        heroScrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: Platform.OS !== 'web' });
        return next;
      });
    }, HERO_AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const handleHeroScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setHeroIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
    heroPausedRef.current = false;
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
            <View style={styles.notifDot} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
            {HERO_WORDS.map(word => {
              const category = getCategoryBySlug(word.category);
              return (
                <TouchableOpacity
                  key={word.id}
                  style={[styles.heroCard, { backgroundColor: category?.colorBg ?? Colors.navBar }]}
                  onPress={() => router.push(`/tabs/dictionary/${word.id}`)}
                  activeOpacity={0.9}
                >
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
            {HERO_WORDS.map((_, i) => (
              <View key={i} style={[styles.dot, i === heroIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

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
                <Text style={styles.moreLinkArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wordCardRow}
          >
            {NEW_SLANG_WORDS.map(word => (
              <TouchableOpacity
                key={word.id}
                style={styles.wordCard}
                onPress={() => router.push(`/tabs/dictionary/${word.id}`)}
                activeOpacity={0.85}
              >
                <Text style={styles.wordCardTitle}>{word.word}</Text>
                <Text style={styles.wordCardDesc} numberOfLines={2}>{word.shortDesc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── 커뮤니티 ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('community')}</Text>
            <View style={styles.sectionSubRow}>
              <Text style={styles.sectionSub}>{t('communitySub')}</Text>
              <TouchableOpacity style={styles.moreLink} onPress={() => router.push('/tabs/community')}>
                <Text style={styles.moreLinkText}>{t('moreLink')}</Text>
                <Text style={styles.moreLinkArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {communityPosts.map((post, i) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.postItem, i > 0 && styles.postItemBorder]}
              onPress={() => router.push(`/tabs/community/${post.id}`)}
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
  heroContent: { gap: 8 },
  heroBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12, marginBottom: 8,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '600', fontFamily: 'NotoSerifKR_600SemiBold' },
  heroWord: {
    fontSize: 24, lineHeight: 36, color: '#000',
    fontFamily: 'NotoSerifKR_600SemiBold',
  },
  heroDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 18, fontFamily: undefined, opacity: 0.9, marginTop: 8 },

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
  sectionHeader: { gap: 8 },
  sectionTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  sectionSubRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined, flexShrink: 1 },
  moreLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreLinkText: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  moreLinkArrow: { fontSize: 14, color: Colors.textSecondary, fontFamily: undefined },

  /* 새로운 신조어 카드 */
  wordCardRow: { gap: 16, paddingRight: 24 },
  wordCard: {
    width: 256, height: 144,
    backgroundColor: Colors.pageBackground,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    padding: 16, justifyContent: 'flex-end', gap: 8,
    shadowColor: '#8B8B8B', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 2.5, elevation: 3,
  },
  wordCardTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  wordCardDesc: { fontSize: 12, color: Colors.textTertiary, lineHeight: 16, fontFamily: undefined },

  /* 커뮤니티 리스트 */
  postItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, gap: 12 },
  postItemBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  postItemLeft: { flex: 1, gap: 8 },
  postBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  postBadgeText: { fontSize: 12, fontFamily: 'NotoSerifKR_600SemiBold' },
  postTitle: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, lineHeight: 18 },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  postAuthor: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  postDate: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  postStats: { flexDirection: 'row', gap: 8 },
  postStat: { fontSize: 12, color: Colors.textTertiary },
});
