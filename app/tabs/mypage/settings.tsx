import {
  StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { AppIcon } from '@/components/AppIcon';
import { Bell, Globe } from 'lucide-react-native';
import { languageStore } from '../../../constants/languageStore';

const SETTINGS_MENU = [
  { key: 'notifications', icon: Bell, route: '/tabs/mypage/notifications' as const },
  { key: 'languageSettings', icon: Globe, route: '/tabs/mypage/settings/language' as const },
] as const;

/** Figma: 5-1.마이페이지-2 와이어프레임의 설정(⚙️) 아이콘 진입점 */
export default function MyPageSettingsScreen() {
  const [language, setLanguage] = useState(languageStore.getLanguage());

  useEffect(() => {
    languageStore.initialize().then(() => setLanguage(languageStore.getLanguage()));
    const unsub = languageStore.subscribe(setLanguage);
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{languageStore.t('settings')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.menuGroup}>
          {SETTINGS_MENU.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                i < SETTINGS_MENU.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => router.push(item.route)}
            >
              <AppIcon icon={item.icon} size={18} style={styles.menuIconWrap} />
              <Text style={styles.menuLabel}>{languageStore.t(item.key)}</Text>
              {item.key === 'languageSettings' ? (
                <Text style={styles.menuValue}>{language === 'en' ? 'English' : '한국어'}</Text>
              ) : (
                <Text style={styles.menuArrow}>›</Text>
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
  menuValue: { fontSize: 14, color: Colors.textSecondary },
  menuSoon: { fontSize: 12, color: Colors.textTertiary },
});
