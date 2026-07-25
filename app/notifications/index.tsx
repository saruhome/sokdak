import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '../../constants/Colors';
import { safeGoBack } from '../../constants/navigation';
import { MOCK_NOTIFICATIONS } from '../../constants/mockNotifications';
import { AppIcon } from '@/components/AppIcon';
import { ChevronLeft } from 'lucide-react-native';

/** Figma: Navigation/알림 — 상단 벨 아이콘에서 진입하는 알림 목록 (댓글·좋아요 등)
 *  실제 알림 생성 백엔드(댓글/좋아요 트리거)가 아직 없어 mock 데이터로 구성 — constants/mockNotifications.ts */
export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <AppIcon icon={ChevronLeft} size={22} color={Colors.navBarIconActive} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>알림</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>오늘</Text>

        {MOCK_NOTIFICATIONS.map((n, i) => (
          <View key={n.id} style={[styles.item, i > 0 && styles.itemBorder]}>
            <View style={styles.itemText}>
              <Text style={styles.message}>
                <Text style={styles.actorName}>{n.actorName}</Text>
                {n.message}
              </Text>
              <Text style={styles.timeAgo}>{n.timeAgo}</Text>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.navBar,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },

  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, marginBottom: 16 },

  item: { paddingVertical: 16, gap: 8 },
  itemBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  itemText: { gap: 8 },
  message: { fontSize: 14, lineHeight: 18, color: Colors.textPrimary, fontFamily: 'NotoSerifKR_400Regular' },
  actorName: { fontFamily: 'NotoSerifKR_600SemiBold' },
  timeAgo: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
});
