import {
  StyleSheet, View, SafeAreaView, FlatList, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { MOCK_POSTS, BOARD_COLORS, type Post } from '../../../constants/mockPosts';
import { authStore } from '../../../constants/authStore';

type ActivityTab = 'written' | 'commented' | 'liked';

/** Figma: Selection/Tab/02 (722:3448) — state=게시물/댓글/좋아요 */
const TABS: { key: ActivityTab; label: string }[] = [
  { key: 'written',   label: '게시물' },
  { key: 'commented', label: '댓글' },
  { key: 'liked',     label: '좋아요' },
];

/** Figma: 229:3620~3679 — 내 활동 게시물 (쓴 글 / 댓글 단 글 / 좋아요 한 글) */
export default function MyPostsScreen() {
  const [tab, setTab] = useState<ActivityTab>('written');
  const [likedIds, setLikedIds] = useState<string[]>(authStore.getLikedPostIds());

  useFocusEffect(
    useCallback(() => {
      setLikedIds(authStore.getLikedPostIds());
    }, []),
  );

  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(() => setLikedIds(authStore.getLikedPostIds()));
    return () => { unsub(); };
  }, []);

  const likedPosts = likedIds
    .map(id => MOCK_POSTS.find(p => p.id === id))
    .filter((p): p is Post => !!p);

  /* 작성/댓글 이력은 아직 서버 연동 전이라 추적 데이터가 없음 — 정직하게 빈 상태로 표시 */
  const data = tab === 'liked' ? likedPosts : [];

  const emptyContent = {
    written:   { emoji: '📝', text: '아직 작성한 글이 없어요', ctaLabel: '글쓰기', ctaRoute: '/tabs/community/write' as const },
    commented: { emoji: '💬', text: '아직 댓글을 단 글이 없어요', ctaLabel: '커뮤니티 둘러보기', ctaRoute: '/tabs/community' as const },
    liked:     { emoji: '❤️', text: '아직 좋아요 한 글이 없어요', ctaLabel: '커뮤니티 둘러보기', ctaRoute: '/tabs/community' as const },
  }[tab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>내 활동</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postItem}
            onPress={() => router.push(`/tabs/community/${item.id}`)}
            activeOpacity={0.75}
          >
            <View style={styles.postTopRow}>
              <View style={[styles.boardBadge, { backgroundColor: BOARD_COLORS[item.board].bg }]}>
                <Text style={[styles.boardBadgeText, { color: BOARD_COLORS[item.board].fg }]}>
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
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>{emptyContent.emoji}</Text>
            <Text style={styles.emptyText}>{emptyContent.text}</Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push(emptyContent.ctaRoute)}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>{emptyContent.ctaLabel}</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={data.length === 0 ? { flex: 1 } : { paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.navBar },
  tabText: { fontSize: 13, color: Colors.textTertiary },
  tabTextActive: { color: Colors.navBar, fontWeight: '700' },

  postItem: { paddingHorizontal: 20, paddingVertical: 12, gap: 4 },
  postTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  boardBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  boardBadgeText: { fontSize: 11, fontWeight: '600' },
  postDate: { fontSize: 11, color: Colors.textTertiary, marginLeft: 'auto' },
  postTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 20 },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  postAuthor: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  postStats: { flexDirection: 'row', gap: 10 },
  metaText: { fontSize: 11, color: Colors.textTertiary },

  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 20 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 14, color: Colors.textTertiary },
  emptyCta: {
    marginTop: 8, paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 20, backgroundColor: Colors.navBar,
  },
  emptyCtaText: { fontSize: 13, fontWeight: '600', color: Colors.navBarIconActive },
});
