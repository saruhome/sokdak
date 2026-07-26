import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useEffect, useState } from 'react';
import { Colors } from '../../../../constants/Colors';
import { safeGoBack } from '../../../../constants/navigation';
import { languageStore, type Language } from '../../../../constants/languageStore';

const LANGUAGE_OPTIONS: { label: string; value: Language }[] = [
  { label: '한국어', value: 'ko' },
  { label: 'English', value: 'en' },
];

export default function LanguageSettingsScreen() {
  const [language, setLanguage] = useState<Language>(languageStore.getLanguage());

  useEffect(() => {
    languageStore.initialize().then(() => setLanguage(languageStore.getLanguage()));
    const unsub = languageStore.subscribe(setLanguage);
    return () => unsub();
  }, []);

  const selectLanguage = (value: Language) => {
    languageStore.setLanguage(value);
    setLanguage(value);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{languageStore.t('languageSettings')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        {LANGUAGE_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionRow, language === option.value && styles.optionRowActive]}
            onPress={() => selectLanguage(option.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionLabel, language === option.value && styles.optionLabelActive]}>
              {option.label}
            </Text>
            {language === option.value && <Text style={styles.optionCheck}>✓</Text>}
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
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  content: { padding: 24, gap: 12 },
  optionRow: {
    width: '100%', paddingVertical: 16, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  optionRowActive: { borderColor: Colors.navBar },
  optionLabel: { fontSize: 15, color: Colors.textPrimary },
  optionLabelActive: { fontWeight: '700' },
  optionCheck: { fontSize: 16, color: Colors.navBar },
});
