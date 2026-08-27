import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { router, useFocusEffect } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import { Colors } from '../../../constants/Colors';
import { BOARD_COLORS, getBoardLabel, type PostBoard } from '../../../constants/mockPosts';
import { COMMUNITY_POST_PAGE_SIZE, fetchPostsPage, type CommunityPostSummary } from '../../../constants/community';
import { authStore } from '../../../constants/authStore';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { TopAppBar } from '@/components/navigation/TopAppBar';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { CharacterEmptyState } from '@/components/CharacterEmptyState';
import { Eye, Heart, MessageCircle, Pencil } from 'lucide-react-native';

const JJAEKI_READING = require('../../../assets/characters/transparent/jjaeki-reading.png');

type BoardTab = '전체' | PostBoard;
const BOARD_TABS: BoardTab[] = ['전체', '궁금해요', 'Q&A', '질문하기'];

export default function CommunityScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [activeTab, setActiveTab] = useState<BoardTab>('전체');
  const [posts, setPosts] = useState<CommunityPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    setLoading(true);
    const board = activeTab === '전체' ? undefined : activeTab;
    fetchPostsPage({ board, limit: COMMUNITY_POST_PAGE_SIZE }).then(page => {
      if (!cancelled) {
        setPosts(page.posts);
        setHasMore(page.hasMore);
        setNextOffset(page.nextOffset);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [activeTab]));

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const board = activeTab === '전체' ? undefined : activeTab;
    setLoadingMore(true);
    // 서버가 실제로 조회를 마친 행 기준 offset을 그대로 넘긴다 — 차단 필터로 줄어든
    // posts.length를 쓰면 이미 조회한 행을 다시 요청해 다음 페이지 일부를 건너뛰게 된다.
    fetchPostsPage({ board, offset: nextOffset, limit: COMMUNITY_POST_PAGE_SIZE }).then(page => {
      setPosts(current => {
        const knownIds = new Set(current.map(post => post.id));
        return [...current, ...page.posts.filter(post => !knownIds.has(post.id))];
      });
      setHasMore(page.hasMore);
      setNextOffset(page.nextOffset);
      setLoadingMore(false);
    });
  }, [activeTab, hasMore, loading, loadingMore, nextOffset]);

  /* 화제의 게시글: 조회수 상위 3개 (별도 "featured" 플래그 없이 파생) */
  const featured = useMemo(
    () => activeTab === '전체' ? [...posts].sort((a, b) => b.views - a.views).slice(0, 3) : [],
    [activeTab, posts],
  );
  const goToWrite = () => router.push(authStore.isLoggedIn() ? '/tabs/community/write' : '/auth/login');

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar variant="title" title={t('community')} />

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* ── 화제의 게시글 – Figma: Card/Post/Preview 220×144 가로 스크롤 */}
            {featured.length > 0 ? (
              <View style={styles.featuredSection}>
                <Text style={styles.sectionTitle}>{t('hotPosts')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {featured.map(post => (
                    <TouchableOpacity
                      key={post.id}
                      style={styles.featuredCard}
                      onPress={() => router.push(`/tabs/community/${post.id}`)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.boardBadge, { backgroundColor: BOARD_COLORS[post.board].bg }]}>
                        <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[post.board].fg }]}>
                          {getBoardLabel(post.board, language)}
                        </Text>
                      </View>
                      <View style={styles.featuredCardBody}>
                        <Text style={styles.featuredCardTitle} numberOfLines={1}>
                          {post.title}
                        </Text>
                        <Text style={styles.featuredCardSub}>{post.views} · {post.createdAt}</Text>
                        <View style={styles.featuredCardMeta}>
                          <IconStat icon={Eye} value={post.views} textStyle={styles.metaText} />
                          <IconStat icon={Heart} value={post.likes} textStyle={styles.metaText} />
                          <IconStat icon={MessageCircle} value={post.commentCount} textStyle={styles.metaText} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* ── 상단메뉴 – Figma: state=Default/궁금해요/Q&A/질문하기 */}
            <View style={styles.boardTabs}>
              {BOARD_TABS.map(tab => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.boardTab,
                    activeTab === tab && {
                      borderBottomColor: tab === '전체' ? Colors.navBar : BOARD_COLORS[tab as PostBoard].bg,
                      borderBottomWidth: 2,
                    },
                  ]}
                >
                  <Text style={[
                    styles.boardTabText,
                    activeTab === tab && {
                      color: tab === '전체' ? Colors.navBar : BOARD_COLORS[tab as PostBoard].bg,
                      fontWeight: '700',
                    },
                  ]}>
                    {tab === '전체' ? t('allLabel') : getBoardLabel(tab as PostBoard, language)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          /* ── List/Item/Post (Figma node 730:4885) ── */
          <TouchableOpacity
            style={styles.postItem}
            onPress={() => router.push(`/tabs/community/${item.id}`)}
            activeOpacity={0.75}
          >
            <View style={styles.postItemInner}>
              <View style={styles.postTopRow}>
                <View style={[styles.boardBadge, { backgroundColor: BOARD_COLORS[item.board].bg }]}>
                  <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[item.board].fg }]}>
                    {getBoardLabel(item.board, language)}
                  </Text>
                </View>
              </View>
              <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.postMetaRow}>
                <Text style={styles.postAuthor}>{item.author.emoji} {item.author.name}</Text>
                <Text style={styles.postDate}>{item.createdAt}</Text>
                <View style={styles.postStats}>
                  <IconStat icon={Eye} value={item.views} textStyle={styles.metaText} />
                  <IconStat icon={Heart} value={item.likes} textStyle={styles.metaText} />
                  <IconStat icon={MessageCircle} value={item.commentCount} textStyle={styles.metaText} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={loadingMore ? <View style={{ paddingVertical: 20, alignItems: 'center' }}><ActivityIndicator color={Colors.textTertiary} /></View> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator color={Colors.textTertiary} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <CharacterEmptyState
                image={JJAEKI_READING}
                title={t('noPostsYet')}
                ctaLabel={t('writeTitle')}
                onPressCta={goToWrite}
                testID="community-posts-empty-state"
              />
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* ── FAB 글쓰기 – Figma: Controls/Icon/write (50×50, 우하단) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={goToWrite}
        activeOpacity={0.85}
      >
        {/* 다크 FAB 위라 밝은색으로 대비 확보 */}
        <AppIcon icon={Pencil} size={22} color={Colors.navBarIconActive} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* Figma: data-badge="on" — 벨 아이콘 우측 상단 알림 점 */

  /* Featured */
  featuredSection: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4, gap: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  featuredCard: {
    width: 224, backgroundColor: Colors.surface,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginRight: 12, gap: 8,
  },
  featuredCardBody: { gap: 8 },
  featuredCardTitle: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, lineHeight: 20 },
  featuredCardSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  featuredCardMeta: { flexDirection: 'row', gap: 10 },

  /* 상단메뉴 탭 */
  boardTabs: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginTop: 12,
  },
  boardTab: {
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  boardTabText: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textTertiary },

  /* 게시판 뱃지 — 사전 화면 단어 태그(wordBadge)와 동일 크기 */
  boardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12,
  },
  boardBadgeText: { fontSize: 10, fontFamily: 'NotoSerifKR_600SemiBold' },

  /* List/Item/Post (Figma node 730:4885) */
  postItem: { paddingHorizontal: 24, minHeight: 92, justifyContent: 'center' },
  postItemInner: { paddingVertical: 12, gap: 8 },
  postTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postDate: { fontSize: 11, color: Colors.textTertiary },
  postTitle: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, lineHeight: 20 },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  postAuthor: { fontSize: 11, color: Colors.textSecondary },
  postStats: { flexDirection: 'row', gap: 10 },
  metaText: { fontSize: 11, color: Colors.textTertiary },

  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 24 },
  emptyWrap: { paddingVertical: 40, alignItems: 'center' },

  /* FAB */
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 6, elevation: 6,
  },
  fabIcon: { fontSize: 22 },
});
