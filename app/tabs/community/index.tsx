import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { router, useFocusEffect } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import { Colors } from '../../../constants/Colors';
import { BOARD_COLORS, getBoardLabel, type PostBoard } from '../../../constants/mockPosts';
import { fetchPosts, type CommunityPostSummary } from '../../../constants/community';
import { authStore } from '../../../constants/authStore';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { fetchUnreadNotificationCount } from '../../../constants/notifications';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { CharacterEmptyState } from '@/components/CharacterEmptyState';
import { Eye, Heart, MessageCircle, Pencil, Bell } from 'lucide-react-native';

const JJAEKI_READING = require('../../../assets/characters/poses/jjaeki-reading.png');

type BoardTab = '전체' | PostBoard;
const BOARD_TABS: BoardTab[] = ['전체', '궁금해요', 'Q&A', '질문하기'];

export default function CommunityScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [activeTab, setActiveTab] = useState<BoardTab>('전체');
  const [posts, setPosts] = useState<CommunityPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetchPosts().then(data => {
      if (!cancelled) { setPosts(data); setLoading(false); }
    });
    fetchUnreadNotificationCount().then(count => setHasUnreadNotifications(count > 0));
    return () => { cancelled = true; };
  }, []));

  /* 화제의 게시글: 조회수 상위 3개 (별도 "featured" 플래그 없이 파생) */
  const featured = useMemo(() => [...posts].sort((a, b) => b.views - a.views).slice(0, 3), [posts]);
  const filtered  = useMemo(
    () => activeTab === '전체' ? posts : posts.filter(p => p.board === activeTab),
    [activeTab, posts],
  );
  const goToWrite = () => router.push(authStore.isLoggedIn() ? '/tabs/community/write' : '/auth/login');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar – Figma: Navigation/TopAppBar/Default/Default (375×44, bg #52514e) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{t('community')}</Text>
        <View style={styles.topBarBell}>
          <AppIcon icon={Bell} size={22} color={Colors.navBarIconActive} onPress={() => router.push('/notifications')} />
          {hasUnreadNotifications && <View style={styles.notifDot} />}
        </View>
      </View>

      <FlatList
        data={filtered}
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

  /* Figma: Navigation/TopAppBar/Community (375×44, bg #52514e) */
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navBar,
  },
  topBarTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  topBarBell: {
    position: 'absolute', right: 0, top: 0,
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  /* Figma: data-badge="on" — 벨 아이콘 우측 상단 알림 점 */
  notifDot: {
    position: 'absolute', top: 10, right: 12,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.error,
  },

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
