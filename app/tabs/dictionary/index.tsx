import {
  StyleSheet, View, SafeAreaView,
  TextInput, FlatList, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { MOCK_WORDS } from '../../../constants/mockWords';

const SORT_TABS = ['인기순', '최신순', 'ㄱㄴㄷ순'] as const;

export default function DictionaryScreen() {
  const [sortIndex, setSortIndex] = useState(0);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? MOCK_WORDS.filter(w =>
          w.word.includes(q) || w.shortDesc.includes(q) || w.category.toLowerCase().includes(q))
      : [...MOCK_WORDS];
    if (sortIndex === 0) return base.sort((a, b) => b.likes - a.likes);
    if (sortIndex === 1) return base.sort((a, b) => Number(b.id) - Number(a.id));
    return base.sort((a, b) => a.word.localeCompare(b.word, 'ko'));
  }, [sortIndex, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>사전</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="단어를 검색하세요"
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.filterBar}>
        {SORT_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSortIndex(i)}
            style={[styles.filterChip, i === sortIndex && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, i === sortIndex && styles.filterChipTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.recommendCard}
        onPress={() => router.push('/tabs/dictionary/1')}
        activeOpacity={0.8}
      >
        <Text style={styles.recommendLabel}>🔥 오늘의 추천 신조어</Text>
        <Text style={styles.recommendWord}>핵인싸</Text>
        <Text style={styles.recommendDesc}>핵 + 인싸. 매우 사교적이고 무리에 잘 어울리는 사람.</Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
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
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>검색 결과가 없어요</Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : undefined}
      />
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
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  searchWrap: { marginHorizontal: 24, marginTop: 10, marginBottom: 2 },
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
  filterBar: { flexDirection: 'row', paddingHorizontal: 24, gap: 8, marginTop: 10, marginBottom: 10 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  filterChipText: { fontSize: 12, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.navBarIconActive },
  recommendCard: {
    marginHorizontal: 24, marginBottom: 10, padding: 14,
    backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
  },
  recommendLabel: { fontSize: 11, color: Colors.textTertiary, marginBottom: 4 },
  recommendWord: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  recommendDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  wordItem: {
    flexDirection: 'row', alignItems: 'center', height: 80,
    paddingHorizontal: 24, backgroundColor: Colors.background,
  },
  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 24 },
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
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: Colors.textTertiary },
});
