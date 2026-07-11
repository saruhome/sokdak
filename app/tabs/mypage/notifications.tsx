import {
  StyleSheet, View, SafeAreaView, ScrollView,
  TouchableOpacity, Switch,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';

type NotificationKey = 'newWord' | 'comment' | 'like' | 'notice' | 'marketing';

const NOTIFICATION_ITEMS: { key: NotificationKey; label: string; desc: string }[] = [
  { key: 'newWord',   label: '오늘의 신조어',   desc: '매일 새로운 신조어를 알려드려요' },
  { key: 'comment',   label: '댓글 알림',       desc: '내 글에 댓글이 달리면 알려드려요' },
  { key: 'like',      label: '좋아요 알림',     desc: '내 글에 좋아요가 눌리면 알려드려요' },
  { key: 'notice',    label: '공지사항',        desc: '중요한 서비스 소식을 알려드려요' },
  { key: 'marketing', label: '마케팅 정보 수신', desc: '이벤트·혜택 정보를 받아볼게요 (선택)' },
];

const DEFAULT_STATE: Record<NotificationKey, boolean> = {
  newWord: true,
  comment: true,
  like: true,
  notice: true,
  marketing: false,
};

/** Figma: 229:3513 — 알림설정 (알림 토글 목록) */
export default function NotificationsScreen() {
  const [settings, setSettings] = useState(DEFAULT_STATE);

  const toggle = (key: NotificationKey) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>알림설정</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.group}>
          {NOTIFICATION_ITEMS.map((item, i) => (
            <View
              key={item.key}
              style={[styles.row, i < NOTIFICATION_ITEMS.length - 1 && styles.rowBorder]}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowDesc}>{item.desc}</Text>
              </View>
              <Switch
                value={settings[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: Colors.border, true: Colors.accent }}
                thumbColor={Colors.surface}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  scroll: { padding: 20 },
  group: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  rowText: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rowDesc: { fontSize: 12, color: Colors.textTertiary },
});
