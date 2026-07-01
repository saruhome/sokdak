import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

const CATEGORIES = [
  { id: 1, name: 'K-POP', emoji: '🎵' },
  { id: 2, name: '일상', emoji: '☀️' },
  { id: 3, name: '감탄사', emoji: '😲' },
  { id: 4, name: '드라마/영화', emoji: '🎬' },
  { id: 5, name: '릴스', emoji: '📱' },
  { id: 6, name: '무한도전', emoji: '😄' },
  { id: 7, name: '새로운 신조어', emoji: '✨' },
  { id: 8, name: '자주 쓰는 신조어', emoji: '🔥' },
  { id: 9, name: '초성 모음집', emoji: '🔤' },
  { id: 10, name: '한물 간 신조어', emoji: '🕰️' },
];

export default function CategoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar - Figma: Navigation/TopAppBar/Default/Default (375×44) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>카테고리</Text>
      </View>

      {/* Figma: Bars (검색바 36px) */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputBox}>
          <Text style={styles.searchPlaceholder}>카테고리 검색</Text>
        </View>
      </View>

      {/* Figma: Callout Card/Recommend_호락 */}
      <View style={styles.recommendCard}>
        <Text style={styles.recommendLabel}>이번 주 인기 카테고리</Text>
        <Text style={styles.recommendValue}>K-POP 🎵</Text>
      </View>

      {/* Figma: Filter/Combined/Bar */}
      <View style={styles.filterBar}>
        {['인기순', '최신순', 'ㄱㄴㄷ순'].map((t) => (
          <TouchableOpacity key={t} style={styles.filterChip}>
            <Text style={styles.filterChipText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Figma: Group 263 - Selection/Card/Category 2열 그리드 (158×104) */}
      <ScrollView contentContainerStyle={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.categoryCard}>
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={styles.categoryName}>{cat.name}</Text>
          </TouchableOpacity>
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
  searchRow: { height: 36, marginHorizontal: 24, marginTop: 12 },
  searchInputBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  searchPlaceholder: { fontSize: 14, color: Colors.textTertiary },
  recommendCard: {
    marginHorizontal: 24,
    marginTop: 12,
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendLabel: { fontSize: 11, color: Colors.textTertiary, marginBottom: 4 },
  recommendValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipText: { fontSize: 12, color: Colors.textSecondary },
  // 2열 그리드 - Figma Selection/Card/Category 158×104
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    paddingBottom: 24,
  },
  categoryCard: {
    width: 158,
    height: 104,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryEmoji: { fontSize: 28 },
  categoryName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
});
