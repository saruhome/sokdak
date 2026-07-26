import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Colors, getReadableTextColor } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { MOCK_WORDS } from '../../../constants/mockWords';
import { getCategoryBySlug, type Category } from '../../../constants/categories';
import { authStore } from '../../../constants/authStore';
import { AppIcon } from '@/components/AppIcon';
import { Star, Volume2, MessageCircle } from 'lucide-react-native';
import { WordVideo } from '@/components/WordVideo';
import { FocusIcon } from '@/components/icons/FocusIcon';

const AVATAR_HORANG = require('../../../assets/characters/horang.png');
const AVATAR_JJAEKI = require('../../../assets/characters/jjaeki.png');

/** Figma node 683:3679(속닥 Sokdak) — Selection/Chip/Dictionary/Combined */
export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const word = MOCK_WORDS.find((w) => w.id === id);

  const [saved, setSaved] = useState(() => (word ? authStore.isWordSaved(word.id) : false));
  const [activeTab, setActiveTab] = useState(word?.category);

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
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const primaryCategory = getCategoryBySlug(word.category);
  const secondaryCategory = word.secondaryCategory ? getCategoryBySlug(word.secondaryCategory) : undefined;
  const categories = [primaryCategory, secondaryCategory].filter((c): c is Category => !!c);
  const hasTabs = categories.length > 1;

  const englishGloss = word.translations.find(t => t.lang.includes('EN'))?.text;
  const examples = word.meanings.flatMap(m => m.examples);
  const reading = word.pronunciation ? word.pronunciation.replace(/^\[|\]$/g, '') : null;

  /* 비로그인도 즐겨찾기 가능 — 세션 동안 유지되고 로그인 시 계정으로 이관된다(authStore) */
  const handleSave = () => {
    authStore.toggleWordSaved(word.id);
    setSaved((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => safeGoBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{word.word}</Text>
        <AppIcon
          icon={Star}
          size={22}
          fill={saved ? '#FACC15' : undefined}
          color={saved ? '#FACC15' : undefined}
          style={styles.iconBtn}
          onPress={handleSave}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.outer}>
          {/* ── 카테고리 탭 (2개 카테고리에 걸치는 단어만) ── */}
          {hasTabs && (
            <View style={styles.tabsRow}>
              {categories.map(cat => {
                const active = cat.slug === activeTab;
                return (
                  <TouchableOpacity
                    key={cat.slug}
                    style={[styles.tab, active ? styles.tabActive : styles.tabInactive]}
                    onPress={() => setActiveTab(cat.slug)}
                  >
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ── 메인 카드: 영상+헤더+의미+문화적배경+대화예시 ── */}
          <View style={[styles.mainCard, hasTabs && styles.mainCardWithTabs]}>
            <WordVideo videoUrl={word.videoUrl} />

            {/* 단어 헤더 */}
            <View style={styles.headerBlock}>
              <View style={styles.wordTitleRow}>
                <Text style={styles.wordTitle}>{word.word}</Text>
                {reading && <Text style={styles.reading}>{reading}</Text>}
                <AppIcon icon={Volume2} size={18} style={styles.soundBtn} onPress={() => {}} />
              </View>
              {categories.length > 0 && (
                <View style={styles.badgeRow}>
                  {categories.map(cat => (
                    <View key={cat.slug} style={[styles.badge, { backgroundColor: cat.colorBg }]}>
                      <Text style={[styles.badgeText, { color: getReadableTextColor(cat.colorBg) }]}>
                        {cat.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 의미 Meaning */}
            <View style={styles.meaningBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>의미</Text>
                <Text style={styles.sectionTitleEn}>Meaning</Text>
              </View>
              <Text style={styles.definitionText}>{word.meanings[0]?.definition}</Text>
              {englishGloss && <Text style={styles.definitionEng}>{englishGloss}</Text>}
            </View>

            {/* 문화적 배경 Cultural Context */}
            {word.usage && (
              <View style={styles.contextCard}>
                <View style={styles.sectionHeaderRowSm}>
                  <Text style={styles.sectionTitleSm}>문화적 배경</Text>
                  <Text style={styles.sectionTitleEnSm}>Cultural Context</Text>
                </View>
                <Text style={styles.contextBody}>{word.usage}</Text>
                {word.usageEn && <Text style={styles.contextBodyEn}>{word.usageEn}</Text>}
              </View>
            )}

            {/* 대화 예시 Conversation */}
            {examples.length > 0 && (
              <View style={styles.conversationBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>대화 예시</Text>
                  <Text style={styles.sectionTitleEn}>Conversation</Text>
                </View>
                <View style={styles.chatWrap}>
                  {examples.map((ex, idx) => {
                    const fromRight = idx % 2 === 1;
                    return (
                      <View key={idx} style={[styles.chatRow, fromRight && styles.chatRowRight]}>
                        {!fromRight && (
                          <View style={styles.chatCol}>
                            <Text style={styles.chatName}>호랭</Text>
                            <View style={styles.chatRowInner}>
                              <Image source={AVATAR_HORANG} style={styles.chatAvatar} />
                              <View style={[styles.chatBubble, styles.chatBubbleLeft]}>
                                <Text style={styles.chatKor}>{ex.kor}</Text>
                                <Text style={styles.chatEng}>{ex.eng}</Text>
                              </View>
                            </View>
                          </View>
                        )}
                        {fromRight && (
                          <View style={[styles.chatCol, styles.chatColRight]}>
                            <Text style={styles.chatName}>짹이</Text>
                            <View style={styles.chatRowInner}>
                              <View style={[styles.chatBubble, styles.chatBubbleRight]}>
                                <Text style={styles.chatKorRight}>{ex.kor}</Text>
                                <Text style={styles.chatEngRight}>{ex.eng}</Text>
                              </View>
                              <Image source={AVATAR_JJAEKI} style={styles.chatAvatar} />
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* ── 추가 정보 Additional Tip (메인 카드 밖 별도 카드) ── */}
          {word.origin && (
            <View style={styles.tipCard}>
              <View style={styles.tipHeaderRow}>
                <FocusIcon size={16} color={Colors.point1} />
                <Text style={styles.tipTitle}>추가 정보</Text>
                <Text style={styles.tipTitleEn}>Additional Tip</Text>
              </View>
              <Text style={styles.contextBody}>{word.origin}</Text>
              {word.originEn && <Text style={styles.contextBodyEn}>{word.originEn}</Text>}
            </View>
          )}

          {/* ── 관련 단어 ── */}
          {word.relatedWords.length > 0 && (
            <View style={styles.relatedCard}>
              <Text style={styles.sectionTitle}>관련 단어</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppIcon icon={MessageCircle} size={15} color={Colors.navBarIconActive} />
              <Text style={styles.communityBannerTitle}>이 단어로 커뮤니티에 물어보기</Text>
            </View>
            <Text style={styles.communityBannerSub}>
              {word.word}에 대해 더 궁금한 점이 있으신가요?
            </Text>
          </TouchableOpacity>
        </View>
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
  outer: { paddingHorizontal: 16, paddingTop: 16 },

  /* 카테고리 탭 (Selection/Tab/Dictionary) */
  tabsRow: { flexDirection: 'row', gap: 8 },
  tab: {
    height: 45, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 13,
    borderWidth: 1, borderBottomWidth: 0, borderColor: '#888',
    borderTopLeftRadius: 10, borderTopRightRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  tabActive: { backgroundColor: Colors.pageBackground },
  tabInactive: { backgroundColor: Colors.divider },
  tabText: { fontSize: 16, color: Colors.textTertiary },
  tabTextActive: { fontWeight: '600', color: Colors.navBar },

  /* 메인 카드 */
  mainCard: {
    backgroundColor: Colors.pageBackground,
    borderWidth: 1, borderColor: '#888',
    borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 24,
    gap: 32,
  },
  mainCardWithTabs: { borderTopLeftRadius: 0 },

  /* 단어 헤더 */
  headerBlock: { gap: 8 },
  wordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  wordTitle: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  reading: { fontSize: 14, color: Colors.textTertiary, fontFamily: undefined },
  soundBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 5 },
  soundIcon: { fontSize: 16 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '600' },

  /* 섹션 헤더 (의미/대화예시 — 18px 타이틀) */
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  sectionTitleEn: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },

  /* 섹션 헤더 (문화적배경/추가정보 카드 내부 — 16px 타이틀) */
  sectionHeaderRowSm: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  sectionTitleSm: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  sectionTitleEnSm: { fontSize: 10, color: Colors.textTertiary, fontFamily: undefined },

  /* 의미 */
  meaningBlock: { gap: 6 },
  definitionText: { fontSize: 16, color: Colors.textSecondary, lineHeight: 20 },
  definitionEng: { fontSize: 12, color: Colors.textTertiary, lineHeight: 16, fontFamily: undefined },

  /* 문화적 배경 / 추가 정보 공통 텍스트 */
  contextBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 18, fontFamily: undefined },
  contextBodyEn: { fontSize: 12, color: Colors.textTertiary, lineHeight: 16, marginTop: 4, fontFamily: undefined },

  /* 문화적 배경 카드 */
  contextCard: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 16, gap: 12,
  },

  /* 대화 예시 */
  conversationBlock: { gap: 12 },
  chatWrap: { gap: 12 },
  chatRow: { flexDirection: 'row' },
  chatRowRight: { justifyContent: 'flex-end' },
  chatCol: { gap: 6, maxWidth: '90%' },
  chatColRight: { alignItems: 'flex-end' },
  chatRowInner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  chatName: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  chatAvatar: { width: 32, height: 32, borderRadius: 16 },
  chatBubble: { maxWidth: 244, borderRadius: 12, padding: 12, gap: 2 },
  chatBubbleLeft: {
    backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border,
    borderTopLeftRadius: 0,
  },
  chatBubbleRight: {
    backgroundColor: Colors.navBar, borderWidth: 0.5, borderColor: Colors.border,
    borderTopRightRadius: 0,
  },
  chatKor: { fontSize: 14, color: Colors.textSecondary, lineHeight: 18, fontFamily: undefined },
  chatEng: { fontSize: 12, color: Colors.textTertiary, lineHeight: 16, fontFamily: undefined },
  chatKorRight: { fontSize: 14, color: Colors.border, lineHeight: 18, textAlign: 'right', fontFamily: undefined },
  chatEngRight: { fontSize: 12, color: Colors.border, lineHeight: 16, textAlign: 'right', fontFamily: undefined },

  /* 추가 정보 카드 (메인 카드 밖) */
  tipCard: {
    marginTop: 16,
    backgroundColor: Colors.divider, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 16, gap: 12,
  },
  tipHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tipTitle: { fontSize: 16, fontWeight: '600', color: Colors.point1 },
  tipTitleEn: { fontSize: 10, color: Colors.textTertiary, marginLeft: 4, fontFamily: undefined },

  /* 관련 단어 */
  relatedCard: {
    marginTop: 16, padding: 16,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relatedChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  relatedChipText: { fontSize: 13, color: Colors.textEmphasis, fontWeight: '500' },

  /* 커뮤니티 배너 */
  communityBanner: {
    marginTop: 16, padding: 16,
    backgroundColor: Colors.navBar, borderRadius: 12, gap: 4,
  },
  communityBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive },
  communityBannerSub: { fontSize: 12, color: Colors.navBarIconMuted, fontFamily: undefined },

  /* Not found */
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  backBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
