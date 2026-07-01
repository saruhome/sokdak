import { StyleSheet, Text, View, SafeAreaView, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';

const SORT_TABS = ['인기순', '최신순', 'ㄱㄴㄷ순'] as const;

export default function DictionaryScreen() {
  const [sortIndex, setSortIndex] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar - Figma: Navigation/TopAppBar/Dictionary (375×44) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>사전</Text>
      </View>

      {/* Figma: Bars (검색바) (375×36) */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="단어를 검색하세요"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      {/* Figma: Filter/Combined/Bar (정렬 필터) */}
      <View style={styles.filterBar}>
        {SORT_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSortIndex(i)}
            style={[styles.filterTab, i === sortIndex && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, i === sortIndex && styles.filterTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Figma: Callout Card/Recommend_짝이 (추천 카드) */}
      <View style={styles.recommendCard}>
        <Text style={styles.recommendLabel}>🔥 오늘의 추천 신조어</Text>
        <Text style={styles.recommendWord}>핵인싸</Text>
        <Text style={styles.recommendDesc}>핵 + 인싸. 매우 사교적이고 무리에 잘 어울리는 사람.</Text>
      </View>

      {/* Figma: List/Item/Word 목록 (327×80 × n) */}
      <ScrollView style={styles.list}>
        {Array.from({ length: 10 }, (_, i) => (
          <View key={i} style={styles.wordItem}>
            <View style={styles.wordItemLeft}>
              <Text style={styles.wordText}>단어 예시 {i + 1}</Text>
              <Text style={styles.wordDesc}>단어에 대한 간단한 설명이 들어갑니다.</Text>
            </View>
            <Text style={styles.wordCategory}>일상</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  searchContainer: {
    height: 36,
    marginHorizontal: 24,
    marginVertical: 8,
  },
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
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.navBar,
    borderColor: Colors.navBar,
  },
  filterTabText: { fontSize: 12, color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.navBarIconActive },
  recommendCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendLabel: { fontSize: 11, color: Colors.textTertiary, marginBottom: 4 },
  recommendWord: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  recommendDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  list: { flex: 1 },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  wordItemLeft: { flex: 1 },
  wordText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  wordDesc: { fontSize: 12, color: Colors.textSecondary },
  wordCategory: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '500',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
