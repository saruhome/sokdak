import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { AppIcon } from '@/components/AppIcon';
import { BackIcon } from '@/components/icons/SocialIcons';
import { Colors } from '@/constants/Colors';
import { COMMUNITY_GUIDELINES_VERSION, getCommunityGuidelineCopy } from '@/constants/communitySafety';
import { authStore } from '@/constants/authStore';
import { useLanguage } from '@/constants/languageStore';
import { safeGoBack } from '@/constants/navigation';
import { Check, ShieldAlert } from 'lucide-react-native';

export default function CommunityGuidelinesScreen() {
  const language = useLanguage();
  const copy = getCommunityGuidelineCopy(language);
  const checkboxA11yLabel = language === 'de' ? copy.checkboxLabel : '커뮤니티 운영정책 동의';
  const acceptA11yLabel = language === 'de' ? copy.acceptLabel : '운영정책 동의하고 계속하기';
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (!authStore.isLoggedIn()) {
      router.push('/auth/login');
      return;
    }
    if (!accepted) {
      Alert.alert(copy.agreementRequiredTitle, copy.agreementRequiredBody);
      return;
    }

    setSubmitting(true);
    const { error } = await authStore.acceptCommunityGuidelines({
      locale: language,
      source: 'community_onboarding',
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('동의 저장에 실패했어요', error);
      return;
    }
    Alert.alert(copy.acceptedTitle, copy.acceptedBody);
    safeGoBack('/tabs/mypage');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => safeGoBack('/tabs/mypage')} accessibilityLabel="뒤로가기">
          <BackIcon size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>{copy.title}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <AppIcon icon={ShieldAlert} size={22} color={Colors.point1} />
          <View style={styles.noticeTextWrap}>
            <Text style={styles.noticeTitle}>{copy.noticeTitle}</Text>
            <Text style={styles.noticeBody}>{copy.noticeBody}</Text>
          </View>
        </View>

        <Text style={styles.intro}>
          {copy.intro}
        </Text>

        <View style={styles.guidelineList}>
          {copy.guidelines.map((guideline, index) => (
            <View key={guideline} style={styles.guidelineRow}>
              <Text style={styles.guidelineNumber}>{index + 1}</Text>
              <Text style={styles.guidelineText}>{guideline}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.checkRow, accepted && styles.checkRowSelected]}
          onPress={() => setAccepted(previous => !previous)}
          accessibilityRole="checkbox"
          accessibilityLabel={checkboxA11yLabel}
          accessibilityState={{ checked: accepted }}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxSelected]}>
            {accepted && <AppIcon icon={Check} size={14} color={Colors.navBarIconActive} />}
          </View>
          <Text style={styles.checkText}>{copy.checkboxLabel}</Text>
        </Pressable>

        <Pressable
          style={[styles.acceptBtn, (!accepted || submitting) && styles.acceptBtnDisabled]}
          onPress={handleAccept}
          disabled={!accepted || submitting}
          accessibilityRole="button"
          accessibilityLabel={submitting ? copy.savingLabel : acceptA11yLabel}
          accessibilityState={{ disabled: !accepted || submitting, busy: submitting }}
        >
          <Text style={styles.acceptBtnText}>{submitting ? copy.savingLabel : copy.acceptLabel}</Text>
        </Pressable>

        <Text style={styles.version}>정책 버전 {COMMUNITY_GUIDELINES_VERSION}</Text>
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
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  content: { padding: 24, paddingBottom: 40, gap: 20 },
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16,
    borderRadius: 12, backgroundColor: Colors.point1 + '12', borderWidth: 1, borderColor: Colors.point1 + '45',
  },
  noticeTextWrap: { flex: 1, gap: 4 },
  noticeTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  noticeBody: { fontSize: 13, lineHeight: 19, color: Colors.textSecondary },
  intro: { fontSize: 14, lineHeight: 22, color: Colors.textSecondary },
  guidelineList: { gap: 12 },
  guidelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  guidelineNumber: {
    width: 22, height: 22, borderRadius: 11, overflow: 'hidden', textAlign: 'center',
    fontSize: 12, lineHeight: 22, fontWeight: '700', color: Colors.navBarIconActive, backgroundColor: Colors.navBar,
  },
  guidelineText: { flex: 1, fontSize: 14, lineHeight: 21, color: Colors.textPrimary },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14,
    borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  checkRowSelected: { borderColor: Colors.navBar },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  checkboxSelected: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  checkText: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  acceptBtn: { height: 52, borderRadius: 10, backgroundColor: Colors.navBar, alignItems: 'center', justifyContent: 'center' },
  acceptBtnDisabled: { backgroundColor: Colors.border },
  acceptBtnText: { fontSize: 15, fontWeight: '700', color: Colors.navBarIconActive },
  version: { fontSize: 11, textAlign: 'center', color: Colors.textTertiary },
});
