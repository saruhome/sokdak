import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { getCategoryBySlug, getCategoryName } from '../../../constants/categories';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { authStore, BETA_UNLIMITED_ENTITLEMENTS } from '../../../constants/authStore';
import { AppIcon } from '@/components/AppIcon';
import { WordListView } from '@/components/WordListView';
import { Bell } from 'lucide-react-native';
import { BackIcon } from '@/components/icons/SocialIcons';

/** Figma: 229:11360 — 카테고리 상세.
 *  "카테고리로 걸러진 단어 목록"이라는 점에서 사전 화면과 동일해 WordListView를 공유하고,
 *  진입한 카테고리를 초기 필터로 넘긴다. 필터 칩의 ×로 해제하면 전체 단어가 보인다. */
export default function CategoryDetailScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const category = getCategoryBySlug(slug);

  /* 그리드 카드 탭은 이미 프리미엄 화면으로 우회시키지만, 딥링크·뒤로가기로 직접 들어오는
   * 경로까지 막으려면 여기서도 한 번 더 확인해야 한다(커뮤니티 게이트와 동일한 이유).
   * slang은 프리미엄 통과 후에도 성인 확인(만 19세 자기확인)을 거쳐야 한다. */
  useFocusEffect(useCallback(() => {
    if (!category?.premiumOnly) return;
    if (!BETA_UNLIMITED_ENTITLEMENTS && !authStore.isPremium()) {
      router.replace('/tabs/mypage/premium');
      return;
    }
    if (!authStore.isAdultVerified()) {
      /* 취소 시 웹 history.back()은 홈 등 진입 전 화면으로 튈 수 있어 카테고리 그리드로 고정 */
      authStore.promptAdultVerification(() => {}, () => router.replace('/tabs/category'));
    }
  }, [category?.premiumOnly]));

  /* WordListView가 배열 재생성으로 매번 리셋되지 않도록 slug 기준으로 메모 */
  const initialCategorySlugs = useMemo(() => (slug ? [slug] : []), [slug]);

  if (!category) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>{t('categoryNotFound')}</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={() => safeGoBack('/tabs/category')}>
          <Text style={styles.notFoundBtnText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── Figma: Navigation/TopAppBar (375×44, bg #52514e) */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack('/tabs/category')}>
          <BackIcon size={24} color={Colors.navBarIconActive} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{getCategoryName(category, language)}</Text>
        <View style={styles.topBarBell}>
          <AppIcon icon={Bell} size={22} color={Colors.navBarIconActive} onPress={() => router.push('/notifications')} />
          <View style={styles.notifDot} />
        </View>
      </View>

      <WordListView initialCategorySlugs={initialCategorySlugs} detailBase="/tabs/category/word" />
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
  notFoundBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontFamily: 'NotoSerifKR_600SemiBold' },
});
