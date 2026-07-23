import {
  StyleSheet, View, SafeAreaView, ScrollView,
  TouchableOpacity,
  type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState } from 'react';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MOCK_WORDS } from '../../constants/mockWords';
import { MOCK_POSTS, BOARD_COLORS } from '../../constants/mockPosts';
import { getCategoryBySlug } from '../../constants/categories';
import { SCREEN_WIDTH } from '../../constants/layout';
import { SokDakLogo } from '@/components/icons/SokDakLogo';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { Search, Bell, Eye, Heart, MessageCircle } from 'lucide-react-native';

/** Figma: Card/Recommend2 — 좋아요 상위 3개 단어로 구성된 캐러셀 */
const HERO_WORDS = [...MOCK_WORDS].sort((a, b) => b.likes - a.likes).slice(0, 3);
/** Figma: 새로운 신조어 섹션 — new-slang 카테고리 단어 미리보기 */
const NEW_SLANG_WORDS = MOCK_WORDS.filter(w => w.category === 'new-slang');
/** Figma: 커뮤니티(Recommended Section) — 게시글 미리보기 */
const COMMUNITY_POSTS = MOCK_POSTS.slice(0, 3);

export default function HomeScreen() {
  const [heroIndex, setHeroIndex] = useState(0);

  const handleHeroScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setHeroIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
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
          <AppIcon icon={Bell} size={22} color={Colors.navBarIconActive} style={styles.iconBtn} onPress={() => {}} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── 히어로 캐러셀 ── Figma: Card/Recommend2 (375×250) */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
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
                      <Text style={[styles.heroBadge, { color: category.colorFg }]}>{category.name}</Text>
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
            <Text style={styles.sectionTitle}>새로운 신조어</Text>
            <View style={styles.sectionSubRow}>
              <Text style={styles.sectionSub}>새롭게 등장한 신조어를 확인해보세요</Text>
              <TouchableOpacity style={styles.moreLink} onPress={() => router.push('/tabs/dictionary')}>
                <Text style={styles.moreLinkText}>더보기</Text>
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
            <Text style={styles.sectionTitle}>커뮤니티</Text>
            <View style={styles.sectionSubRow}>
              <Text style={styles.sectionSub}>새로운 게시글을 확인하세요</Text>
              <TouchableOpacity style={styles.moreLink} onPress={() => router.push('/tabs/community')}>
                <Text style={styles.moreLinkText}>더보기</Text>
                <Text style={styles.moreLinkArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {COMMUNITY_POSTS.map((post, i) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.postItem, i > 0 && styles.postItemBorder]}
              onPress={() => router.push(`/tabs/community/${post.id}`)}
              activeOpacity={0.75}
            >
              <View style={styles.postItemLeft}>
                <View style={[styles.postBadge, { backgroundColor: BOARD_COLORS[post.board].bg }]}>
                  <Text style={[styles.postBadgeText, { color: BOARD_COLORS[post.board].fg }]}>
                    {post.board}
                  </Text>
                </View>
                <Text style={styles.postTitle} numberOfLines={1}>{post.title}</Text>
                <View style={styles.postMetaRow}>
                  <Text style={styles.postAuthor}>{post.author.name}</Text>
                  <Text style={styles.postDate}>{post.createdAt}</Text>
                  <View style={styles.postStats}>
                    <IconStat icon={Eye} value={post.views} textStyle={styles.postStat} />
                    <IconStat icon={Heart} value={post.likes} textStyle={styles.postStat} />
                    <IconStat icon={MessageCircle} value={post.comments.length} textStyle={styles.postStat} />
                  </View>
                </View>
              </View>
              <View style={styles.postThumb} />
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
  iconGlyph: { fontSize: 18 },

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
  heroContent: { gap: 24 },
  heroBadge: { fontSize: 10, fontWeight: '600' },
  heroWord: {
    fontSize: 26, fontWeight: '700', color: '#000',
    marginTop: 8,
  },
  heroDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 18, fontFamily: undefined, marginTop: 8 },

  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, paddingVertical: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 13, backgroundColor: 'rgba(38,43,49,0.7)' },

  /* 섹션 공통 */
  section: { paddingHorizontal: 24, marginTop: 16, gap: 16 },
  sectionHeader: { gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  sectionSubRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined, flexShrink: 1 },
  moreLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreLinkText: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  moreLinkArrow: { fontSize: 14, color: Colors.textSecondary, fontFamily: undefined },

  /* 새로운 신조어 카드 */
  wordCardRow: { gap: 16, paddingRight: 24 },
  wordCard: {
    width: 255, height: 150,
    backgroundColor: Colors.pageBackground,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    padding: 16, justifyContent: 'flex-end', gap: 8,
    shadowColor: '#8B8B8B', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 2.5, elevation: 3,
  },
  wordCardTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  wordCardDesc: { fontSize: 12, color: Colors.textTertiary, lineHeight: 16, fontFamily: undefined },

  /* 커뮤니티 리스트 */
  postItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, gap: 12 },
  postItemBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  postItemLeft: { flex: 1, gap: 8 },
  postBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  postBadgeText: { fontSize: 12, fontWeight: '600' },
  postTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 18 },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  postAuthor: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  postDate: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  postStats: { flexDirection: 'row', gap: 8 },
  postStat: { fontSize: 12, color: Colors.textTertiary },
  postThumb: {
    width: 72, height: 72, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.pageBackground,
  },
});
