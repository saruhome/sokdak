import {
  StyleSheet, View, SafeAreaView, ScrollView,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { AppIcon } from '@/components/AppIcon';
import { Mail, ChevronDown, ChevronRight } from 'lucide-react-native';

const FAQ_CATEGORIES = ['전체', '이용 방법', '회원정보', '제안하기', '커뮤니티'] as const;
type FaqCategory = (typeof FAQ_CATEGORIES)[number];

const FAQ_ITEMS: { category: Exclude<FaqCategory, '전체'>; q: string; a: string }[] = [
  { category: '이용 방법', q: '속닥은 어떤 앱인가요?', a: '한국 거주 외국인 중·고급 학습자를 위한 한국어 신조어 학습 앱이에요. 교과서에는 없는 진짜 생활 한국어를 배울 수 있어요.' },
  { category: '이용 방법', q: '단어는 어떻게 저장하나요?', a: "단어 상세 화면에서 '저장' 버튼을 누르면 마이페이지 > 즐겨찾기에서 모아볼 수 있어요." },
  { category: '제안하기', q: '신조어를 제안하고 싶어요.', a: "마이페이지 > 신조어 제안하기 메뉴에서 원하는 단어와 뜻을 제안할 수 있어요. 검토 후 사전에 반영돼요." },
  { category: '회원정보', q: '로그인 없이도 이용할 수 있나요?', a: '사전 검색과 커뮤니티 글 읽기는 로그인 없이 가능해요. 단어 저장, 글쓰기, 댓글 작성은 로그인이 필요해요.' },
  { category: '커뮤니티', q: '커뮤니티 이용 규칙이 궁금해요.', a: '서로 존중하는 학습 커뮤니티를 지향해요. 욕설, 광고, 혐오 표현은 제재될 수 있어요.' },
];

/** Figma: 229:3352 — 고객센터 (카테고리 필터 + FAQ 아코디언 + 문의하기) */
export default function SupportScreen() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('전체');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visibleItems = activeCategory === '전체'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter(item => item.category === activeCategory);

  const handleContact = () => {
    const url = 'mailto:support@sokdak.app?subject=%5B속닥%5D%20문의하기';
    Linking.openURL(url).catch(() => {
      Alert.alert('메일 앱을 열 수 없어요', 'support@sokdak.app 으로 직접 문의해주세요.');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <AppIcon icon={ChevronRight} size={20} color={Colors.navBarIconActive} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>고객센터</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── 카테고리 필터 ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {FAQ_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => { setActiveCategory(cat); setOpenIndex(null); }}
            >
              <Text style={[styles.categoryChipText, activeCategory === cat && styles.categoryChipTextActive]}>
                {cat}
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
                {open && (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswer}>{item.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── 직접 문의하기 ── */}
        <TouchableOpacity style={styles.contactCard} onPress={handleContact} activeOpacity={0.85}>
          <View style={styles.contactTitleRow}>
            <AppIcon icon={Mail} size={16} color={Colors.textPrimary} />
            <Text style={styles.contactTitle}>직접 문의하기</Text>
          </View>
          <Text style={styles.contactSub}>support@sokdak.app</Text>
        </TouchableOpacity>
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

  scroll: { paddingBottom: 40 },

  categoryRow: { gap: 6, paddingHorizontal: 24, paddingVertical: 16 },
  categoryChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  categoryChipActive: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  categoryChipText: { fontSize: 12, color: Colors.textPrimary, fontFamily: undefined },
  categoryChipTextActive: { color: Colors.navBarIconActive },

  faqGroup: { marginHorizontal: 24 },
  faqQuestionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
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

  contactCard: {
    marginHorizontal: 24, marginTop: 24,
    padding: 16, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.textTertiary,
    gap: 4,
  },
  contactTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactTitle: { fontSize: 15, color: Colors.textPrimary, fontFamily: undefined },
  contactSub: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
});
