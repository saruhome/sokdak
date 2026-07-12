import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { MOCK_WORDS } from '../../../constants/mockWords';
import { getCategoryBySlug } from '../../../constants/categories';
import { authStore } from '../../../constants/authStore';
import { WordVideo } from '@/components/WordVideo';

const CHAT_AVATARS = ['🐯', '🦊'] as const;

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const word = MOCK_WORDS.find((w) => w.id === id);

  const [saved, setSaved] = useState(() => (word ? authStore.isWordSaved(word.id) : false));

  /* 마이페이지 > 저장한 단어에서 해제된 경우 등 화면 재진입 시 동기화 */
  useFocusEffect(
    useCallback(() => {
      if (word) setSaved(authStore.isWordSaved(word.id));
    }, [word]),
  );

  if (!word) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>단어를 찾을 수 없어요</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const category = getCategoryBySlug(word.category);
  const englishGloss = word.translations.find(t => t.lang.includes('EN'))?.text;
  const examples = word.meanings.flatMap(m => m.examples);
  const reading = word.pronunciation ? word.pronunciation.replace(/^\[|\]$/g, '') : null;

  const handleSave = () => {
    authStore.toggleWordSaved(word.id);
    setSaved((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── Figma: 뒤로가기 + 단어명 + 즐겨찾기 */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{word.word}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
          <Text style={styles.starIcon}>{saved ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── 영상 클립 (Figma: 상단 캡션 영상) — videoUrl 있으면 재생, 없으면 빈 자리 ── */}
        <WordVideo videoUrl={word.videoUrl} />

        {/* ── 단어 헤더 ── */}
        <View style={styles.wordHeader}>
          <View style={styles.wordTitleRow}>
            <Text style={styles.wordTitle}>{word.word}</Text>
            {reading && <Text style={styles.reading}>{reading}</Text>}
            <Text style={styles.soundIcon}>🔊</Text>
          </View>
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={[styles.categoryBadgeText, { color: category.colorFg }]}>{category.name}</Text>
            </View>
          )}
        </View>

        {/* ── 의미 Meaning ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>의미</Text>
            <Text style={styles.cardTitleEn}>Meaning</Text>
          </View>
          <Text style={styles.cardBody}>{word.meanings[0]?.definition}</Text>
          {englishGloss && <Text style={styles.cardBodyEn}>{englishGloss}</Text>}
        </View>

        {/* ── 문화적 배경 Cultural Context ── */}
        {word.usage && (
          <View style={[styles.card, styles.cardMuted]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>문화적 배경</Text>
              <Text style={styles.cardTitleEn}>Cultural Context</Text>
            </View>
            <Text style={styles.cardBody}>{word.usage}</Text>
          </View>
        )}

        {/* ── 대화 예시 Conversation ── */}
        {examples.length > 0 && (
          <View style={styles.section}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>대화 예시</Text>
              <Text style={styles.cardTitleEn}>Conversation</Text>
            </View>
            <View style={styles.chatWrap}>
              {examples.map((ex, idx) => {
                const fromRight = idx % 2 === 1;
                return (
                  <View key={idx} style={[styles.chatRow, fromRight && styles.chatRowRight]}>
                    {!fromRight && <Text style={styles.chatAvatar}>{CHAT_AVATARS[0]}</Text>}
                    <View style={[styles.chatBubble, fromRight ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                      <Text style={[styles.chatKor, fromRight && styles.chatKorRight]}>{ex.kor}</Text>
                      <Text style={[styles.chatEng, fromRight && styles.chatEngRight]}>{ex.eng}</Text>
                    </View>
                    {fromRight && <Text style={styles.chatAvatar}>{CHAT_AVATARS[1]}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── 추가 정보 Additional Tip ── */}
        {word.origin && (
          <View style={[styles.card, styles.cardMuted]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.cardTitle}>추가 정보</Text>
              <Text style={styles.cardTitleEn}>Additional Tip</Text>
            </View>
            <Text style={styles.cardBody}>{word.origin}</Text>
          </View>
        )}

        {/* ── 관련 단어 ── */}
        {word.relatedWords.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>관련 단어</Text>
            <View style={styles.relatedRow}>
              {word.relatedWords.map((rw) => {
                const target = MOCK_WORDS.find((w) => w.word === rw);
                return (
                  <TouchableOpacity
                    key={rw}
                    style={styles.relatedChip}
                    onPress={() => target && router.push(`/tabs/dictionary/${target.id}`)}
                    disabled={!target}
                  >
                    <Text style={[styles.relatedChipText, !target && { opacity: 0.5 }]}>
                      {rw}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── 커뮤니티 연결 ── */}
        <TouchableOpacity style={styles.communityBanner} onPress={() => router.push('/tabs/community')}>
          <Text style={styles.communityBannerTitle}>💬 이 단어로 커뮤니티에 물어보기</Text>
          <Text style={styles.communityBannerSub}>
            {word.word}에 대해 더 궁금한 점이 있으신가요?
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  /* TopAppBar */
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    backgroundColor: Colors.navBar,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.navBarIconActive, lineHeight: 34, marginTop: -2 },
  topBarTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: Colors.navBarIconActive, textAlign: 'center' },
  starIcon: { fontSize: 20, color: Colors.navBarIconActive },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  /* 단어 헤더 */
  wordHeader: { padding: 24, gap: 12 },
  wordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wordTitle: { fontSize: 32, fontWeight: '700', color: Colors.textPrimary },
  reading: { fontSize: 14, color: Colors.textTertiary, fontFamily: undefined },
  soundIcon: { fontSize: 16 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  categoryBadgeText: { fontSize: 12, fontWeight: '600' },

  /* 카드 공통 */
  section: { marginHorizontal: 24, marginTop: 16, gap: 12 },
  card: {
    marginHorizontal: 24, marginTop: 16, padding: 16,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, gap: 8,
  },
  cardMuted: { backgroundColor: Colors.pageBackground },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  cardTitleEn: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  tipIcon: { fontSize: 14 },
  cardBody: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  cardBodyEn: { fontSize: 12, color: Colors.textTertiary, lineHeight: 18, fontFamily: undefined },

  /* 대화 예시 (채팅 버블) */
  chatWrap: { gap: 12 },
  chatRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  chatRowRight: { justifyContent: 'flex-end' },
  chatAvatar: { fontSize: 24 },
  chatBubble: { maxWidth: '75%', borderRadius: 14, padding: 12, gap: 2 },
  chatBubbleLeft: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 2 },
  chatBubbleRight: { backgroundColor: Colors.navBar, borderBottomRightRadius: 2 },
  chatKor: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  chatKorRight: { color: Colors.navBarIconActive },
  chatEng: { fontSize: 11, color: Colors.textTertiary, fontFamily: undefined },
  chatEngRight: { color: Colors.navBarIconMuted },

  /* 관련 단어 */
  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relatedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  relatedChipText: { fontSize: 13, color: Colors.textEmphasis, fontWeight: '500' },

  /* 커뮤니티 배너 */
  communityBanner: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.navBar,
    borderRadius: 12,
    gap: 4,
  },
  communityBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive },
  communityBannerSub: { fontSize: 12, color: Colors.navBarIconMuted, fontFamily: undefined },

  /* Not found */
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  backBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },

  bottomSpacer: { height: 16 },
});
