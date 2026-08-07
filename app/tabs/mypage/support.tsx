import {
  StyleSheet, View, SafeAreaView, ScrollView,
  TouchableOpacity, Linking, TextInput, Animated, Easing,
} from 'react-native';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { languageStore, useLanguage, type Language } from '../../../constants/languageStore';
import { authStore } from '../../../constants/authStore';
import { fetchMyTickets, submitTicket, markRepliesSeen, type SupportTicket } from '../../../constants/support';
import { AppIcon } from '@/components/AppIcon';
import { Mail, ChevronDown, ChevronRight, Search, Mic } from 'lucide-react-native';

type FaqCategorySlug = 'all' | 'howTo' | 'account' | 'suggest' | 'community';
const FAQ_CATEGORY_SLUGS: FaqCategorySlug[] = ['all', 'howTo', 'account', 'suggest', 'community'];
const FAQ_CATEGORY_LABELS: Record<Language, Record<FaqCategorySlug, string>> = {
  ko: { all: '전체', howTo: '이용 방법', account: '회원정보', suggest: '제안하기', community: '커뮤니티' },
  en: { all: 'All', howTo: 'How to use', account: 'Account', suggest: 'Suggestions', community: 'Community' },
  ja: { all: 'すべて', howTo: '使い方', account: 'アカウント', suggest: '提案する', community: 'コミュニティ' },
  vi: { all: 'Tất cả', howTo: 'Cách dùng', account: 'Tài khoản', suggest: 'Đề xuất', community: 'Cộng đồng' },
  es: { all: 'Todos', howTo: 'Cómo usar', account: 'Cuenta', suggest: 'Sugerencias', community: 'Comunidad' },
};

type FaqItem = { category: Exclude<FaqCategorySlug, 'all'>; q: string; a: string };
const FAQ_ITEMS: Record<Language, FaqItem[]> = {
  ko: [
    { category: 'howTo', q: '속닥은 어떤 앱인가요?', a: '한국 거주 외국인 중·고급 학습자를 위한 한국어 신조어 학습 앱이에요. 교과서에는 없는 진짜 생활 한국어를 배울 수 있어요.' },
    { category: 'howTo', q: '단어는 어떻게 저장하나요?', a: "단어 상세 화면에서 '저장' 버튼을 누르면 마이페이지 > 즐겨찾기에서 모아볼 수 있어요." },
    { category: 'suggest', q: '신조어를 제안하고 싶어요.', a: "마이페이지 > 신조어 제안하기 메뉴에서 원하는 단어와 뜻을 제안할 수 있어요. 검토 후 사전에 반영돼요." },
    { category: 'account', q: '로그인 없이도 이용할 수 있나요?', a: '사전 검색과 커뮤니티 글 읽기는 로그인 없이 가능해요. 단어 저장, 글쓰기, 댓글 작성은 로그인이 필요해요.' },
    { category: 'community', q: '커뮤니티 이용 규칙이 궁금해요.', a: '서로 존중하는 학습 커뮤니티를 지향해요. 욕설, 광고, 혐오 표현은 제재될 수 있어요.' },
  ],
  en: [
    { category: 'howTo', q: 'What kind of app is SokDak?', a: 'A Korean slang-learning app for intermediate-advanced foreign residents of Korea. Learn real, everyday Korean you won’t find in textbooks.' },
    { category: 'howTo', q: 'How do I save a word?', a: "Tap 'Save' on a word's detail screen — saved words show up under My Page > Saved Words." },
    { category: 'suggest', q: 'I want to suggest a new slang word.', a: "Use My Page > Suggest New Slang to submit a word and its meaning. It'll be added to the dictionary after review." },
    { category: 'account', q: 'Can I use the app without logging in?', a: 'Dictionary search and reading community posts don’t require login. Saving words, writing posts, and commenting do.' },
    { category: 'community', q: 'What are the community rules?', a: 'We aim for a respectful learning community. Profanity, ads, and hate speech may be moderated.' },
  ],
  ja: [
    { category: 'howTo', q: 'ソクダクはどんなアプリですか？', a: '韓国在住の中〜上級外国人学習者向けの韓国語新造語学習アプリです。教科書にはないリアルな生活韓国語が学べます。' },
    { category: 'howTo', q: '単語はどうやって保存しますか？', a: '単語詳細画面で「保存」ボタンを押すと、マイページ＞お気に入りでまとめて見られます。' },
    { category: 'suggest', q: '新造語を提案したいです。', a: 'マイページ＞新造語を提案するメニューで、単語と意味を提案できます。検討のうえ辞書に反映されます。' },
    { category: 'account', q: 'ログインなしでも利用できますか？', a: '辞書検索とコミュニティ投稿の閲覧はログインなしで可能です。単語の保存、投稿、コメントの作成にはログインが必要です。' },
    { category: 'community', q: 'コミュニティの利用ルールを知りたいです。', a: 'お互いを尊重する学習コミュニティを目指しています。暴言、広告、ヘイト表現は制限の対象になることがあります。' },
  ],
  vi: [
    { category: 'howTo', q: 'SokDak là ứng dụng gì?', a: 'Ứng dụng học từ lóng tiếng Hàn dành cho người nước ngoài trình độ trung-cao cấp đang sống tại Hàn Quốc. Bạn có thể học tiếng Hàn đời thường thực sự không có trong sách giáo khoa.' },
    { category: 'howTo', q: 'Làm sao để lưu từ?', a: "Nhấn nút 'Lưu' ở màn hình chi tiết từ, bạn có thể xem lại ở Trang cá nhân > Yêu thích." },
    { category: 'suggest', q: 'Tôi muốn đề xuất một từ lóng mới.', a: 'Vào Trang cá nhân > Đề xuất từ mới để gửi từ và ý nghĩa bạn muốn. Từ sẽ được thêm vào từ điển sau khi xem xét.' },
    { category: 'account', q: 'Tôi có thể dùng ứng dụng mà không cần đăng nhập không?', a: 'Bạn có thể tìm kiếm từ điển và đọc bài viết cộng đồng mà không cần đăng nhập. Lưu từ, viết bài và bình luận thì cần đăng nhập.' },
    { category: 'community', q: 'Quy tắc sử dụng cộng đồng là gì?', a: 'Chúng tôi hướng đến một cộng đồng học tập tôn trọng lẫn nhau. Ngôn từ thô tục, quảng cáo và phát ngôn thù ghét có thể bị xử lý.' },
  ],
  es: [
    { category: 'howTo', q: '¿Qué tipo de app es SokDak?', a: 'Una app para aprender jerga coreana pensada para residentes extranjeros de nivel intermedio-avanzado en Corea. Aprende coreano real y cotidiano que no encontrarás en los libros de texto.' },
    { category: 'howTo', q: '¿Cómo guardo una palabra?', a: "Toca 'Guardar' en la pantalla de detalle de la palabra; podrás verlas en Mi página > Favoritos." },
    { category: 'suggest', q: 'Quiero sugerir una palabra de jerga nueva.', a: 'Ve a Mi página > Sugerir jerga nueva para enviar la palabra y su significado. Se añadirá al diccionario tras la revisión.' },
    { category: 'account', q: '¿Puedo usar la app sin iniciar sesión?', a: 'Puedes buscar en el diccionario y leer publicaciones de la comunidad sin iniciar sesión. Para guardar palabras, escribir publicaciones y comentar necesitas iniciar sesión.' },
    { category: 'community', q: '¿Cuáles son las normas de la comunidad?', a: 'Buscamos una comunidad de aprendizaje respetuosa. El lenguaje ofensivo, la publicidad y el discurso de odio pueden ser moderados.' },
  ],
};

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
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoggedIn(authStore.isLoggedIn());
    if (authStore.isLoggedIn()) {
      fetchMyTickets().then(setTickets);
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

  const handleSubmitTicket = async () => {
    const message = ticketMessage.trim();
    if (!message || submitting) return;
    setSubmitting(true);
    const { error } = await submitTicket(message);
    setSubmitting(false);
    if (error) { Alert.alert(t('saveFailedTitle'), error); return; }
    setTicketMessage('');
    Alert.alert(t('inquirySubmittedAlert'));
    fetchMyTickets().then(setTickets);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
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
            <AppIcon icon={Mic} size={15} />
          </View>
        </View>
        {/* ── 카테고리 필터 ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {FAQ_CATEGORY_SLUGS.map(slug => (
            <TouchableOpacity
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
                <TouchableOpacity
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
            <Text style={styles.contactTitle}>{t('contactDirectly')}</Text>
            <TextInput
              style={styles.inquiryInput}
              placeholder={t('inquiryPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              value={ticketMessage}
              onChangeText={setTicketMessage}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.inquirySubmitBtn, (!ticketMessage.trim() || submitting) && styles.inquirySubmitBtnDisabled]}
              onPress={handleSubmitTicket}
              disabled={!ticketMessage.trim() || submitting}
              activeOpacity={0.85}
            >
              <Text style={styles.inquirySubmitBtnText}>{t('inquirySubmitBtn')}</Text>
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
          <TouchableOpacity style={styles.contactCard} onPress={handleContact} activeOpacity={0.85}>
            <View style={styles.contactTitleRow}>
              <AppIcon icon={Mail} size={16} color={Colors.textPrimary} />
              <Text style={styles.contactTitle}>{t('contactDirectly')}</Text>
            </View>
            <Text style={styles.contactSub}>support@sokdak.app</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },

  categoryRow: { gap: 6, paddingVertical: 16 },
  categoryChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  categoryChipActive: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  categoryChipText: { fontSize: 12, color: Colors.textPrimary, fontFamily: undefined },
  categoryChipTextActive: { color: Colors.navBarIconActive },

  faqGroup: { width: '100%', gap: 12 },
  faqQuestionRow: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  faqQuestion: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontFamily: undefined },
  faqQPrefix: { fontFamily: 'NotoSerifKR_600SemiBold' },
  faqAnswerBox: {
    padding: 16, backgroundColor: Colors.surface,
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: Colors.border,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
  },
  faqAnswer: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontFamily: undefined },

  /* marginHorizontal 없음 — scroll의 paddingHorizontal:24가 이미 검색창과 동일한 폭을 준다 */
  contactCard: {
    marginTop: 24,
    padding: 16, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.textTertiary,
    gap: 4,
  },
  contactTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactTitle: { fontSize: 15, color: Colors.textPrimary, fontFamily: undefined, fontWeight: '600' },
  contactSub: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },

  /* 인앱 문의하기 (로그인 사용자) */
  inquirySection: { marginTop: 24, gap: 10 },
  inquiryInput: {
    minHeight: 88, borderRadius: 10, padding: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    fontSize: 14, color: Colors.textPrimary, textAlignVertical: 'top',
  },
  inquirySubmitBtn: {
    height: 44, borderRadius: 10, backgroundColor: Colors.navBar,
    alignItems: 'center', justifyContent: 'center',
  },
  inquirySubmitBtnDisabled: { opacity: 0.4 },
  inquirySubmitBtnText: { fontSize: 14, fontWeight: '600', color: Colors.navBarIconActive },
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
  ticketStatusText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  ticketStatusTextAnswered: { color: Colors.accent },
  ticketMessage: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20, fontFamily: undefined },
  ticketReplyBox: {
    padding: 10, borderRadius: 8, gap: 2,
    backgroundColor: Colors.background, borderLeftWidth: 2, borderLeftColor: Colors.accent,
  },
  ticketReplyLabel: { fontSize: 11, fontWeight: '600', color: Colors.accent },
  ticketReplyText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, fontFamily: undefined },
});
