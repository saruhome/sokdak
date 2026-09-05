import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';
import { tFor, type Language, type TranslationKey } from '@/constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { BottomSheet } from '@/components/BottomSheet';
import { Ban, Check, ChevronDown, Flag, Pencil, Trash2 } from 'lucide-react-native';

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
 * - 신고 폼/완료는 고객센터 문의 폼과 동일한 바텀시트 디자인·애니메이션(운영자 지시 2026-09-02):
 *   슬라이드업 BottomSheet + 유형 드롭다운(사유 피커 시트) + 접수 완료 시트.
 *   menu → form → sending → success 상태 분리는 그대로 유지.
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
  const [reasonPickerOpen, setReasonPickerOpen] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* 새 대상이 열릴 때마다 처음(menu)부터 */
  useEffect(() => {
    if (target) {
      setStage('menu');
      setSelectedSlug(null);
      setReasonPickerOpen(false);
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

  const selectedLabel = REPORT_REASONS.find(r => r.slug === selectedSlug)?.labelKey;

  if (stage === 'menu') {
    return (
      <Modal visible transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
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
        </TouchableOpacity>
      </Modal>
    );
  }

  if (stage === 'success') {
    return (
      <BottomSheet visible onClose={onClose} panelStyle={styles.receiptPanel}>
        <View style={styles.sheetHandle} />
        <View style={styles.receiptCheckBadge}>
          <AppIcon icon={Check} size={28} color={Colors.textPrimary} />
        </View>
        <Text style={styles.receiptTitle}>{t('reportReceivedTitle')}</Text>
        <Text style={styles.receiptSub}>{t('reportReceivedMessage')}</Text>
      </BottomSheet>
    );
  }

  /* form + sending — 고객센터 문의 폼과 동일 구성: 제목/유형 드롭다운/내용 입력/구분선/전체폭 제출 */
  return (
    <>
      <BottomSheet
        visible
        onClose={stage === 'sending' ? () => {} : onClose}
        panelStyle={styles.sheetPanel}
      >
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>
          {target.kind === 'comment' ? t('reportCommentTitle') : t('reportPostTitle')}
        </Text>
        <Text style={styles.sheetSub}>{t('reportSheetSub')}</Text>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>{t('inquiryTypeLabel')}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.typeSelect}
            onPress={() => setReasonPickerOpen(true)}
            disabled={stage === 'sending'}
            activeOpacity={0.8}
          >
            <Text style={[styles.typeSelectText, selectedLabel && styles.typeSelectTextFilled]}>
              {selectedLabel ? t(selectedLabel) : t('inquiryTypePlaceholder')}
            </Text>
            <AppIcon icon={ChevronDown} size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>{t('inquiryContentLabel')}</Text>
          <TextInput
            style={styles.detailInput}
            value={freeText}
            onChangeText={setFreeText}
            placeholder={t('reportReasonPlaceholder')}
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={4}
            maxLength={300}
            editable={stage !== 'sending'}
          />
        </View>

        {submitError && <Text style={styles.errorText}>{submitError}</Text>}

        <View style={styles.sheetDivider} />
        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.submitBtn, (!selectedSlug || stage === 'sending') && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!selectedSlug || stage === 'sending'}
          activeOpacity={0.85}
          accessibilityLabel={t('reportSubmitBtn')}
          accessibilityState={{ disabled: !selectedSlug || stage === 'sending', busy: stage === 'sending' }}
        >
          <Text style={styles.submitBtnText}>
            {stage === 'sending' ? t('reportSubmittingLabel') : t('reportSubmitBtn')}
          </Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* ── 신고 사유 선택 시트 (고객센터 유형 피커와 동일 패턴) ── */}
      <BottomSheet visible={reasonPickerOpen} onClose={() => setReasonPickerOpen(false)} panelStyle={styles.pickerSheet}>
        <View style={styles.sheetHandle} />
        {REPORT_REASONS.map(({ slug, labelKey }) => (
          <TouchableOpacity
            accessibilityRole="button"
            key={slug}
            style={styles.pickerOptionRow}
            onPress={() => { setSelectedSlug(slug); setReasonPickerOpen(false); }}
            accessibilityState={{ selected: selectedSlug === slug }}
          >
            <Text style={styles.pickerOptionText}>{t(labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },

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
  menuItemText: { fontSize: 13, color: Colors.textPrimary, flexShrink: 0 },
  menuDivider: { height: 1, backgroundColor: Colors.border },

  /* ── 이하 전부 고객센터(support.tsx) 문의 시트와 동일 스펙 ── */
  sheetPanel: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: Colors.border, borderBottomWidth: 0,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32,
    gap: 16, alignItems: 'center',
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 4 },
  sheetTitle: { alignSelf: 'flex-start', fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  sheetSub: { alignSelf: 'flex-start', fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginTop: -8 },
  sheetDivider: { alignSelf: 'stretch', height: 1, backgroundColor: Colors.border },

  formField: { alignSelf: 'stretch', gap: 8 },
  formLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  typeSelect: {
    height: 44, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  typeSelectText: { fontSize: 13, color: Colors.textTertiary },
  typeSelectTextFilled: { color: Colors.textPrimary },

  detailInput: { fontFamily: 'NotoSerifKR_400Regular',
    minHeight: 88, borderRadius: 10, padding: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    fontSize: 14, color: Colors.textPrimary, textAlignVertical: 'top',
  },
  errorText: { alignSelf: 'flex-start', fontSize: 12, color: Colors.error },

  submitBtn: {
    alignSelf: 'stretch',
    height: 44, borderRadius: 10, backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },

  pickerSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: Colors.border, borderBottomWidth: 0,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32,
    alignItems: 'center',
  },
  pickerOptionRow: {
    alignSelf: 'stretch', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  pickerOptionText: { fontSize: 15, color: Colors.textPrimary },

  receiptPanel: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: Colors.border, borderBottomWidth: 0,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40,
    gap: 20, alignItems: 'center',
  },
  receiptCheckBadge: {
    width: 72, height: 72, borderRadius: 36, marginTop: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  receiptTitle: { fontSize: 19, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary, textAlign: 'center' },
  receiptSub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: -12 },
});
