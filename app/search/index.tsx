import {
  StyleSheet, View, SafeAreaView,
  TextInput, FlatList, ScrollView, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MOCK_WORDS, type Word } from '../../constants/mockWords';
import { MOCK_POSTS, BOARD_COLORS, type Post } from '../../constants/mockPosts';
import { CATEGORIES } from '../../constants/categories';

type ResultTab = 'word' | 'community';

/** Figma: 인기 검색어 — likes 상위 8개 단어로 구성 */
const POPULAR_SEARCHES = [...MOCK_WORDS]
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 8)
  .map(w => w.word);

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(['킹받다', '갑분싸', '핵인싸']);
  const [resultTab, setResultTab] = useState<ResultTab>('word');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const handleChangeText = (text: string) => {
    setQuery(text);
    setSubmittedQuery(null);
  };

  const handleSubmit = (raw: string) => {
    const term = raw.trim();
    if (!term) return;
    setQuery(term);
    setSubmittedQuery(term);
    setResultTab('word');
    setCategoryFilter(null);
    setRecent(prev => [term, ...prev.filter(t => t !== term)].slice(0, 8));
  };

  const removeRecent = (term: string) => {
    setRecent(prev => prev.filter(t => t !== term));
  };

  /* ── 입력 중 자동완성 (Figma: 229:2723) ── */
  const suggestions = useMemo<Word[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_WORDS
      .filter(w => w.word.toLowerCase().includes(q) || w.shortDesc.includes(q))
      .slice(0, 6);
  }, [query]);

  /* ── 검색 결과 (Figma: 229:2750 단어 / 229:2772 필터 / 229:2794 없음) ── */
  const wordResults = useMemo<Word[]>(() => {
    const q = submittedQuery?.trim().toLowerCase() ?? '';
    let base = MOCK_WORDS.filter(w =>
      w.word.toLowerCase().includes(q) || w.shortDesc.includes(q) || w.category.toLowerCase().includes(q));
    if (categoryFilter) base = base.filter(w => w.category === categoryFilter);
    return base;
  }, [submittedQuery, categoryFilter]);

  /* ── 커뮤니티 검색 결과 (Figma: 229:2808) ── */
  const postResults = useMemo<Post[]>(() => {
    const q = submittedQuery?.trim().toLowerCase() ?? '';
    return MOCK_POSTS.filter(p =>
      p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  }, [submittedQuery]);

  const showEmptyState = submittedQuery === null && query.trim() === '';
  const showSuggestState = submittedQuery === null && query.trim() !== '';
  const showResultState = submittedQuery !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopBar: 뒤로가기 + 검색 인풋 ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="단어, 게시글을 검색해보세요"
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={() => handleSubmit(query)}
          returnKeyType="search"
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>

      {/* ── 빈 상태: 최근 검색어 + 인기 검색어 (Figma: 229:2696) ── */}
      {showEmptyState && (
        <ScrollView
          contentContainerStyle={styles.stateScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>최근 검색어</Text>
              {recent.length > 0 && (
                <TouchableOpacity onPress={() => setRecent([])}>
                  <Text style={styles.sectionAction}>전체삭제</Text>
                </TouchableOpacity>
              )}
            </View>
            {recent.length === 0 ? (
              <Text style={styles.emptyHint}>최근 검색한 단어가 여기에 표시돼요</Text>
            ) : (
              <View style={styles.chipWrap}>
                {recent.map(term => (
                  <View key={term} style={styles.recentChip}>
                    <TouchableOpacity onPress={() => handleSubmit(term)}>
                      <Text style={styles.recentChipText}>{term}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRecent(term)} hitSlop={8}>
                      <Text style={styles.recentChipRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>인기 검색어</Text>
            {POPULAR_SEARCHES.map((term, i) => (
              <TouchableOpacity
                key={term}
                style={styles.popularRow}
                onPress={() => handleSubmit(term)}
                activeOpacity={0.7}
              >
                <Text style={[styles.popularRank, i < 3 && styles.popularRankTop]}>{i + 1}</Text>
                <Text style={styles.popularTerm}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── 입력 중: 자동완성 제안 리스트 (Figma: 229:2723) ── */}
      {showSuggestState && (
        <FlatList
          data={suggestions}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.suggestRow}
              onPress={() => handleSubmit(query)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestIcon}>🔍</Text>
              <Text style={styles.suggestQueryText} numberOfLines={1}>
                '{query}' 검색
              </Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestRow}
              onPress={() => handleSubmit(item.word)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestIcon}>📖</Text>
              <Text style={styles.suggestWord}>{item.word}</Text>
              <Text style={styles.suggestDesc} numberOfLines={1}>{item.shortDesc}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── 검색 결과: 단어 / 커뮤니티 탭 ── */}
      {showResultState && (
        <View style={styles.resultContainer}>
          <View style={styles.resultTabs}>
            <TouchableOpacity
              onPress={() => setResultTab('word')}
              style={[styles.resultTab, resultTab === 'word' && styles.resultTabActive]}
            >
              <Text style={[styles.resultTabText, resultTab === 'word' && styles.resultTabTextActive]}>
                단어 {wordResults.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setResultTab('community')}
              style={[styles.resultTab, resultTab === 'community' && styles.resultTabActive]}
            >
              <Text style={[styles.resultTabText, resultTab === 'community' && styles.resultTabTextActive]}>
                게시글 {postResults.length}
              </Text>
            </TouchableOpacity>
          </View>

          {resultTab === 'word' ? (
            <>
              {/* ── 카테고리 필터 (Figma: 229:2772) ── */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterScrollContent}
              >
                <TouchableOpacity
                  onPress={() => setCategoryFilter(null)}
                  style={[styles.filterChip, categoryFilter === null && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, categoryFilter === null && styles.filterChipTextActive]}>
                    전체
                  </Text>
                </TouchableOpacity>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c.slug}
                    onPress={() => setCategoryFilter(c.slug)}
                    style={[styles.filterChip, categoryFilter === c.slug && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, categoryFilter === c.slug && styles.filterChipTextActive]}>
                      {c.emoji} {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <FlatList
                data={wordResults}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.wordItem}
                    onPress={() => router.push(`/tabs/dictionary/${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.wordItemLeft}>
                      <Text style={styles.wordText}>{item.word}</Text>
                      <Text style={styles.wordDesc} numberOfLines={1}>{item.shortDesc}</Text>
                    </View>
                    <View style={styles.wordRight}>
                      <Text style={styles.wordCategory}>{item.category}</Text>
                      <Text style={styles.wordLikes}>❤️ {item.likes}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                /* ── 단어 없음 (Figma: 229:2794) ── */
                ListEmptyComponent={
                  <View style={styles.resultEmptyWrap}>
                    <Text style={styles.resultEmptyEmoji}>🔍</Text>
                    <Text style={styles.resultEmptyTitle}>'{submittedQuery}'에 대한 검색 결과가 없어요</Text>
                    <Text style={styles.resultEmptyHint}>다른 검색어로 시도해보세요</Text>
                  </View>
                }
                contentContainerStyle={wordResults.length === 0 ? { flex: 1 } : undefined}
              />
            </>
          ) : (
            <FlatList
              data={postResults}
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
                <View style={styles.resultEmptyWrap}>
                  <Text style={styles.resultEmptyEmoji}>📭</Text>
                  <Text style={styles.resultEmptyTitle}>'{submittedQuery}'에 대한 게시글이 없어요</Text>
                  <Text style={styles.resultEmptyHint}>다른 검색어로 시도해보세요</Text>
                </View>
              }
              contentContainerStyle={postResults.length === 0 ? { flex: 1 } : undefined}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* TopBar */
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },

  /* 빈 상태 */
  stateScroll: { paddingBottom: 40 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  sectionAction: { fontSize: 12, color: Colors.textTertiary },
  emptyHint: { fontSize: 13, color: Colors.textTertiary },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingLeft: 12, paddingRight: 10, paddingVertical: 7,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  recentChipText: { fontSize: 13, color: Colors.textPrimary },
  recentChipRemove: { fontSize: 11, color: Colors.textTertiary },

  popularRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  popularRank: { width: 18, fontSize: 13, fontWeight: '700', color: Colors.textTertiary },
  popularRankTop: { color: Colors.accent },
  popularTerm: { fontSize: 14, color: Colors.textPrimary },

  /* 자동완성 */
  suggestRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, height: 48,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  suggestIcon: { fontSize: 15, width: 18, textAlign: 'center' },
  suggestQueryText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  suggestWord: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  suggestDesc: { flex: 1, fontSize: 12, color: Colors.textTertiary, textAlign: 'right' },

  /* 결과 탭 */
  resultContainer: { flex: 1 },
  resultTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.divider },
  resultTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  resultTabActive: { borderBottomColor: Colors.navBar },
  resultTabText: { fontSize: 13, color: Colors.textTertiary },
  resultTabTextActive: { color: Colors.navBar, fontWeight: '700' },

  /* 카테고리 필터 */
  filterScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  filterScrollContent: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  filterChipText: { fontSize: 12, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.navBarIconActive },

  /* 단어 결과 아이템 */
  wordItem: {
    flexDirection: 'row', alignItems: 'center', height: 80,
    paddingHorizontal: 20, backgroundColor: Colors.background,
  },
  wordItemLeft: { flex: 1, gap: 4 },
  wordText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  wordDesc: { fontSize: 12, color: Colors.textSecondary },
  wordRight: { alignItems: 'flex-end', gap: 6 },
  wordCategory: {
    fontSize: 10, color: Colors.accent, fontWeight: '600',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  wordLikes: { fontSize: 11, color: Colors.textTertiary },

  /* 게시글 결과 아이템 */
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

  /* 결과 없음 */
  resultEmptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 40 },
  resultEmptyEmoji: { fontSize: 36 },
  resultEmptyTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  resultEmptyHint: { fontSize: 12, color: Colors.textTertiary },
});
