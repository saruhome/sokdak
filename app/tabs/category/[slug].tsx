import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useLocalSearchParams, router } from 'expo-router';
import { useMemo } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { getCategoryBySlug, getCategoryName } from '../../../constants/categories';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { WordListView } from '@/components/WordListView';
import { Bell, ChevronLeft } from 'lucide-react-native';

/** Figma: 229:11360 — 카테고리 상세.
 *  "카테고리로 걸러진 단어 목록"이라는 점에서 사전 화면과 동일해 WordListView를 공유하고,
 *  진입한 카테고리를 초기 필터로 넘긴다. 필터 칩의 ×로 해제하면 전체 단어가 보인다. */
export default function CategoryDetailScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const category = getCategoryBySlug(slug);

  /* WordListView가 배열 재생성으로 매번 리셋되지 않도록 slug 기준으로 메모 */
  const initialCategorySlugs = useMemo(() => (slug ? [slug] : []), [slug]);

  if (!category) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>{t('categoryNotFound')}</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={() => safeGoBack()}>
          <Text style={styles.notFoundBtnText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── Figma: Navigation/TopAppBar (375×44, bg #52514e) */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <AppIcon icon={ChevronLeft} size={22} color={Colors.navBarIconActive} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{getCategoryName(category, language)}</Text>
        <View style={styles.topBarBell}>
          <AppIcon icon={Bell} size={22} color={Colors.navBarIconActive} onPress={() => router.push('/notifications')} />
          <View style={styles.notifDot} />
        </View>
      </View>

      <WordListView initialCategorySlugs={initialCategorySlugs} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar,
  },
  topBarTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  backBtn: { position: 'absolute', left: 6, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarBell: { position: 'absolute', right: 6, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  /* Figma: data-badge="on" — 벨 아이콘 우측 상단 알림 점 */
  notifDot: {
    position: 'absolute', top: 10, right: 12,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.error,
  },

  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  notFoundBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  notFoundBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
