import {
  StyleSheet, View, SafeAreaView, Image,
  FlatList, TouchableOpacity, ImageBackground,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CATEGORIES } from '../../../constants/categories';
import { MOCK_WORDS } from '../../../constants/mockWords';
import { AppIcon } from '@/components/AppIcon';
import { Search } from 'lucide-react-native';

const MIC_ICON = require('../../../assets/categories/icon-mic.png');
const STAR_ICON = require('../../../assets/categories/icon-star.png');

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
        <AppIcon icon={Search} size={18} style={styles.searchBtn} onPress={() => router.push('/tabs/category/search')} />
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
            activeOpacity={0.8}
          >
            <ImageBackground source={item.image} style={styles.cardBg} imageStyle={styles.cardBgImage}>
              <Image source={MIC_ICON} style={styles.micIcon} />
              <Image source={STAR_ICON} style={[styles.starIcon, { tintColor: item.colorFg }]} />
              {item.slug === 'new-slang' && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
              <View style={styles.cardScrim} />
              <View style={styles.cardTextWrap}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryCount}>{countBySlug[item.slug] ?? 0}개</Text>
              </View>
            </ImageBackground>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  searchBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardBg: { flex: 1 },
  cardBgImage: { resizeMode: 'cover' },
  micIcon: { position: 'absolute', left: 12, top: 12, width: 16, height: 16, tintColor: '#1A1A1A' },
  starIcon: { position: 'absolute', right: 12, top: 12, width: 16, height: 16 },
  newBadge: {
    position: 'absolute', right: 10, top: 34,
    backgroundColor: Colors.error, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  newBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  cardScrim: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 44,
    backgroundColor: 'rgba(248,248,248,0.88)',
  },
  cardTextWrap: { position: 'absolute', left: 12, right: 12, bottom: 10, gap: 2 },
  categoryName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  categoryCount: { fontSize: 11, color: Colors.textTertiary },
});
