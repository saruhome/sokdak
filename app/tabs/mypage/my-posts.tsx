import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { BOARD_COLORS, getBoardLabel } from '../../../constants/mockPosts';
import { fetchMyPosts, fetchPostsCommentedByMe, fetchPostsByIds, type CommunityPostSummary } from '../../../constants/community';
import { authStore } from '../../../constants/authStore';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { Eye, Heart, MessageCircle, Pencil, Bookmark } from 'lucide-react-native';
import { BackIcon } from '@/components/icons/SocialIcons';

type ActivityTab = 'written' | 'commented' | 'liked' | 'saved';

/** Figma: 229:3620~3679 — 내 활동 게시물 (쓴 글 / 댓글 단 글 / 좋아요 한 글) */
export default function MyPostsScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [tab, setTab] = useState<ActivityTab>('written');
  const [data, setData] = useState<CommunityPostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  /* Figma: Selection/Tab/02 (722:3448) — state=게시물/댓글/좋아요 */
  const TABS: { key: ActivityTab; label: string }[] = [
    { key: 'written',   label: t('myPostsTab') },
    { key: 'commented', label: t('myCommentedTab') },
    { key: 'liked',     label: t('myLikedTab') },
    { key: 'saved',     label: t('mySavedTab') },
  ];

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      const load = tab === 'written' ? fetchMyPosts
        : tab === 'commented' ? fetchPostsCommentedByMe
        : tab === 'liked' ? () => fetchPostsByIds(authStore.getLikedPostIds())
        : () => fetchPostsByIds(authStore.getSavedPostIds());
      load().then(result => {
        if (!cancelled) { setData(result); setLoading(false); }
      });
      return () => { cancelled = true; };
    }, [tab]),
  );

  const emptyContent = {
    written:   { icon: Pencil,       text: t('noWrittenPostsYet'),   ctaLabel: t('writeTitle'),       ctaRoute: '/tabs/community/write' as const },
    commented: { icon: MessageCircle, text: t('noCommentedPostsYet'), ctaLabel: t('browseCommunity'), ctaRoute: '/tabs/community' as const },
    liked:     { icon: Heart,        text: t('noLikedPostsYet'),     ctaLabel: t('browseCommunity'), ctaRoute: '/tabs/community' as const },
    saved:     { icon: Bookmark,     text: t('noSavedPostsYet'),     ctaLabel: t('browseCommunity'), ctaRoute: '/tabs/community' as const },
  }[tab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <BackIcon size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('myActivity')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabs}>
        {TABS.map(tabItem => (
          <TouchableOpacity
            key={tabItem.key}
            style={[styles.tab, tab === tabItem.key && styles.tabActive]}
            onPress={() => setTab(tabItem.key)}
          >
            <Text style={[styles.tabText, tab === tabItem.key && styles.tabTextActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{tabItem.label}</Text>
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
                  {getBoardLabel(item.board, language)}
                </Text>
              </View>
              <Text style={styles.postDate}>{item.createdAt}</Text>
            </View>
            <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.postMetaRow}>
              <Text style={styles.postAuthor}>{item.author.emoji} {item.author.name}</Text>
              <View style={styles.postStats}>
                <IconStat icon={Eye} value={item.views} textStyle={styles.metaText} />
                <IconStat icon={Heart} value={item.likes} textStyle={styles.metaText} />
                <IconStat icon={MessageCircle} value={item.commentCount} textStyle={styles.metaText} />
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
              <AppIcon icon={emptyContent.icon} size={36} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>{emptyContent.text}</Text>
              <TouchableOpacity
                style={styles.emptyCta}
                onPress={() => router.push(emptyContent.ctaRoute)}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyCtaText}>{emptyContent.ctaLabel}</Text>
              </TouchableOpacity>
            </View>
          )
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
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  tabs: { flexDirection: 'row', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.navBar },
  tabText: { fontSize: 13, color: Colors.textTertiary },
  tabTextActive: { color: Colors.navBar, fontWeight: '700' },

  postItem: { paddingHorizontal: 20, paddingVertical: 12, gap: 4 },
  postTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  /* 사전 화면 단어 태그(wordBadge)와 동일 크기 */
  boardBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  boardBadgeText: { fontSize: 10, fontWeight: '600' },
  postDate: { fontSize: 11, color: Colors.textTertiary, marginLeft: 'auto' },
  postTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 20 },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  postAuthor: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  postStats: { flexDirection: 'row', gap: 10 },
  metaText: { fontSize: 11, color: Colors.textTertiary },

  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 20 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { fontSize: 14, color: Colors.textTertiary },
  emptyCta: {
    marginTop: 8, paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 20, backgroundColor: Colors.navBar,
  },
  emptyCtaText: { fontSize: 13, fontWeight: '600', color: Colors.navBarIconActive },
});
