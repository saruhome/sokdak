import { StyleSheet, View, TextInput, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { safeGoBack } from '../../constants/navigation';
import { cardGloss, fetchWords, type Word } from '../../constants/words';
import { BOARD_COLORS } from '../../constants/mockPosts';
import { fetchPosts, type CommunityPostSummary } from '../../constants/community';
import { CATEGORIES, getCategoryBySlug, getCategoryName } from '../../constants/categories';
import { authStore } from '../../constants/authStore';
import { tFor, useLanguage } from '../../constants/languageStore';
import { filterPostResults, filterWordResults, suggestWords } from '@/src/features/search/model/searchResults';
import { suggestSimilarWord } from '@/src/features/dictionary/model/wordSearch';
import { AppIcon, IconStat } from '@/components/AppIcon';
import { Search, BookOpen, Heart, Star, Eye, MessageCircle, X } from 'lucide-react-native';
import { BackIcon } from '@/components/icons/SocialIcons';
import { CharacterEmptyState } from '@/components/CharacterEmptyState';

const JJAEKI_QUESTION = require('../../assets/characters/transparent/jjaeki-question.png');

type ResultTab = 'word' | 'community';

export default function SearchScreen() {
  const language = useLanguage();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [resultTab, setResultTab] = useState<ResultTab>('word');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(authStore.getSavedWordIds());
  const [communityPosts, setCommunityPosts] = useState<CommunityPostSummary[]>([]);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const tr = (key: Parameters<typeof tFor>[1]) => tFor(language, key);
  const trWith = (key: Parameters<typeof tFor>[1], values: Record<string, string | number>) =>
    Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, String(value)), tr(key));

  useFocusEffect(useCallback(() => { setSavedIds(authStore.getSavedWordIds()); }, []));
  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(() => setSavedIds(authStore.getSavedWordIds()));
    return () => { unsub(); };
  }, []);
  useEffect(() => { fetchPosts().then(setCommunityPosts); }, []);
  useEffect(() => {
    fetchWords().then(setAllWords);
  }, []);

  const toggleSave = (id: string) => {
    if (!authStore.isLoggedIn()) {
      Alert.alert(tr('loginRequiredTitle'), tr('loginRequiredSave'), [
        { text: tr('cancelLabel'), style: 'cancel' },
        { text: tr('goToLogin'), onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    if (!authStore.isWordSaved(id) && !authStore.canSaveMoreWords()) {
      Alert.alert(tr('saveLimitReachedTitle'), tr('saveLimitReachedMessage'));
      return;
    }
    authStore.toggleWordSaved(id);
    setSavedIds(authStore.getSavedWordIds());
  };

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

  /* ── 결과 필터링은 search feature의 순수 함수가 담당 — 화면은 조합만 ── */
  const suggestions = useMemo<Word[]>(() => suggestWords(allWords, query), [allWords, query]);
  const wordResults = useMemo<Word[]>(
    () => filterWordResults(allWords, submittedQuery ?? '', categoryFilter),
    [allWords, submittedQuery, categoryFilter],
  );
  const postResults = useMemo<CommunityPostSummary[]>(
    () => filterPostResults(communityPosts, submittedQuery ?? ''),
    [submittedQuery, communityPosts],
  );

  /* 결과가 없을 때만 오타 후보를 계산한다 — "혹시 '킹받다'인가요?" */
  const didYouMean = useMemo(
    () => (submittedQuery && wordResults.length === 0 ? suggestSimilarWord(allWords, submittedQuery) : null),
    [allWords, submittedQuery, wordResults.length],
  );

  const showEmptyState = submittedQuery === null && query.trim() === '';
  const showSuggestState = submittedQuery === null && query.trim() !== '';
  const showResultState = submittedQuery !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopBar: 뒤로가기 + 검색 인풋 ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()} accessibilityLabel={tr('goBack')}>
          <BackIcon size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder={tr('wordSearchPlaceholder')}
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={() => handleSubmit(query)}
          returnKeyType="search"
          autoFocus
          clearButtonMode="while-editing"
          accessibilityLabel={tr('wordSearchPlaceholder')}
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
              <Text style={styles.sectionTitle}>{tr('recentSearches')}</Text>
              {recent.length > 0 && (
                <TouchableOpacity onPress={() => setRecent([])}>
                  <Text style={styles.sectionAction}>{tr('clearAll')}</Text>
                </TouchableOpacity>
              )}
            </View>
            {recent.length === 0 ? (
              <View style={styles.emptySearchHintWrap}>
                <Text style={styles.emptyHint}>{tr('noRecentSearches')}</Text>
                <Text style={styles.emptyHint}>{tr('trySearchingCategory')}</Text>
              </View>
            ) : (
              <View style={styles.chipWrap}>
                {recent.map(term => (
                  <View key={term} style={styles.recentChip}>
                    <TouchableOpacity onPress={() => handleSubmit(term)}>
                      <Text style={styles.recentChipText}>{term}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRecent(term)} hitSlop={8} accessibilityLabel={tr('clearWordSearch')}>
                      <AppIcon icon={X} size={11} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
              <AppIcon icon={Search} size={15} style={styles.suggestIconWrap} />
              <Text style={styles.suggestQueryText} numberOfLines={1}>
                {trWith('globalSearchSubmit', { query })}
              </Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestRow}
              onPress={() => handleSubmit(item.word)}
              activeOpacity={0.7}
            >
              <AppIcon icon={BookOpen} size={15} style={styles.suggestIconWrap} />
              <Text style={styles.suggestWord}>{item.word}</Text>
              <Text style={styles.suggestDesc} numberOfLines={1}>{cardGloss(item, language)}</Text>
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
                {trWith('globalSearchWordResults', { count: wordResults.length })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setResultTab('community')}
              style={[styles.resultTab, resultTab === 'community' && styles.resultTabActive]}
            >
              <Text style={[styles.resultTabText, resultTab === 'community' && styles.resultTabTextActive]}>
                {trWith('globalSearchPostResults', { count: postResults.length })}
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
                    {tr('allLabel')}
                  </Text>
                </TouchableOpacity>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c.slug}
                    onPress={() => setCategoryFilter(c.slug)}
                    style={[styles.filterChip, categoryFilter === c.slug && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, categoryFilter === c.slug && styles.filterChipTextActive]}>
                      {c.emoji} {getCategoryName(c, language).replace(/\n/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <FlatList
                data={wordResults}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                  const saved = savedIds.includes(item.id);
                  return (
                    <TouchableOpacity
                      style={styles.wordItem}
                      onPress={() => router.push(`/tabs/dictionary/${item.id}`)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.wordItemLeft}>
                        <Text style={styles.wordText}>{item.word}</Text>
                        <Text style={styles.wordDesc} numberOfLines={1}>{cardGloss(item, language)}</Text>
                      </View>
                      <View style={styles.wordRight}>
                        <Text style={styles.wordCategory}>{(() => {
                          const category = getCategoryBySlug(item.category);
                          return category ? getCategoryName(category, language).replace(/\n/g, ' ') : item.category;
                        })()}</Text>
                        <IconStat icon={Heart} value={item.likes} textStyle={styles.wordLikes} />
                        <AppIcon
                          icon={Star}
                          size={16}
                          fill={saved ? '#FACC15' : undefined}
                          color={saved ? '#FACC15' : undefined}
                          onPress={() => toggleSave(item.id)}
                          hitSlop={14}
                          accessibilityLabel="단어 저장"
                        />
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                /* ── 단어 없음 (Figma: 229:2794) ── */
                ListEmptyComponent={
                  <View style={styles.resultEmptyWrap}>
                    <CharacterEmptyState
                      image={JJAEKI_QUESTION}
                      title={trWith('globalSearchNoWordResults', { query: submittedQuery ?? '' })}
                      description={tr('trySearchingCategory')}
                      testID="global-search-no-word-results"
                    />
                    {didYouMean && (
                      <TouchableOpacity
                        style={styles.didYouMeanBtn}
                        testID="global-search-did-you-mean"
                        onPress={() => { setQuery(didYouMean.word); setSubmittedQuery(didYouMean.word); }}
                      >
                        <Text style={styles.didYouMeanText}>
                          {trWith('globalSearchDidYouMean', { word: didYouMean.word })}
                        </Text>
                      </TouchableOpacity>
                    )}
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
                      <IconStat icon={Eye} value={item.views} textStyle={styles.metaText} />
                      <IconStat icon={Heart} value={item.likes} textStyle={styles.metaText} />
                      <IconStat icon={MessageCircle} value={item.commentCount} textStyle={styles.metaText} />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <View style={styles.resultEmptyWrap}>
                  <CharacterEmptyState
                    image={JJAEKI_QUESTION}
                    title={trWith('globalSearchNoPostResults', { query: submittedQuery ?? '' })}
                    description={tr('trySearchingCategory')}
                    testID="global-search-no-post-results"
                  />
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
  emptySearchHintWrap: { gap: 4 },
  emptyHint: { fontSize: 13, color: Colors.textTertiary },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingLeft: 12, paddingRight: 10, paddingVertical: 7,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  recentChipText: { fontSize: 13, color: Colors.textPrimary },

  /* 자동완성 */
  suggestRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, height: 48,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  suggestIconWrap: { width: 18, alignItems: 'center' },
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

  /* 결과 없음 */
  resultEmptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 40 },
  didYouMeanBtn: {
    marginTop: 4, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  didYouMeanText: { fontSize: 14, fontWeight: '600', color: Colors.accent },
  resultEmptyTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  resultEmptyHint: { fontSize: 12, color: Colors.textTertiary },
});
