import {
  StyleSheet, View, SafeAreaView, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { Toggle } from '@/components/Toggle';

type NotificationKey = 'newSlang' | 'popularSlang' | 'popularPost' | 'like' | 'comment';

const CONTENT_ITEMS: { key: NotificationKey; label: string; desc: string }[] = [
  { key: 'newSlang',     label: '새로운 신조어/카테고리', desc: '새로운 신조어 소식을 알려드려요' },
  { key: 'popularSlang', label: '인기 신조어/카테고리',   desc: '가장 많이 검색하는 단어를 알려드려요' },
];

const COMMUNITY_ITEMS: { key: NotificationKey; label: string; desc: string }[] = [
  { key: 'popularPost', label: '인기글 알림', desc: '베스트 게시물을 빠르게 알려드려요' },
  { key: 'like',        label: '좋아요 알림', desc: '내 게시물에 좋아요가 달리면 알려드려요' },
  { key: 'comment',     label: '댓글 알림',   desc: '내 게시물에 댓글이 작성되면 알려드려요' },
];

const DEFAULT_STATE: Record<NotificationKey, boolean> = {
  newSlang: true,
  popularSlang: true,
  popularPost: true,
  like: true,
  comment: true,
};

/** Figma: 831:4800 — 알림 설정 (전체 알림 + 컨텐츠 + 커뮤니티) */
export default function NotificationsScreen() {
  const [settings, setSettings] = useState(DEFAULT_STATE);
  const allOn = Object.values(settings).every(Boolean);

  const toggle = (key: NotificationKey) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const next = !allOn;
    setSettings({
      newSlang: next, popularSlang: next, popularPost: next, like: next, comment: next,
    });
  };

  const renderRow = (item: { key: NotificationKey; label: string; desc: string }, isLast: boolean) => (
    <View key={item.key} style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{item.label}</Text>
        <Text style={styles.rowDesc}>{item.desc}</Text>
      </View>
      <Toggle value={settings[item.key]} onValueChange={() => toggle(item.key)} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>알림 설정</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>전체 알림</Text>
              <Text style={styles.rowDesc}>모든 알림을 한 번에 끄거나 켭니다</Text>
            </View>
            <Toggle value={allOn} onValueChange={toggleAll} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>컨텐츠</Text>
        <View style={styles.group}>
          {CONTENT_ITEMS.map((item, i) => renderRow(item, i === CONTENT_ITEMS.length - 1))}
        </View>

        <Text style={styles.sectionLabel}>커뮤니티</Text>
        <View style={styles.group}>
          {COMMUNITY_ITEMS.map((item, i) => renderRow(item, i === COMMUNITY_ITEMS.length - 1))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.navBar,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.navBarIconActive, lineHeight: 34 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.navBarIconActive },

  scroll: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: Colors.textPrimary,
    marginTop: 24, marginBottom: 10,
  },
  group: {
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  rowText: { flex: 1, gap: 4 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  rowDesc: { fontSize: 12, color: Colors.textTertiary },
});
