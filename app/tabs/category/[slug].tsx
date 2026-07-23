import {
  StyleSheet,
  View,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useMemo, useRef } from 'react';
import { Colors } from '../../../constants/Colors';
import { getCategoryBySlug } from '../../../constants/categories';
import { MOCK_WORDS } from '../../../constants/mockWords';
import { AppIcon } from '@/components/AppIcon';
import { Heart, Search } from 'lucide-react-native';

const SORT_OPTIONS = ['인기순', '최신순', 'ㄱㄴㄷ순'] as const;

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const category = getCategoryBySlug(slug);

  const [sortIndex, setSortIndex] = useState(0);
  const [query, setQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  /* 해당 카테고리 단어 필터 + 정렬 */
  const words = useMemo(() => {
    const base = MOCK_WORDS.filter((w) => w.category === slug).filter((w) => {
      const q = query.trim().toLowerCase();
      return !q || w.word.includes(q) || w.shortDesc.includes(q);
    });
    if (sortIndex === 0) return base.sort((a, b) => b.likes - a.likes);
    if (sortIndex === 1) return base.sort((a, b) => Number(b.id) - Number(a.id));
    return base.sort((a, b) => a.word.localeCompare(b.word, 'ko'));
  }, [slug, sortIndex, query]);

  /* 스크롤에 따라 헤더 배너 높이 애니메이션 */
  const bannerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [80, 0],
    extrapolate: 'clamp',
  });
  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (!category) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>카테고리를 찾을 수 없어요</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const accent = category.colorFg;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── Figma: Navigation/TopAppBar/Dictionary (375×44) */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarEmoji}>{category.emoji}</Text>
          <Text style={styles.topBarTitle}>{category.name}</Text>
        </View>
        <View style={styles.topBarRight}>
          <Text style={styles.wordCountBadge}>{words.length}개</Text>
        </View>
      </View>

      {/* ── 카테고리 배너 (스크롤 시 접힘) ── */}
      <Animated.View
        style={[styles.categoryBanner, { height: bannerHeight, opacity: bannerOpacity, backgroundColor: accent + '18', borderColor: accent + '30' }]}
      >
        <Text style={[styles.bannerDesc, { color: accent }]}>{category.description}</Text>
      </Animated.View>

      {/* ── Bars 검색바 ── Figma: Bars (327×36) */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder={`${category.name} 단어 검색`}
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* ── Filter/Sort/Bar ── Figma: 정렬 옵션 (327×18 영역) */}
      <View style={styles.filterRow}>
        {SORT_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setSortIndex(i)}
            style={[styles.sortChip, i === sortIndex && { backgroundColor: accent, borderColor: accent }]}
          >
            <Text style={[styles.sortChipText, i === sortIndex && styles.sortChipTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.countLabel}>총 {words.length}개</Text>
      </View>

      {/* ── List/Item/Word 목록 ── Figma: 327×80 행 */}
      <Animated.FlatList
        data={words}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.wordItem}
            onPress={() => router.push(`/tabs/dictionary/${item.id}`)}
            activeOpacity={0.7}
          >
            {/* 순위 번호 (인기순일 때만) */}
            {sortIndex === 0 && (
              <Text style={[styles.rank, index < 3 && { color: accent, fontWeight: '800' }]}>
                {index + 1}
              </Text>
            )}

            <View style={styles.wordItemLeft}>
              <Text style={styles.wordText}>{item.word}</Text>
              {item.pronunciation ? (
                <Text style={styles.pronunciation}>{item.pronunciation}</Text>
              ) : null}
              <Text style={styles.wordDesc} numberOfLines={1}>
                {item.shortDesc}
              </Text>
            </View>

            <View style={styles.wordItemRight}>
              <View style={styles.likeRow}>
                <AppIcon icon={Heart} size={12} />
                <Text style={styles.likeCount}>{item.likes}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon icon={Search} size={36} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>검색 결과가 없어요</Text>
            <Text style={styles.emptyDesc}>
              다른 검색어를 입력하거나{'\n'}다른 카테고리를 탐색해보세요.
            </Text>
          </View>
        }
        contentContainerStyle={words.length === 0 ? { flex: 1 } : { paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* ── TopAppBar ── */
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34, marginTop: -2 },
  topBarCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  topBarEmoji: { fontSize: 18 },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  topBarRight: { width: 52, alignItems: 'flex-end', paddingRight: 8 },
  wordCountBadge: { fontSize: 11, color: Colors.textTertiary },

  /* ── 카테고리 배너 ── */
  categoryBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bannerDesc: { fontSize: 13, lineHeight: 18, fontWeight: '500' },

  /* ── 검색바 ── */
  searchWrap: { marginHorizontal: 24, marginTop: 10, marginBottom: 4 },
  searchInput: {
    height: 36,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },

  /* ── 필터 바 ── */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipText: { fontSize: 12, color: Colors.textSecondary },
  sortChipTextActive: { color: '#fff', fontWeight: '600' },
  countLabel: { marginLeft: 'auto', fontSize: 11, color: Colors.textTertiary },

  /* ── List/Item/Word (327×80) ── */
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    gap: 10,
  },
  rank: {
    width: 24,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  wordItemLeft: { flex: 1, gap: 2 },
  wordText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  pronunciation: { fontSize: 11, color: Colors.textTertiary },
  wordDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  wordItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeCount: { fontSize: 11, color: Colors.textTertiary },
  chevron: { fontSize: 20, color: Colors.border },

  separator: { height: 1, backgroundColor: Colors.divider, marginLeft: 24 },

  /* ── Empty ── */
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  emptyDesc: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center', lineHeight: 20 },

  /* ── Not found ── */
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  backBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
