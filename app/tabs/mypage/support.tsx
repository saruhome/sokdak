import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';

const FAQ_ITEMS = [
  { q: '속닥은 어떤 앱인가요?', a: '한국 거주 외국인 중·고급 학습자를 위한 한국어 신조어 학습 앱이에요. 교과서에는 없는 진짜 생활 한국어를 배울 수 있어요.' },
  { q: '단어는 어떻게 저장하나요?', a: "단어 상세 화면에서 '저장' 버튼을 누르면 마이페이지 > 저장한 단어에서 모아볼 수 있어요." },
  { q: '신조어를 제안하고 싶어요.', a: "마이페이지 > 신조어 제안하기 메뉴에서 원하는 단어와 뜻을 제안할 수 있어요. 검토 후 사전에 반영돼요." },
  { q: '로그인 없이도 이용할 수 있나요?', a: '사전 검색과 커뮤니티 글 읽기는 로그인 없이 가능해요. 단어 저장, 글쓰기, 댓글 작성은 로그인이 필요해요.' },
  { q: '커뮤니티 이용 규칙이 궁금해요.', a: '서로 존중하는 학습 커뮤니티를 지향해요. 욕설, 광고, 혐오 표현은 제재될 수 있어요.' },
];

/** Figma: 229:3352 — 고객센터 (FAQ 아코디언 + 문의하기) */
export default function SupportScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleContact = () => {
    const url = 'mailto:support@sokdak.app?subject=%5B속닥%5D%20문의하기';
    Linking.openURL(url).catch(() => {
      Alert.alert('메일 앱을 열 수 없어요', 'support@sokdak.app 으로 직접 문의해주세요.');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>고객센터</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
        <View style={styles.faqGroup}>
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <View key={item.q} style={[styles.faqItem, i < FAQ_ITEMS.length - 1 && styles.faqItemBorder]}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => setOpenIndex(open ? null : i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <Text style={styles.faqArrow}>{open ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {open && <Text style={styles.faqAnswer}>{item.a}</Text>}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>더 궁금한 점이 있나요?</Text>
        <TouchableOpacity style={styles.contactCard} onPress={handleContact} activeOpacity={0.85}>
          <View>
            <Text style={styles.contactTitle}>📧 이메일로 문의하기</Text>
            <Text style={styles.contactSub}>support@sokdak.app</Text>
          </View>
          <Text style={styles.contactArrow}>›</Text>
        </TouchableOpacity>
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
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textTertiary, marginBottom: 10, marginTop: 8 },

  faqGroup: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
    marginBottom: 24,
  },
  faqItem: { paddingHorizontal: 16 },
  faqItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  faqQuestionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, gap: 12,
  },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  faqArrow: { fontSize: 11, color: Colors.textTertiary },
  faqAnswer: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, paddingBottom: 16 },

  contactCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 12,
    backgroundColor: Colors.navBar,
  },
  contactTitle: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive, marginBottom: 3 },
  contactSub: { fontSize: 12, color: Colors.navBarIconMuted },
  contactArrow: { fontSize: 20, color: Colors.navBarIconMuted },
});
