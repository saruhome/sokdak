import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

const BOARD_TYPES = ['궁금해요', 'Q&A', '질문하기'] as const;

const MOCK_POSTS = [
  { id: 1, board: '궁금해요', title: "'갓벽'이 무슨 뜻인가요?", views: 120, likes: 36, comments: 12 },
  { id: 2, board: 'Q&A', title: '요즘 MZ세대가 쓰는 신조어 모음', views: 98, likes: 24, comments: 7 },
  { id: 3, board: '궁금해요', title: "'억까'의 정확한 뉘앙스가 궁금해요", views: 54, likes: 18, comments: 3 },
  { id: 4, board: '질문하기', title: '한국 직장인 용어 정리해주세요', views: 200, likes: 61, comments: 20 },
];

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar - Figma: Navigation/TopAppBar/Default/Default (375×44) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>커뮤니티</Text>
        {/* Figma: Controls/Icon/write - 글쓰기 FAB */}
        <TouchableOpacity style={styles.writeBtn}>
          <Text style={styles.writeBtnText}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Figma: 화제의 게시글 (Card/Post/Preview 가로 스크롤) */}
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>화제의 게시글</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.featuredCard}>
              <Text style={styles.featuredCardText}>인기 게시글 {i}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Figma: 상단메뉴 - Display/Community/게시판 종류 */}
      <View style={styles.boardTabs}>
        {BOARD_TYPES.map((tab) => (
          <TouchableOpacity key={tab} style={styles.boardTab}>
            <Text style={styles.boardTabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Figma: Frame 506 - List/Item/Post 목록 (327×92) */}
      <ScrollView style={styles.list}>
        {MOCK_POSTS.map((post) => (
          <View key={post.id} style={styles.postItem}>
            <View style={styles.postHeader}>
              <View style={styles.postTag}>
                <Text style={styles.postTagText}>{post.board}</Text>
              </View>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <View style={styles.postMeta}>
              <Text style={styles.postMetaText}>👁 {post.views}</Text>
              <Text style={styles.postMetaText}>❤️ {post.likes}</Text>
              <Text style={styles.postMetaText}>💬 {post.comments}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  writeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  writeBtnText: { fontSize: 20 },
  featuredSection: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  featuredScroll: { flexDirection: 'row' },
  featuredCard: {
    width: 220,
    height: 100,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredCardText: { fontSize: 12, color: Colors.textTertiary },
  boardTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  boardTab: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  boardTabText: { fontSize: 12, color: Colors.textSecondary },
  list: { flex: 1 },
  postItem: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    height: 92,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    justifyContent: 'space-between',
  },
  postHeader: { flexDirection: 'row' },
  postTag: {
    backgroundColor: Colors.background,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  postTagText: { fontSize: 10, color: Colors.accent, fontWeight: '600' },
  postTitle: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, flex: 1 },
  postMeta: { flexDirection: 'row', gap: 12 },
  postMetaText: { fontSize: 11, color: Colors.textTertiary },
});
