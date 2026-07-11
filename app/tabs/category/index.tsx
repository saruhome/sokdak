import {
  StyleSheet, Text, View, SafeAreaView,
  FlatList, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CATEGORIES } from '../../../constants/categories';
import { MOCK_WORDS } from '../../../constants/mockWords';

export default function CategoryScreen() {
  const countBySlug = Object.fromEntries(
    CATEGORIES.map(c => [c.slug, MOCK_WORDS.filter(w => w.category === c.slug).length])
  );

  const topCategory = CATEGORIES.reduce((a, b) =>
    (countBySlug[a.slug] ?? 0) >= (countBySlug[b.slug] ?? 0) ? a : b
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar – Figma: Navigation/TopAppBar/Default/Default (375×44) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>카테고리</Text>
      </View>

      {/* Figma: Callout Card/Recommend_호락 (327×120) */}
      <TouchableOpacity
        style={styles.recommendCard}
        onPress={() => router.push(`/tabs/category/${topCategory.slug}`)}
        activeOpacity={0.8}
      >
        <Text style={styles.recommendLabel}>🔥 이번 주 인기 카테고리</Text>
        <View style={styles.recommendRow}>
          <Text style={styles.recommendEmoji}>{topCategory.emoji}</Text>
          <View>
            <Text style={styles.recommendName}>{topCategory.name}</Text>
            <Text style={styles.recommendCount}>단어 {countBySlug[topCategory.slug]}개</Text>
          </View>
        </View>
        <Text style={styles.recommendArrow}>바로가기 ›</Text>
      </TouchableOpacity>

      {/* Figma: Selection/Card/Category 2열 그리드 (158×104px) */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={item => item.slug}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => router.push(`/tabs/category/${item.slug}`)}
            activeOpacity={0.75}
          >
            <View style={[styles.categoryEmojiWrap, { backgroundColor: item.color + '18' }]}>
              <Text style={styles.categoryEmoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryCount}>{countBySlug[item.slug] ?? 0}개</Text>
          </TouchableOpacity>
        )}
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

  recommendCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 16,
    backgroundColor: Colors.navBar,
    borderRadius: 12,
    gap: 10,
  },
  recommendLabel: { fontSize: 11, color: Colors.navBarIconMuted },
  recommendRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recommendEmoji: { fontSize: 36 },
  recommendName: { fontSize: 18, fontWeight: '700', color: Colors.navBarIconActive },
  recommendCount: { fontSize: 12, color: Colors.navBarIconMuted, marginTop: 2 },
  recommendArrow: { fontSize: 12, color: Colors.navBarIconMuted, textAlign: 'right' },

  grid: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { gap: 12, marginBottom: 12 },
  categoryCard: {
    flex: 1,
    height: 104,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 12,
  },
  categoryEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  categoryEmoji: { fontSize: 24 },
  categoryName: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  categoryCount: { fontSize: 11, color: Colors.textTertiary },
});
