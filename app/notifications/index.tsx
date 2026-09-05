import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { safeGoBack } from '../../constants/navigation';
import { fetchNotifications, markAllNotificationsRead, type AppNotification } from '../../constants/notifications';
import { languageStore, useLanguage } from '../../constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { ChevronLeft } from 'lucide-react-native';

/** Figma: Navigation/알림 — 상단 벨 아이콘에서 진입하는 알림 목록 (댓글·좋아요)
 * notifications 테이블 + DB 트리거(notify_on_comment/notify_on_like)로 실제 생성됨 */
export default function NotificationsScreen() {
  useLanguage();
  const t = languageStore.t;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useFocusEffect(useCallback(() => {
    fetchNotifications().then(setNotifications);
  }, []));

  /* 화면을 열람하는 것 자체를 "확인함"으로 간주 — 홈 배지가 다음 방문 때 꺼진다 */
  useEffect(() => { markAllNotificationsRead(); }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <AppIcon icon={ChevronLeft} size={22} color={Colors.navBarIconActive} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('notifications')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('notifications')}</Text>

        {notifications.length === 0 && (
          <Text style={styles.empty}>{t('notifEmpty')}</Text>
        )}

        {notifications.map((n, i) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.item, i > 0 && styles.itemBorder]}
            onPress={() => router.push(`/tabs/community/${n.postId}`)}
          >
            <View style={styles.itemText}>
              <Text style={styles.message}>
                <Text style={styles.actorName}>{n.actorName}</Text>
                {n.message}
              </Text>
              <Text style={styles.timeAgo}>{n.timeAgo}</Text>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.navBar,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },

  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, marginBottom: 16 },
  empty: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center', paddingVertical: 40 },

  item: { paddingVertical: 16, gap: 8 },
  itemBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  itemText: { gap: 8 },
  message: { fontSize: 14, lineHeight: 18, color: Colors.textPrimary, fontFamily: 'NotoSerifKR_400Regular' },
  actorName: { fontFamily: 'NotoSerifKR_600SemiBold' },
  timeAgo: { fontSize: 12, color: Colors.textTertiary },
});
