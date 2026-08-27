import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';
import { tFor, type Language, type TranslationKey } from '@/constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { Ban, Flag, Pencil, Trash2 } from 'lucide-react-native';

export type SafetyTarget = { kind: 'post' | 'comment'; isOwner: boolean };

/** 서버 reports.reason에 남는 안정적인 slug — UI 라벨은 locale별, 저장값은 이 값 고정 */
const REPORT_REASONS: { slug: string; labelKey: TranslationKey }[] = [
  { slug: 'harassment-hate', labelKey: 'reportReasonHarassment' },
  { slug: 'personal-information', labelKey: 'reportReasonPersonalInfo' },
  { slug: 'spam-ad', labelKey: 'reportReasonSpam' },
  { slug: 'misinformation', labelKey: 'reportReasonMisinformation' },
  { slug: 'other', labelKey: 'reportReasonOther' },
];

/** 서버 contract는 reason string 하나 — 선택한 slug와 자유 입력을 한 문자열로 안전하게 합친다 */
export function composeReportReason(slug: string, freeText: string): string {
  const detail = freeText.trim();
  return detail ? `[${slug}] ${detail}` : `[${slug}]`;
}

/**
 * 게시글/댓글 공용 안전 액션 시트.
 * - 내 글: 수정/삭제 (동작은 콜백 — 삭제 확인은 부모의 confirm 다이얼로그가 담당)
 * - 남의 글: 신고/차단 (차단 확인도 부모 담당)
 * - 신고는 사유 chip 1개 선택이 필수, 자유 입력은 선택. menu → form → sending → success
 *   상태를 내부에서 분리해 사용자가 결과를 예측할 수 있게 한다.
 */
export function CommunitySafetyActionSheet({
  language,
  target,
  anchorTop,
  onClose,
  onEdit,
  onDelete,
  onBlock,
  onSubmitReport,
}: {
  language: Language;
  target: SafetyTarget | null;
  anchorTop: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onBlock: () => void;
  onSubmitReport: (reason: string) => Promise<{ error: string | null }>;
}) {
  const t = (key: TranslationKey) => tFor(language, key);
  const [stage, setStage] = useState<'menu' | 'form' | 'sending' | 'success'>('menu');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* 새 대상이 열릴 때마다 처음(menu)부터 */
  useEffect(() => {
    if (target) {
      setStage('menu');
      setSelectedSlug(null);
      setFreeText('');
      setSubmitError(null);
    }
  }, [target]);

  if (!target) return null;

  const handleSubmit = async () => {
    if (!selectedSlug) return;
    setStage('sending');
    setSubmitError(null);
    const { error } = await onSubmitReport(composeReportReason(selectedSlug, freeText));
    if (error) {
      setSubmitError(error);
      setStage('form');
      return;
    }
    setStage('success');
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={[styles.backdrop, stage !== 'menu' && styles.backdropCentered]}
        activeOpacity={1}
        onPress={stage === 'sending' ? undefined : onClose}
      >
        {stage === 'menu' ? (
          <View style={[styles.menuSheet, { top: anchorTop }]}>
            {target.isOwner ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={onEdit} accessibilityRole="button">
                  <AppIcon icon={Pencil} size={14} color={Colors.textPrimary} />
                  <Text style={styles.menuItemText}>{t('editLabel')}</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={onDelete} accessibilityRole="button">
                  <AppIcon icon={Trash2} size={14} color={Colors.textPrimary} />
                  <Text style={styles.menuItemText}>{t('deleteLabel')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={() => setStage('form')} accessibilityRole="button">
                  <AppIcon icon={Flag} size={14} color={Colors.textPrimary} />
                  <Text style={styles.menuItemText}>{t('reportLabel')}</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={onBlock} accessibilityRole="button">
                  <AppIcon icon={Ban} size={14} color={Colors.textPrimary} />
                  <Text style={styles.menuItemText}>{t('blockLabel')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : stage === 'success' ? (
          <TouchableOpacity style={styles.card} activeOpacity={1}>
            <Text style={styles.cardTitle}>{t('reportReceivedTitle')}</Text>
            <Text style={styles.cardSub}>{t('reportReceivedMessage')}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={onClose} accessibilityRole="button">
              <Text style={styles.primaryBtnText}>{t('confirmLabel')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          /* form + sending */
          <TouchableOpacity style={styles.card} activeOpacity={1}>
            <Text style={styles.cardTitle}>
              {target.kind === 'comment' ? t('reportCommentTitle') : t('reportPostTitle')}
            </Text>
            <Text style={styles.cardSub}>{t('reportSheetSub')}</Text>

            <View style={styles.chipWrap}>
              {REPORT_REASONS.map(({ slug, labelKey }) => {
                const selected = selectedSlug === slug;
                return (
                  <TouchableOpacity
                    key={slug}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setSelectedSlug(slug)}
                    disabled={stage === 'sending'}
                    accessibilityRole="button"
                    accessibilityLabel={t(labelKey)}
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t(labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.detailInput}
              value={freeText}
              onChangeText={setFreeText}
              placeholder={t('reportReasonPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              multiline
              maxLength={300}
              editable={stage !== 'sending'}
            />

            {submitError && <Text style={styles.errorText}>{submitError}</Text>}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={stage === 'sending'}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>{t('cancelLabel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, styles.actionsPrimary, (!selectedSlug || stage === 'sending') && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={!selectedSlug || stage === 'sending'}
                accessibilityRole="button"
                accessibilityLabel={t('reportSubmitBtn')}
                accessibilityState={{ disabled: !selectedSlug || stage === 'sending', busy: stage === 'sending' }}
              >
                <Text style={styles.primaryBtnText}>
                  {stage === 'sending' ? t('reportSubmittingLabel') : t('reportSubmitBtn')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  backdropCentered: { justifyContent: 'center' },

  /* 케밥 메뉴 — 기존 [id].tsx menuSheet와 동일 스펙 */
  menuSheet: {
    position: 'absolute', right: 6, width: 92,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, overflow: 'hidden',
    shadowColor: '#909090', shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  menuItem: {
    minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12,
  },
  menuItemText: { fontSize: 13, color: Colors.textPrimary, fontFamily: undefined, flexShrink: 0 },
  menuDivider: { height: 1, backgroundColor: Colors.border },

  /* 신고 form/성공 카드 — 기존 reportSheet와 동일 스펙 */
  card: {
    marginHorizontal: 24, padding: 20, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 36, paddingHorizontal: 12, justifyContent: 'center',
    borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipSelected: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  chipText: { fontSize: 12, color: Colors.textSecondary },
  chipTextSelected: { color: Colors.navBarIconActive, fontWeight: '700' },

  detailInput: {
    minHeight: 64, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background, padding: 12,
    fontSize: 14, color: Colors.textPrimary, textAlignVertical: 'top',
  },
  errorText: { fontSize: 12, color: Colors.error },

  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelText: { fontSize: 14, color: Colors.textSecondary },
  primaryBtn: {
    height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar, paddingHorizontal: 16,
  },
  actionsPrimary: { flex: 1 },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive },
  btnDisabled: { backgroundColor: Colors.border },
});
