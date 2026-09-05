import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { useEffect, useState } from 'react';
import { Colors } from '../../../../constants/Colors';
import { safeGoBack } from '../../../../constants/navigation';
import { languageStore, LANGUAGE_NATIVE_NAME, type Language } from '../../../../constants/languageStore';
import { BackIcon } from '@/components/icons/SocialIcons';
import { AppIcon } from '@/components/AppIcon';
import { Check } from 'lucide-react-native';

const LANGUAGE_OPTIONS = (Object.entries(LANGUAGE_NATIVE_NAME) as [Language, string][])
  .map(([value, label]) => ({ label, value }));

export default function LanguageSettingsScreen() {
  const [language, setLanguage] = useState<Language>(languageStore.getLanguage());

  useEffect(() => {
    languageStore.initialize().then(() => setLanguage(languageStore.getLanguage()));
    const unsub = languageStore.subscribe(setLanguage);
    return () => unsub();
  }, []);

  /* 즉시 적용 대신 선택만 보관 — 우측 상단 저장을 눌러야 실제 반영(운영자 지시) */
  const [pending, setPending] = useState<Language>(languageStore.getLanguage());
  useEffect(() => { setPending(language); }, [language]);
  const dirty = pending !== language;
  const save = () => {
    languageStore.setLanguage(pending);
    setLanguage(pending);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" style={styles.backBtn} onPress={() => safeGoBack('/tabs/mypage')}>
          <BackIcon size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{languageStore.t('languageSettings')}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.saveBtn, dirty && { backgroundColor: Colors.navBar }]}
          onPress={save}
          disabled={!dirty}
        >
          <Text style={[styles.saveBtnText, dirty && { color: Colors.navBarIconActive }]}>
            {languageStore.t('saveBtnLabel')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {LANGUAGE_OPTIONS.map(option => (
          <TouchableOpacity accessibilityRole="button"
            key={option.value}
            style={[styles.optionRow, pending === option.value && styles.optionRowActive]}
            onPress={() => setPending(option.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionLabel, pending === option.value && styles.optionLabelActive]}>
              {option.label}
            </Text>
            {pending === option.value && <AppIcon icon={Check} size={18} color={Colors.navBar} />}
          </TouchableOpacity>
        ))}
      </View>
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
  /* 내 정보 관리(profile.tsx) 저장 버튼과 동일한 알약형 */
  saveBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.border, marginRight: 4 },
  saveBtnText: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textTertiary },
  topBarTitle: { fontSize: 17, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },

  content: { padding: 24, gap: 12 },
  optionRow: {
    width: '100%', paddingVertical: 16, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  optionRowActive: { borderColor: Colors.navBar },
  optionLabel: { fontSize: 15, color: Colors.textPrimary },
  optionLabelActive: { fontFamily: 'NotoSerifKR_600SemiBold' },
});
