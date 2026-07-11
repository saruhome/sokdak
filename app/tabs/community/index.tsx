import {
  StyleSheet, Text, View, SafeAreaView,
  ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import { Colors } from '../../../constants/Colors';
import { MOCK_POSTS, BOARD_COLORS, type PostBoard } from '../../../constants/mockPosts';

type BoardTab = '전체' | PostBoard;
const BOARD_TABS: BoardTab[] = ['전체', '궁금해요', 'Q&A', '질문하기'];

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<BoardTab>('전체');

  const featured = useMemo(() => MOCK_POSTS.filter(p => p.isFeatured), []);
  const filtered  = useMemo(
    () => activeTab === '전체' ? MOCK_POSTS : MOCK_POSTS.filter(p => p.board === activeTab),
    [activeTab],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar – Figma: Navigation/TopAppBar/Default/Default (375×44) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>커뮤니티</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* ── 화제의 게시글 – Figma: Card/Post/Preview 220×144 가로 스크롤 */}
            <View style={styles.featuredSection}>
              <Text style={styles.sectionTitle}>화제의 게시글</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featured.map(post => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.featuredCard}
                    onPress={() => router.push(`/tabs/community/${post.id}`)}
                    activeOpacity={0.8}
                  >
                    {/* 게시판 색상 띠 */}
                    <View style={[styles.featuredCardTop, { backgroundColor: BOARD_COLORS[post.board] }]}>
                      <Text style={styles.featuredCardBoard}>{post.board}</Text>
                    </View>
                    <View style={styles.featuredCardBody}>
                      <Text style={styles.featuredCardTitle} numberOfLines={2}>
                        {post.title}
                      </Text>
                      <View style={styles.featuredCardMeta}>
                        <Text style={styles.metaText}>👁 {post.views}</Text>
                        <Text style={styles.metaText}>❤️ {post.likes}</Text>
                        <Text style={styles.metaText}>💬 {post.comments.length}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ── 상단메뉴 – Figma: state=Default/궁금해요/Q&A/질문하기 */}
            <View style={styles.boardTabs}>
              {BOARD_TABS.map(tab => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.boardTab,
                    activeTab === tab && {
                      borderBottomColor: tab === '전체' ? Colors.navBar : BOARD_COLORS[tab as PostBoard],
                      borderBottomWidth: 2,
                    },
                  ]}
                >
                  <Text style={[
                    styles.boardTabText,
                    activeTab === tab && {
                      color: tab === '전체' ? Colors.navBar : BOARD_COLORS[tab as PostBoard],
                      fontWeight: '700',
                    },
                  ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── 게시판 종류 뱃지 행 – Figma: Display/Community/게시판 종류 */}
            <View style={styles.boardBadgeRow}>
              {(['궁금해요', 'Q&A', '질문하기'] as PostBoard[]).map(b => (
                <TouchableOpacity key={b} onPress={() => setActiveTab(b)}>
                  <View style={[styles.boardBadge, { borderColor: BOARD_COLORS[b] }]}>
                    <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[b] }]}>{b}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          /* ── List/Item/Post (327×92) */
          <TouchableOpacity
            style={styles.postItem}
            onPress={() => router.push(`/tabs/community/${item.id}`)}
            activeOpacity={0.75}
          >
            <View style={styles.postItemInner}>
              <View style={styles.postTopRow}>
                <View style={[styles.boardBadge, { borderColor: BOARD_COLORS[item.board] }]}>
                  <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[item.board] }]}>
                    {item.board}
                  </Text>
                </View>
                <Text style={styles.postDate}>{item.createdAt}</Text>
              </View>
              <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.postMetaRow}>
                <Text style={styles.postAuthor}>{item.author.emoji} {item.author.name}</Text>
                <View style={styles.postStats}>
                  <Text style={styles.metaText}>👁 {item.views}</Text>
                  <Text style={styles.metaText}>❤️ {item.likes}</Text>
                  <Text style={styles.metaText}>💬 {item.comments.length}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>아직 게시글이 없어요</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* ── FAB 글쓰기 – Figma: Controls/Icon/write (50×50, 우하단) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/tabs/community/write')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>✏️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  /* Featured */
  featuredSection: { paddingLeft: 16, paddingTop: 14, paddingBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10, paddingRight: 16 },
  featuredCard: {
    width: 220, height: 144, backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    marginRight: 12, overflow: 'hidden',
  },
  featuredCardTop: { height: 36, justifyContent: 'center', paddingHorizontal: 12 },
  featuredCardBoard: { fontSize: 11, fontWeight: '700', color: '#fff' },
  featuredCardBody: { flex: 1, padding: 12, justifyContent: 'space-between' },
  featuredCardTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 19 },
  featuredCardMeta: { flexDirection: 'row', gap: 10 },

  /* 상단메뉴 탭 */
  boardTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginTop: 12,
  },
  boardTab: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  boardTabText: { fontSize: 13, color: Colors.textTertiary },

  /* 게시판 뱃지 행 */
  boardBadgeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  boardBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 14, borderWidth: 1,
  },
  boardBadgeText: { fontSize: 11, fontWeight: '600' },

  /* List/Item/Post (327×92) */
  postItem: { paddingHorizontal: 16, minHeight: 92, justifyContent: 'center' },
  postItemInner: { paddingVertical: 12, gap: 4 },
  postTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postDate: { fontSize: 11, color: Colors.textTertiary, marginLeft: 'auto' },
  postTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 20 },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  postAuthor: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  postStats: { flexDirection: 'row', gap: 10 },
  metaText: { fontSize: 11, color: Colors.textTertiary },

  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 16 },
  emptyWrap: { paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 14, color: Colors.textTertiary },

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
