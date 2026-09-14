import { StyleSheet, View, ScrollView, TouchableOpacity, Linking, TextInput, Animated, Easing, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { languageStore, useLanguage, type Language } from '../../../constants/languageStore';
import { authStore } from '../../../constants/authStore';
import { fetchMyTickets, submitTicket, markRepliesSeen, type SupportTicket } from '../../../constants/support';
import { createSupportAttachmentSignedUrl } from '@/src/features/mypage/api/supportApi';
import { AppIcon } from '@/components/AppIcon';
import { BottomSheet } from '@/components/BottomSheet';
import { Mail, ChevronDown, ChevronRight, Search, Check } from 'lucide-react-native';
import { FAQ_CATEGORY_SLUGS, FAQ_CATEGORY_LABELS, FAQ_ITEMS, type FaqCategorySlug } from '@/src/features/mypage/model/supportFaq';

type InquiryTypeSlug = 'account' | 'bug' | 'billing' | 'suggestion' | 'other';
const INQUIRY_TYPE_SLUGS: InquiryTypeSlug[] = ['account', 'bug', 'billing', 'suggestion', 'other'];
const INQUIRY_TYPE_LABELS: Record<Language, Record<InquiryTypeSlug, string>> = {
  ko: { account: '로그인/계정', bug: '오류 신고', billing: '베타 이용', suggestion: '제안/의견', other: '기타' },
  en: { account: 'Login/Account', bug: 'Bug report', billing: 'Beta access', suggestion: 'Suggestion', other: 'Other' },
  ja: { account: 'ログイン/アカウント', bug: '不具合報告', billing: 'ベータ利用', suggestion: '提案/意見', other: 'その他' },
  vi: { account: 'Đăng nhập/Tài khoản', bug: 'Báo lỗi', billing: 'Sử dụng beta', suggestion: 'Đề xuất/Ý kiến', other: 'Khác' },
  es: { account: 'Inicio de sesión/Cuenta', bug: 'Reporte de error', billing: 'Acceso beta', suggestion: 'Sugerencia', other: 'Otro' },
  de: { account: 'Anmeldung/Konto', bug: 'Fehler melden', billing: 'Beta-Zugang', suggestion: 'Vorschlag', other: 'Sonstiges' },
  tr: { account: 'Giriş/Hesap', bug: 'Hata bildir', billing: 'Beta erişimi', suggestion: 'Öneri/Görüş', other: 'Diğer' },
};

/* ponytail: support_tickets에 접수번호 컬럼이 없어 row id에서 짧은 코드를 파생시킴 —
 * 실제 순번이 필요해지면 serial 컬럼 추가. */
function ticketNumberFrom(id?: string) {
  if (!id) return '—';
  return '#' + id.replace(/-/g, '').slice(-8).toUpperCase();
}

/** FAQ 답변 — 열릴 때 ease-out 200ms로 페이드인 (닫힐 때는 바로 언마운트라 애니메이션 없음) */
function FaqAnswerReveal({ text }: { text: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.faqAnswerBox, { opacity }]}>
      <Text style={styles.faqAnswer}>{text}</Text>
    </Animated.View>
  );
}

/** Figma: 229:3352 — 고객센터 (카테고리 필터 + FAQ 아코디언 + 문의하기) */
export default function SupportScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [activeCategory, setActiveCategory] = useState<FaqCategorySlug>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [loggedIn, setLoggedIn] = useState(authStore.isLoggedIn());
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryTypeSlug | null>(null);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ typeLabel: string; number: string } | null>(null);
  const [attachment, setAttachment] = useState<{ uri: string; mimeType?: string | null } | null>(null);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});

  useFocusEffect(useCallback(() => {
    setLoggedIn(authStore.isLoggedIn());
    if (authStore.isLoggedIn()) {
      fetchMyTickets().then(async list => {
        setTickets(list);
        const entries = await Promise.all(list.filter(tk => tk.imagePath).map(async tk =>
          [tk.id, await createSupportAttachmentSignedUrl(tk.imagePath)] as const));
        setAttachmentUrls(Object.fromEntries(entries.filter(([, u]) => u) as [string, string][]));
      });
      markRepliesSeen();
    }
  }, []));

  const items = FAQ_ITEMS[language];
  const visibleItems = useMemo(() => {
    const filteredByCategory = activeCategory === 'all'
      ? items
      : items.filter(item => item.category === activeCategory);
    if (!query.trim()) return filteredByCategory;
    const search = query.trim().toLowerCase();
    return filteredByCategory.filter(item =>
      item.q.toLowerCase().includes(search) || item.a.toLowerCase().includes(search)
    );
  }, [items, activeCategory, query]);

  const handleContact = () => {
    const url = 'mailto:support@sokdak.app?subject=%5B속닥%5D%20문의하기';
    Linking.openURL(url).catch(() => {
      Alert.alert(t('contactMailUnavailableTitle'), t('contactMailUnavailableBody'));
    });
  };

  const pickAttachment = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissionNeededTitle'), t('galleryPermissionMessage'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const asset = result.assets[0];
      setAttachment({ uri: asset.uri, mimeType: asset.mimeType });
    }
  };

  const handleSubmitTicket = async () => {
    const message = ticketMessage.trim();
    if (!message || !inquiryType || submitting) return;
    setSubmitting(true);
    const typeLabel = INQUIRY_TYPE_LABELS[language][inquiryType];
    /* ponytail: 문의 유형 전용 컬럼이 없어 메시지 앞에 라벨을 붙여 저장 —
     * 유형별 집계/필터링이 필요해지면 support_tickets에 type 컬럼 추가. */
    const { error } = await submitTicket(`[${typeLabel}] ${message}`, attachment);
    if (error) { setSubmitting(false); Alert.alert(t('saveFailedTitle'), error); return; }
    const latest = await fetchMyTickets();
    setTickets(latest);
    const entries = await Promise.all(latest.filter(tk => tk.imagePath).map(async tk =>
      [tk.id, await createSupportAttachmentSignedUrl(tk.imagePath)] as const));
    setAttachmentUrls(Object.fromEntries(entries.filter(([, u]) => u) as [string, string][]));
    setSubmitting(false);
    setTicketMessage('');
    setInquiryType(null);
    setAttachment(null);
    setFormOpen(false);
    setReceipt({ typeLabel, number: ticketNumberFrom(latest[0]?.id) });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" style={styles.backBtn} onPress={() => safeGoBack('/tabs/mypage')}>
          <AppIcon icon={ChevronRight} size={20} color={Colors.navBarIconActive} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('customerService')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBarWrap}>
          <View style={styles.searchBar}>
            <AppIcon icon={Search} size={15} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('faqSearchPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
          </View>
        </View>
        {/* ── 카테고리 필터 ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {FAQ_CATEGORY_SLUGS.map(slug => (
            <TouchableOpacity accessibilityRole="button"
              key={slug}
              style={[styles.categoryChip, activeCategory === slug && styles.categoryChipActive]}
              onPress={() => { setActiveCategory(slug); setOpenIndex(null); }}
            >
              <Text style={[styles.categoryChipText, activeCategory === slug && styles.categoryChipTextActive]}>
                {FAQ_CATEGORY_LABELS[language][slug]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.faqGroup}>
          {visibleItems.map((item, i) => {
            const open = openIndex === i;
            return (
              <View key={item.q}>
                <TouchableOpacity accessibilityRole="button"
                  style={styles.faqQuestionRow}
                  onPress={() => setOpenIndex(open ? null : i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>
                    <Text style={styles.faqQPrefix}>Q. </Text>
                    {item.q}
                  </Text>
                  <AppIcon
                    icon={ChevronDown} size={16} color={Colors.textTertiary}
                    style={open ? { transform: [{ rotate: '180deg' }] } : undefined}
                  />
                </TouchableOpacity>
                {open && <FaqAnswerReveal text={item.a} />}
              </View>
            );
          })}
        </View>

        {/* ── 문의하기 ── 로그인 시 인앱 문의함(운영진이 Supabase Studio에서 직접 답변 입력),
         *  비로그인은 기존 mailto 카드로 폴백(추가 인프라 없이 이미 동작하던 경로 재사용) */}
        {loggedIn ? (
          <View style={styles.inquirySection}>
            <TouchableOpacity accessibilityRole="button" style={styles.inquiryTriggerCard} onPress={() => setFormOpen(true)} activeOpacity={0.85}>
              <View style={styles.contactTitleRow}>
                <AppIcon icon={Mail} size={16} color={Colors.textPrimary} />
                <Text style={styles.contactTitle}>{t('contactDirectly')}</Text>
              </View>
              <AppIcon icon={ChevronRight} size={16} color={Colors.textTertiary} />
            </TouchableOpacity>

            <Text style={[styles.contactTitle, styles.myInquiriesTitle]}>{t('myInquiriesTitle')}</Text>
            {tickets.length === 0 && (
              <Text style={styles.inquiryEmpty}>{t('inquiryEmptyText')}</Text>
            )}
            {tickets.map(ticket => (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketHeaderRow}>
                  <View style={[styles.ticketStatusPill, ticket.status === 'answered' && styles.ticketStatusPillAnswered]}>
                    <Text style={[styles.ticketStatusText, ticket.status === 'answered' && styles.ticketStatusTextAnswered]}>
                      {ticket.status === 'answered' ? t('inquiryStatusAnswered') : t('inquiryStatusOpen')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ticketMessage}>{ticket.message}</Text>
                  {attachmentUrls[ticket.id] ? (
                    <Image source={{ uri: attachmentUrls[ticket.id] }} style={styles.ticketAttachment} />
                  ) : null}
                {ticket.reply && (
                  <View style={styles.ticketReplyBox}>
                    <Text style={styles.ticketReplyLabel}>{t('inquiryReplyLabel')}</Text>
                    <Text style={styles.ticketReplyText}>{ticket.reply}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity accessibilityRole="button" style={styles.contactCard} onPress={handleContact} activeOpacity={0.85}>
            <View style={styles.contactTitleRow}>
              <AppIcon icon={Mail} size={16} color={Colors.textPrimary} />
              <Text style={styles.contactTitle}>{t('contactDirectly')}</Text>
            </View>
            <Text style={styles.contactSub}>support@sokdak.app</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ── 직접 문의하기 폼 시트 ── */}
      <BottomSheet visible={formOpen} onClose={() => setFormOpen(false)} panelStyle={styles.sheetPanel}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{t('contactDirectly')}</Text>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>{t('inquiryTypeLabel')}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.typeSelect} onPress={() => setTypePickerOpen(true)} activeOpacity={0.8}>
            <Text style={[styles.typeSelectText, inquiryType && styles.typeSelectTextFilled]}>
              {inquiryType ? INQUIRY_TYPE_LABELS[language][inquiryType] : t('inquiryTypePlaceholder')}
            </Text>
            <AppIcon icon={ChevronDown} size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>{t('inquiryContentLabel')}</Text>
          <TextInput
            style={styles.inquiryInput}
            placeholder={t('inquiryPlaceholder')}
            placeholderTextColor={Colors.textTertiary}
            value={ticketMessage}
            onChangeText={setTicketMessage}
            multiline
            numberOfLines={4}
          />
          {attachment ? (
            <View style={styles.attachPreviewRow}>
              <Image source={{ uri: attachment.uri }} style={styles.attachPreview} />
              <TouchableOpacity accessibilityRole="button" onPress={() => setAttachment(null)} hitSlop={8}>
                <Text style={styles.attachRemoveText}>{t('removePhoto')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity accessibilityRole="button" style={styles.attachBtn} onPress={pickAttachment} activeOpacity={0.8}>
              <Text style={styles.attachBtnText}>📷 {t('addPhoto')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sheetDivider} />
        <TouchableOpacity accessibilityRole="button"
          style={[styles.inquirySubmitBtn, (!ticketMessage.trim() || !inquiryType || submitting) && styles.inquirySubmitBtnDisabled]}
          onPress={handleSubmitTicket}
          disabled={!ticketMessage.trim() || !inquiryType || submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.inquirySubmitBtnText}>{t('inquirySubmitBtn')}</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* ── 문의 유형 선택 시트 ── */}
      <BottomSheet visible={typePickerOpen} onClose={() => setTypePickerOpen(false)} panelStyle={styles.typePickerSheet}>
        <View style={styles.sheetHandle} />
        {INQUIRY_TYPE_SLUGS.map(slug => (
          <TouchableOpacity accessibilityRole="button"
            key={slug}
            style={styles.typeOptionRow}
            onPress={() => { setInquiryType(slug); setTypePickerOpen(false); }}
          >
            <Text style={styles.typeOptionText}>{INQUIRY_TYPE_LABELS[language][slug]}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>

      {/* ── 접수 완료 ── */}
      <BottomSheet visible={!!receipt} onClose={() => setReceipt(null)} panelStyle={styles.receiptPanel}>
        <View style={styles.sheetHandle} />
        <View style={styles.receiptCheckBadge}>
          <AppIcon icon={Check} size={28} color={Colors.textPrimary} />
        </View>
        <Text style={styles.receiptTitle}>{t('inquirySubmittedTitle')}</Text>
        <Text style={styles.receiptSub}>{t('inquirySubmittedSub')}</Text>
        <View style={styles.receiptDetails}>
          <Text style={styles.receiptDetailLabel}>{t('inquiryReceiptTypeLabel')}</Text>
          <Text style={styles.receiptDetailValue}>{receipt?.typeLabel}</Text>
          <Text style={styles.receiptDetailLabel}>{t('inquiryReceiptNumberLabel')}</Text>
          <Text style={styles.receiptDetailValue}>{receipt?.number}</Text>
          <Text style={styles.receiptDetailLabel}>{t('inquiryReceiptEtaLabel')}</Text>
          <Text style={styles.receiptDetailValue}>{t('inquiryEtaValue')}</Text>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  attachBtn: {
    marginTop: 10, height: 40, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  attachBtnText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'NotoSerifKR_600SemiBold' },
  attachPreviewRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  attachPreview: { width: 64, height: 64, borderRadius: 8, backgroundColor: Colors.divider },
  attachRemoveText: { fontSize: 13, color: Colors.error },
  ticketAttachment: { width: 96, height: 96, borderRadius: 8, marginTop: 8, backgroundColor: Colors.divider },
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.navBar,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },

  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  /* 카테고리 화면 검색바(Controls/Search Bar)와 동일한 디자인 */
  searchBarWrap: { paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 36, borderRadius: 8, paddingHorizontal: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: 'NotoSerifKR_400Regular' },

  categoryRow: { gap: 6, paddingVertical: 16 },
  categoryChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, // 알약 모양
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  categoryChipActive: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  categoryChipText: { fontSize: 12, color: Colors.textPrimary },
  categoryChipTextActive: { color: Colors.navBarIconActive },

  faqGroup: { width: '100%', gap: 12 },
  faqQuestionRow: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  faqQuestion: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  faqQPrefix: { fontFamily: 'NotoSerifKR_600SemiBold' },
  faqAnswerBox: {
    padding: 16, backgroundColor: Colors.surface,
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: Colors.border,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
  },
  faqAnswer: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  /* marginHorizontal 없음 — scroll의 paddingHorizontal:24가 이미 검색창과 동일한 폭을 준다 */
  contactCard: {
    marginTop: 24,
    padding: 16, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.textTertiary,
    gap: 4,
  },
  contactTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactTitle: { fontSize: 15, color: Colors.textPrimary, fontWeight: '600' },
  contactSub: { fontSize: 12, color: Colors.textTertiary },

  /* 인앱 문의하기 (로그인 사용자) — 폼은 시트로 열리고, 이 행은 그 트리거 */
  inquirySection: { marginTop: 24, gap: 10 },
  inquiryTriggerCard: {
    padding: 16, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.textTertiary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inquiryInput: { fontFamily: 'NotoSerifKR_400Regular',
    minHeight: 88, borderRadius: 10, padding: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    fontSize: 14, color: Colors.textPrimary, textAlignVertical: 'top',
  },
  inquirySubmitBtn: {
    alignSelf: 'stretch',
    height: 44, borderRadius: 10, backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center',
  },
  inquirySubmitBtnDisabled: { opacity: 0.4 },
  inquirySubmitBtnText: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  myInquiriesTitle: { marginTop: 12 },
  inquiryEmpty: { fontSize: 13, color: Colors.textTertiary, paddingVertical: 12, textAlign: 'center' },

  ticketCard: {
    padding: 14, borderRadius: 10, gap: 8,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  ticketHeaderRow: { flexDirection: 'row' },
  ticketStatusPill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    backgroundColor: Colors.divider,
  },
  ticketStatusPillAnswered: { backgroundColor: Colors.accent + '20' },
  ticketStatusText: { fontSize: 11, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textSecondary },
  ticketStatusTextAnswered: { color: Colors.accent },
  ticketMessage: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  ticketReplyBox: {
    padding: 10, borderRadius: 8, gap: 2,
    backgroundColor: Colors.background, borderLeftWidth: 2, borderLeftColor: Colors.accent,
  },
  ticketReplyLabel: { fontSize: 11, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.accent },
  ticketReplyText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  /* ── 문의하기/유형선택/접수완료 공용 바텀시트 ── */
  sheetPanel: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: Colors.border, borderBottomWidth: 0,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32,
    gap: 16, alignItems: 'center',
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 4 },
  sheetTitle: { alignSelf: 'flex-start', fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
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

  typePickerSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: Colors.border, borderBottomWidth: 0,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32,
    alignItems: 'center',
  },
  typeOptionRow: {
    alignSelf: 'stretch', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  typeOptionText: { fontSize: 15, color: Colors.textPrimary },

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
  receiptDetails: { alignSelf: 'stretch', gap: 3 },
  receiptDetailLabel: { fontSize: 12, color: Colors.textTertiary },
  receiptDetailValue: { fontSize: 13, color: Colors.textPrimary, marginBottom: 6 },
});
