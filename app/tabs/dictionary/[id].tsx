import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { MOCK_WORDS } from '../../../constants/mockWords';

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const word = MOCK_WORDS.find((w) => w.id === id);

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(word?.likes ?? 0);

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

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleSave = () => {
    setSaved((prev) => !prev);
    Alert.alert(
      saved ? '저장 취소' : '저장 완료',
      saved ? `'${word.word}' 저장을 취소했어요.` : `'${word.word}'를 내 단어장에 저장했어요.`,
      [{ text: '확인' }],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── Figma: Navigation/TopAppBar/Dictionary Back (375×44) */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{word.word}</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveIcon}>{saved ? '🔖' : '📌'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Section 1: 단어 헤더 ── Figma 최상단 단어 표시 영역 */}
        <View style={styles.wordHeader}>
          <View style={styles.wordHeaderTop}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{word.category}</Text>
            </View>
          </View>
          <Text style={styles.wordTitle}>{word.word}</Text>
          {word.pronunciation && (
            <Text style={styles.pronunciation}>{word.pronunciation}</Text>
          )}
          <Text style={styles.shortDesc}>{word.shortDesc}</Text>

          {/* 좋아요 · 저장 액션 */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, liked && styles.actionBtnActive]}
              onPress={handleLike}
            >
              <Text style={styles.actionBtnIcon}>{liked ? '❤️' : '🤍'}</Text>
              <Text style={[styles.actionBtnLabel, liked && styles.actionBtnLabelActive]}>
                {likeCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, saved && styles.actionBtnActive]}
              onPress={handleSave}
            >
              <Text style={styles.actionBtnIcon}>{saved ? '🔖' : '📌'}</Text>
              <Text style={[styles.actionBtnLabel, saved && styles.actionBtnLabelActive]}>
                {saved ? '저장됨' : '저장'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnIcon}>📤</Text>
              <Text style={styles.actionBtnLabel}>공유</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section 2: 뜻/정의 ── Figma: Definition 영역 */}
        {word.meanings.map((meaning, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>뜻</Text>
              <View style={styles.posTag}>
                <Text style={styles.posTagText}>{meaning.type}</Text>
              </View>
            </View>
            <Text style={styles.definition}>{meaning.definition}</Text>
          </View>
        ))}

        {/* ── Section 3: 예문 ── Figma: Example sentences */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>예문</Text>
          {word.meanings.flatMap((m) => m.examples).map((ex, idx) => (
            <View key={idx} style={styles.exampleItem}>
              <View style={styles.exampleKorRow}>
                <Text style={styles.exampleBullet}>•</Text>
                <Text style={styles.exampleKor}>{ex.kor}</Text>
              </View>
              <Text style={styles.exampleEng}>{ex.eng}</Text>
            </View>
          ))}
        </View>

        {/* ── Section 4: 사용 맥락 ── Usage context */}
        {word.usage && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>사용 맥락</Text>
            <Text style={styles.usageText}>{word.usage}</Text>
          </View>
        )}

        {/* ── Section 5: 어원/유래 ── Origin */}
        {word.origin && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>어원/유래</Text>
            <Text style={styles.originText}>{word.origin}</Text>
          </View>
        )}

        {/* ── Section 6: 다국어 번역 ── Figma: 언어 설정 지원, 외국인 학습자 타깃 */}
        {word.translations.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>다국어 번역</Text>
            {word.translations.map((t, idx) => (
              <View key={idx} style={styles.translationRow}>
                <Text style={styles.translationLang}>{t.lang}</Text>
                <Text style={styles.translationText}>{t.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Section 7: 관련 단어 ── Related words */}
        {word.relatedWords.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>관련 단어</Text>
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

        {/* ── Section 8: 커뮤니티 연결 ── Figma: 커뮤니티 게시글 연계 */}
        <TouchableOpacity style={styles.communityBanner}>
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

  /* ── TopAppBar ── */
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34, marginTop: -2 },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  saveButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  saveIcon: { fontSize: 20 },

  /* ── Scroll ── */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  /* ── Word Header ── */
  wordHeader: {
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  wordHeaderTop: { flexDirection: 'row', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: Colors.navBar,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.navBarIconActive },
  wordTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  pronunciation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  shortDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },

  /* Actions */
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  actionBtnActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '15' },
  actionBtnIcon: { fontSize: 15 },
  actionBtnLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  actionBtnLabelActive: { color: Colors.accent },

  /* ── Card (공통 섹션 컨테이너) ── */
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  posTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  posTagText: { fontSize: 10, color: Colors.textSecondary },

  /* Definition */
  definition: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24 },

  /* Examples */
  exampleItem: { gap: 3, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  exampleKorRow: { flexDirection: 'row', gap: 6 },
  exampleBullet: { fontSize: 14, color: Colors.accent, marginTop: 1 },
  exampleKor: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 21, fontWeight: '500' },
  exampleEng: { fontSize: 12, color: Colors.textTertiary, lineHeight: 18, paddingLeft: 14, fontStyle: 'italic' },

  /* Usage / Origin */
  usageText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  originText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },

  /* Translations */
  translationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 12,
  },
  translationLang: { fontSize: 12, color: Colors.textTertiary, width: 68, marginTop: 1 },
  translationText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },

  /* Related words */
  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relatedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  relatedChipText: { fontSize: 13, color: Colors.accent, fontWeight: '500' },

  /* Community banner */
  communityBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: Colors.navBar,
    borderRadius: 12,
    gap: 4,
  },
  communityBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive },
  communityBannerSub: { fontSize: 12, color: Colors.navBarIconMuted },

  /* Not found */
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  backBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },

  bottomSpacer: { height: 16 },
});
