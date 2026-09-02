import { Modal, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { languageStore } from '@/constants/languageStore';
import { authStore, BETA_UNLIMITED_ENTITLEMENTS } from '@/constants/authStore';
import { isLockedWord, type Word } from '@/constants/words';

/** 잠긴 속어 탭의 공통 분기(사전 목록·검색 공유) —
 * 성인 미확인: 만 19세 확인 대화상자부터. 확인(또는 이미 확인) 후 프리미엄이면 상세로,
 * 비프리미엄이면 캐릭터 팝업(showLockModal)으로 결제 유도. */
export function gateLockedWord(word: Word, showLockModal: () => void) {
  const goDetail = () => router.push(`/tabs/dictionary/${word.id}`);
  if (!isLockedWord(word)) { goDetail(); return; }
  const hasPremium = BETA_UNLIMITED_ENTITLEMENTS || authStore.isPremium();
  if (!authStore.isAdultVerified()) {
    authStore.promptAdultVerification(() => { if (hasPremium) goDetail(); else showLockModal(); }, () => {});
    return;
  }
  showLockModal();
}

const HORANG_CHEER = require('../assets/characters/transparent/horang-cheer.png');

/** 잠긴 단어의 뜻·로마자에 씌우는 블러 근사 — RN 네이티브에 텍스트 blur가 없어
 * 투명 글자 + 그림자 번짐(textShadowRadius)으로 크로스 플랫폼 동일하게 처리. */
export const lockedTextStyle = {
  color: 'transparent',
  textShadowColor: 'rgba(107, 103, 96, 0.55)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 6,
} as const;

/** 속어(프리미엄 전용) 단어 진입 차단 팝업 — 호랭이가 프리미엄 결제를 권한다.
 * 사전 목록·검색·단어 상세가 공유. */
export function PremiumLockModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = languageStore.t;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Image source={HORANG_CHEER} style={styles.mascot} resizeMode="contain" />
          <Text style={styles.title}>{t('premiumWordLockedTitle')}</Text>
          <Text style={styles.body}>{t('premiumWordLockedBody')}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.cta}
            activeOpacity={0.85}
            onPress={() => { onClose(); router.push('/tabs/mypage/premium'); }}
          >
            <Text style={styles.ctaText}>{t('premiumUpgradeCta')}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.closeBtn} onPress={onClose} hitSlop={8}>
            <Text style={styles.closeText}>{t('cancelLabel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(30, 29, 26, 0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  card: {
    width: '100%', maxWidth: 300, borderRadius: 16,
    backgroundColor: Colors.background, alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, gap: 8,
  },
  mascot: { width: 96, height: 110 },
  title: { fontSize: 17, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, textAlign: 'center' },
  body: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, textAlign: 'center' },
  cta: {
    alignSelf: 'stretch', height: 44, borderRadius: 8, marginTop: 8,
    backgroundColor: Colors.premium, alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, fontFamily: undefined },
  closeBtn: { minHeight: 44, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 13, color: Colors.textTertiary, fontFamily: undefined },
});
