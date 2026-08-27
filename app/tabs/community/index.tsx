import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { router, useFocusEffect } from 'expo-router';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Colors } from '../../../constants/Colors';
import { BOARD_COLORS, getBoardLabel } from '../../../constants/mockPosts';
import { COMMUNITY_POST_PAGE_SIZE, fetchPostsPage, type CommunityPostSummary } from '../../../constants/community';
import { authStore } from '../../../constants/authStore';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { TopAppBar } from '@/components/navigation/TopAppBar';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { CharacterEmptyState } from '@/components/CharacterEmptyState';
import { CommunityPostCard } from '@/src/features/community/components/CommunityPostCard';
import { CommunityFilterBar, type CommunityBoardTab } from '@/src/features/community/components/CommunityFilterBar';
import { CommunityGuestCallout } from '@/src/features/community/components/CommunityGuestCallout';
import { Eye, Heart, MessageCircle, Pencil } from 'lucide-react-native';

const JJAEKI_READING = require('../../../assets/characters/transparent/jjaeki-reading.png');

const BOARD_TABS: CommunityBoardTab[] = ['전체', '궁금해요', 'Q&A', '질문하기'];

/**
 * 화제의 질문 노출 정책 — 백엔드 featured 기준이 없으므로 첫 페이지 안에서
 * 조회수 상위 2개만 뽑고, 아래 목록에서는 같은 글을 빼서 중복 노출하지 않는다.
 * - 첫 페이지로 한정: 페이지가 추가 로드될 때마다 화제 글이 바뀌면 스크롤 중 목록이 튄다.
 * - 게시글이 5개 미만이면 숨김: 전부 화제 글로 올라가 아래 목록이 비어 보이는 것을 막는다.
 */
export function selectFeaturedPosts(posts: CommunityPostSummary[]): CommunityPostSummary[] {
  if (posts.length < 5) return [];
  return [...posts.slice(0, COMMUNITY_POST_PAGE_SIZE)].sort((a, b) => b.views - a.views).slice(0, 2);
}

export default function CommunityScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [activeTab, setActiveTab] = useState<CommunityBoardTab>('전체');
  const [posts, setPosts] = useState<CommunityPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [loggedIn, setLoggedIn] = useState(authStore.isLoggedIn());

  /* 마이페이지 패턴 — 재진입 시점 갱신 + 세션 변화 구독 이중 동기화 */
  useFocusEffect(useCallback(() => { setLoggedIn(authStore.isLoggedIn()); }, []));
  useEffect(() => {
    const unsub = authStore.subscribe(() => setLoggedIn(authStore.isLoggedIn()));
    return () => unsub();
  }, []);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    setLoading(true);
    const board = activeTab === '전체' ? undefined : activeTab;
    fetchPostsPage({ board, limit: COMMUNITY_POST_PAGE_SIZE }).then(page => {
      if (!cancelled) {
        setPosts(page.posts);
        setHasMore(page.hasMore);
        setNextOffset(page.nextOffset);
        setLoadFailed(page.failed === true);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [activeTab, retryKey]));

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

  const featured = useMemo(
    () => activeTab === '전체' && !loading ? selectFeaturedPosts(posts) : [],
    [activeTab, loading, posts],
  );
  /* 화제의 질문으로 올라간 글은 아래 목록에서 제외 — 같은 화면에 같은 글이 두 번 보이지 않게 */
  const listPosts = useMemo(() => {
    const featuredIds = new Set(featured.map(post => post.id));
    return featuredIds.size === 0 ? posts : posts.filter(post => !featuredIds.has(post.id));
  }, [featured, posts]);
  const goToWrite = () => router.push(authStore.isLoggedIn() ? '/tabs/community/write' : '/auth/login');

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar variant="title" title={t('community')} />

      <FlatList
        testID="community-post-list"
        data={listPosts}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* ── 게스트 로그인 유도 — 화면당 1회, 목록 최상단에만 (카드마다 반복 금지) */}
            {!loggedIn && (
              <CommunityGuestCallout
                language={language}
                onPressLogin={() => router.push('/auth/login')}
                testID="community-guest-callout"
              />
            )}

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
            <CommunityFilterBar
              tabs={BOARD_TABS}
              active={activeTab}
              onSelect={setActiveTab}
              language={language}
            />
          </>
        }
        renderItem={({ item }) => (
          /* ── List/Item/Post (Figma node 730:4885) ── */
          <CommunityPostCard
            post={item}
            language={language}
            onPress={() => router.push(`/tabs/community/${item.id}`)}
          />
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
          ) : loadFailed ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.loadFailedText}>{t('postsLoadFailed')}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => { setLoading(true); setRetryKey(k => k + 1); }}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Text style={styles.retryBtnText}>{t('retryLabel')}</Text>
              </TouchableOpacity>
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
        accessibilityRole="button"
        accessibilityLabel={t('writeTitle')}
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

  /* 게시판 뱃지 — 사전 화면 단어 태그(wordBadge)와 동일 크기 (화제의 질문 카드용) */
  boardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12,
  },
  boardBadgeText: { fontSize: 10, fontFamily: 'NotoSerifKR_600SemiBold' },
  metaText: { fontSize: 11, color: Colors.textTertiary },

  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 24 },
  loadFailedText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    marginTop: 12, alignSelf: 'center',
    paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 10, backgroundColor: Colors.navBar,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: Colors.navBarIconActive },
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
