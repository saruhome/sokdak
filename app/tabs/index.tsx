import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '../../constants/Colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar - Figma: Navigation/TopAppBar/Home (375×44) */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>속닥</Text>
        <Text style={styles.logoSub}>SOK-DAK</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Figma: Card/Recommend2 섹션 */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>오늘의 추천 신조어</Text>
          <Text style={styles.heroSub}>속닥속닥 배우는 교과서에는 없던 진짜 국어</Text>
        </View>

        {/* Figma: 새로운 신조어 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>새로운 신조어</Text>
            <Text style={styles.sectionMore}>더보기</Text>
          </View>
          <View style={styles.wordCardRow}>
            {['요즘 뜨는', '핫한 말', 'K-신조어'].map((label) => (
              <View key={label} style={styles.wordCard}>
                <Text style={styles.wordCardText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Figma: Recommended Section (커뮤니티 추천 게시물) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>커뮤니티 추천</Text>
            <Text style={styles.sectionMore}>더보기</Text>
          </View>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.postItem}>
              <Text style={styles.postTag}>Q&amp;A</Text>
              <Text style={styles.postTitle}>게시글 제목 예시 {i}</Text>
              <Text style={styles.postMeta}>조회 120 · 좋아요 36 · 댓글 12</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  logo: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 6,
  },
  logoSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 24,
  },
  heroBanner: {
    margin: 16,
    padding: 20,
    backgroundColor: Colors.navBar,
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navBarIconActive,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: Colors.navBarIconMuted,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionMore: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  wordCardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  wordCard: {
    width: 100,
    height: 80,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordCardText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  postItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 4,
  },
  postTag: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  postMeta: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
});
