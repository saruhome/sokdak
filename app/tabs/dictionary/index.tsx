import { StyleSheet, View, SafeAreaView } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { AppIcon } from '@/components/AppIcon';
import { WordListView } from '@/components/WordListView';
import { Bell } from 'lucide-react-native';

/** Figma: 229:2824 — 사전(단어 목록). 검색·정렬·카테고리 필터·단어 행은
 *  카테고리 상세 화면과 완전히 동일해 WordListView로 공유한다. */
export default function DictionaryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── Figma: Navigation/TopAppBar (375×44, bg #52514e) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>사전</Text>
        <View style={styles.topBarBell}>
          <AppIcon icon={Bell} size={22} color={Colors.navBarIconActive} onPress={() => router.push('/notifications')} />
          <View style={styles.notifDot} />
        </View>
      </View>

      <WordListView />
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
  topBarBell: { position: 'absolute', right: 6, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  /* Figma: data-badge="on" — 벨 아이콘 우측 상단 알림 점 */
  notifDot: {
    position: 'absolute', top: 10, right: 12,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.error,
  },
});
