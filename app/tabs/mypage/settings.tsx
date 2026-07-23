import {
  StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { AppIcon } from '@/components/AppIcon';
import { Bell, Globe } from 'lucide-react-native';

const SETTINGS_MENU = [
  { label: '알림설정', icon: Bell, route: '/tabs/mypage/notifications' as const },
  { label: '언어 설정', icon: Globe, route: null },
];

/** Figma: 5-1.마이페이지-2 와이어프레임의 설정(⚙️) 아이콘 진입점 */
export default function MyPageSettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>설정</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.menuGroup}>
          {SETTINGS_MENU.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                i < SETTINGS_MENU.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => item.route && router.push(item.route)}
              disabled={!item.route}
            >
              <AppIcon icon={item.icon} size={18} style={styles.menuIconWrap} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.route ? (
                <Text style={styles.menuArrow}>›</Text>
              ) : (
                <Text style={styles.menuSoon}>준비 중</Text>
              )}
            </TouchableOpacity>
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

  scroll: { padding: 16 },
  menuGroup: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuIconWrap: { width: 26 },
  menuLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  menuArrow: { fontSize: 18, color: Colors.border },
  menuSoon: { fontSize: 12, color: Colors.textTertiary },
});
