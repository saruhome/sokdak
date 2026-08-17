import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';
import { languageStore, useLanguage } from '@/constants/languageStore';
import { Mic } from 'lucide-react-native';

type PermissionDialogMode = 'retry' | 'settings';

export function VoiceSearchPermissionDialog({
  mode,
  onClose,
  onRetryPermission,
  onOpenSettings,
}: {
  mode: PermissionDialogMode | null;
  onClose: () => void;
  onRetryPermission: () => void;
  onOpenSettings: () => void;
}) {
  useLanguage();
  const t = languageStore.t;
  const opensSettings = mode === 'settings';

  return (
    <Modal
      transparent
      animationType="fade"
      visible={mode !== null}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.iconWrap}>
            <Mic size={23} color={Colors.point1} strokeWidth={1.8} />
          </View>
          <Text style={styles.title}>{t('voiceSearchPermissionTitle')}</Text>
          <Text style={styles.message}>
            {opensSettings ? t('voiceSearchPermissionSettingsMessage') : t('voiceSearchPermissionRationale')}
          </Text>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('cancelLabel')}
            >
              <Text style={styles.secondaryLabel}>{t('cancelLabel')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={opensSettings ? onOpenSettings : onRetryPermission}
              accessibilityRole="button"
              accessibilityLabel={opensSettings ? t('voiceSearchOpenSettingsLabel') : t('voiceSearchRetryPermissionLabel')}
            >
              <Text style={styles.primaryLabel}>
                {opensSettings ? t('voiceSearchOpenSettingsLabel') : t('voiceSearchRetryPermissionLabel')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(31, 36, 29, 0.46)',
  },
  dialog: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 18,
    backgroundColor: Colors.pageBackground,
  },
  iconWrap: {
    width: 46,
    height: 46,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: Colors.point1 + '16',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 19,
    lineHeight: 26,
    fontFamily: 'NotoSerifKR_600SemiBold',
  },
  message: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24,
  },
  secondaryButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  primaryButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.navBar,
  },
  secondaryLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  primaryLabel: { color: Colors.navBarIconActive, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.78 },
});
