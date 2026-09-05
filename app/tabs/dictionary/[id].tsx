import { StyleSheet, View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/constants/alert';
import { Colors, getReadableTextColor } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { fetchWordById, fetchWords, localizedText, type Word } from '../../../constants/words';
import { getCategoryBySlug, getCategoryName, type Category } from '../../../constants/categories';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { authStore, BETA_UNLIMITED_ENTITLEMENTS } from '../../../constants/authStore';
import { speakWord } from '../../../constants/speech';
import { AppIcon } from '@/components/AppIcon';
import { Star, Volume2, MessageCircle } from 'lucide-react-native';
import { WordVideo } from '@/components/WordVideo';
import { PremiumLockModal } from '@/components/PremiumLockModal';
import { FocusIcon } from '@/components/icons/FocusIcon';
import { BackIcon } from '@/components/icons/SocialIcons';

const AVATAR_HORANG = require('../../../assets/characters/transparent/horang.png');
const AVATAR_JJAEKI = require('../../../assets/characters/transparent/jjaeki.png');

/** Figma node 683:3679(속닥 Sokdak) — Selection/Chip/Dictionary/Combined */
export default function WordDetailScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const { id } = useLocalSearchParams<{ id: string }>();
  const [word, setWord] = useState<Word | null | undefined>(undefined);
  /* 관련 단어 칩이 다른 단어로 이동할 때 word.word → id를 찾기 위한 전체 목록 */
  const [allWords, setAllWords] = useState<Word[]>([]);

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [lockModalVisible, setLockModalVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchWordById(id).then(data => {
      setWord(data);
      if (data) {
        setSaved(authStore.isWordSaved(data.id));
        setActiveTab(data.category);
      }
    });
    fetchWords().then(setAllWords);
  }, [id]);

  /* 마이페이지 > 저장한 단어에서 해제된 경우 등 화면 재진입 시 동기화 */
  useFocusEffect(
    useCallback(() => {
      if (word) setSaved(authStore.isWordSaved(word.id));
    }, [word]),
  );

  /* 속어 등 프리미엄 전용 카테고리 단어(주/보조 어느 쪽이든)는 상세 진입 자체를 막는다 —
   * 카테고리 그리드/상세 화면과 동일한 게이트(app/tabs/category/[slug].tsx 참고).
   * 프리미엄을 통과해도(베타 무제한 포함) 성인 확인이 안 됐으면 확인 대화상자를 거친다. */
  useFocusEffect(
    useCallback(() => {
      if (!word) return;
      const premiumGated = [word.category, word.secondaryCategory]
        .some(slug => slug && getCategoryBySlug(slug)?.premiumOnly);
      if (!premiumGated) return;
      if (!BETA_UNLIMITED_ENTITLEMENTS && !authStore.isPremium()) {
        /* 진입 자체를 막고 캐릭터 팝업으로 결제 유도(운영자 결정 2026-09-02) —
         * 닫으면 사전으로 돌아가고, CTA는 팝업 컴포넌트가 프리미엄 화면으로 보낸다. */
        setLockModalVisible(true);
        return;
      }
      if (!authStore.isAdultVerified()) {
        authStore.promptAdultVerification(
          () => setWord(w => (w ? { ...w } : w)), // 확인됨 — 재렌더만 유도
          () => safeGoBack('/tabs/dictionary'),
        );
      }
    }, [word]),
  );

  if (word === undefined) {
    return (
      <SafeAreaView style={styles.notFound}>
        <ActivityIndicator color={Colors.textTertiary} />
      </SafeAreaView>
    );
  }

  if (!word) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>{t('wordNotFound')}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack('/tabs/dictionary')}>
          <Text style={styles.backBtnText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* 비프리미엄의 속어 상세 — 본문을 그리지 않고 캐릭터 팝업만 노출, 닫으면 사전으로 */
  const premiumLocked = [word.category, word.secondaryCategory]
    .some(slug => slug && getCategoryBySlug(slug)?.premiumOnly)
    && !BETA_UNLIMITED_ENTITLEMENTS && !authStore.isPremium();
  if (premiumLocked) {
    return (
      <SafeAreaView style={styles.notFound}>
        <PremiumLockModal
          visible={lockModalVisible}
          onClose={() => { setLockModalVisible(false); safeGoBack('/tabs/dictionary'); }}
        />
      </SafeAreaView>
    );
  }

  const primaryCategory = getCategoryBySlug(word.category);
  const secondaryCategory = word.secondaryCategory ? getCategoryBySlug(word.secondaryCategory) : undefined;
  const categories = [primaryCategory, secondaryCategory].filter((c): c is Category => !!c);
  const hasTabs = categories.length > 1;

  const englishGloss = word.translations.find(t => t.lang.includes('EN'))?.text;
  const examples = word.meanings.flatMap(m => m.examples);
  /* 예문 번역은 UI 언어를 따른다 — ko UI는 학습 목적상 영어 대역, 그 외 언어는 해당 번역,
   * 번역이 없는 데이터는 eng로 폴백 */
  const exampleGloss = (ex: (typeof examples)[number]) =>
    (language === 'ko' || language === 'en' ? ex.eng : ex[language] ?? ex.eng);
  /* 초성체(ㅋㅋ)·알파벳 신조어(TMI)는 글자만 봐선 읽는 법을 알 수 없어
   * 영문 로마자와 한글 발음을 함께 보여준다. 완성형 한글이 있는 단어는 로마자만. */
  const koreanReading = word.pronunciation ? word.pronunciation.replace(/^\[|\]$/g, '') : null;
  const hasHangulSyllable = /[가-힣]/.test(word.word);
  const reading = hasHangulSyllable || !koreanReading
    ? word.romanization
    : `${word.romanization} · ${koreanReading}`;

  /* 단어 저장은 회원 전용(무료 회원 최대 3개, 프리미엄 무제한).
   * 저장 해제는 한도와 무관하게 항상 허용, 새로 저장할 때만 로그인·한도 체크. */
  const handleSave = () => {
    if (!saved && !authStore.isLoggedIn()) {
      Alert.alert(t('loginRequiredTitle'), t('loginRequiredSave'), [
        { text: t('cancelLabel'), style: 'cancel' },
        { text: t('goToLogin'), onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    if (!saved && !authStore.canSaveMoreWords()) {
      Alert.alert(t('saveLimitReachedTitle'), t('saveLimitReachedMessage'));
      return;
    }
    authStore.toggleWordSaved(word.id);
    setSaved((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── TopAppBar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => safeGoBack('/tabs/dictionary')}>
          <BackIcon size={24} color={Colors.navBarIconActive} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{word.word}</Text>
        <AppIcon
          icon={Star}
          size={22}
          fill={saved ? '#FACC15' : undefined}
          color={saved ? '#FACC15' : undefined}
          style={styles.iconBtn}
          onPress={handleSave}
          accessibilityLabel={t('a11ySaveWord')}
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
                    <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>{getCategoryName(cat, language)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ── 메인 카드: 영상+헤더+의미+문화적배경+대화예시 ── */}
          <View style={[styles.mainCard, hasTabs && styles.mainCardWithTabs]}>
            <WordVideo
              videoUrl={word.videoUrl}
              youtubeId={word.youtubeId}
              videoStartSec={word.videoStartSec}
              videoEndSec={word.videoEndSec}
              thumbnailUrl={word.thumbnailUrl}
              word={word.word}
              tintColor={getCategoryBySlug(word.category)?.colorBg}
            />

            {/* 단어 헤더 */}
            <View style={styles.headerBlock}>
              <View style={styles.wordTitleRow}>
                <Text style={styles.wordTitle}>{word.word}</Text>
                {reading && <Text style={styles.reading}>{reading}</Text>}
                <AppIcon
                  icon={Volume2}
                  size={18}
                  style={styles.soundBtn}
                  hitSlop={4}
                  onPress={() => speakWord(word)}
                  accessibilityLabel={t('a11yPlayPronunciation')}
                />
              </View>
              {categories.length > 0 && (
                <View style={styles.badgeRow}>
                  {categories.map(cat => (
                    <View key={cat.slug} style={[styles.badge, { backgroundColor: cat.colorBg }]}>
                      <Text style={[styles.badgeText, { color: getReadableTextColor(cat.colorBg) }]} numberOfLines={1}>
                        {getCategoryName(cat, language)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 의미 Meaning */}
            <View style={styles.meaningBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{t('meaning')}</Text>
                {language === 'ko' && <Text style={styles.sectionTitleEn}>Meaning</Text>}
              </View>
              {/* 다의어(오빠 등)는 정의를 전부 번호로 나열 — 이전엔 첫 정의만 보였다 */}
              {word.meanings.map((m, i) => (
                <Text key={i} style={styles.definitionText}>
                  {word.meanings.length > 1 ? `${i + 1}. ` : ''}
                  {localizedText(m.definition, m.definition_i18n, language)}
                </Text>
              ))}
              {(language === 'ko' || language === 'en') && englishGloss && <Text style={styles.definitionEng}>{englishGloss}</Text>}
            </View>

            {/* 문화적 배경 Cultural Context */}
            {word.usage && (
              <View style={styles.contextCard}>
                <View style={styles.sectionHeaderRowSm}>
                  <Text style={styles.sectionTitleSm}>{t('culturalContext')}</Text>
                  {language === 'ko' && <Text style={styles.sectionTitleEnSm}>Cultural Context</Text>}
                </View>
                <Text style={styles.contextBody}>{localizedText(word.usage, word.usageI18n, language)}</Text>
                {language === 'ko' && word.usageEn && <Text style={styles.contextBodyEn}>{word.usageEn}</Text>}
              </View>
            )}

            {/* 대화 예시 Conversation */}
            {examples.length > 0 && (
              <View style={styles.conversationBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{t('conversationExample')}</Text>
                  {language === 'ko' && <Text style={styles.sectionTitleEn}>Conversation</Text>}
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
                                <Text style={styles.chatEng}>{exampleGloss(ex)}</Text>
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
                                <Text style={styles.chatEngRight}>{exampleGloss(ex)}</Text>
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
                <Text style={styles.tipTitle}>{t('additionalInfo')}</Text>
                {language === 'ko' && <Text style={styles.tipTitleEn}>Additional Tip</Text>}
              </View>
              <Text style={styles.contextBody}>{localizedText(word.origin, word.originI18n, language)}</Text>
              {language === 'ko' && word.originEn && <Text style={styles.contextBodyEn}>{word.originEn}</Text>}
            </View>
          )}

          {/* ── 관련 단어 ── */}
          {word.relatedWords.length > 0 && (
            <View style={styles.relatedCard}>
              <Text style={styles.sectionTitle}>{t('relatedWords')}</Text>
              <View style={styles.relatedRow}>
                {word.relatedWords.map((rw) => {
                  const target = allWords.find((w) => w.word === rw);
                  return (
                    <TouchableOpacity
                      key={rw}
                      style={styles.relatedChip}
                      /* ponytail: 카테고리/마이페이지 스택에서 연 상세의 관련 단어는 사전 스택으로 넘어감(크로스탭 1회) — 불만 나오면 상대 경로 push로 교체 */
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
              <Text style={styles.communityBannerTitle}>{t('askInCommunity')}</Text>
            </View>
            <Text style={styles.communityBannerSub}>
              {language === 'ko' ? `${word.word}에 대해 더 궁금한 점이 있으신가요?` : `"${word.word}"${t('askInCommunityQuestion')}`}
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
  topBarTitle: { flex: 1, fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive, textAlign: 'center' },

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
  tabTextActive: { fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBar },

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
  wordTitle: { fontSize: 26, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  reading: { fontSize: 14, color: Colors.textTertiary },
  /* 발음 텍스트와 스피커 아이콘은 같은 줄에서 세로 중앙 정렬(운영자 규칙) — 이전의
   * flex-end+paddingBottom 수동 보정이 아이콘을 위로 띄워 보이게 했다 */
  soundBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 10, fontFamily: 'NotoSerifKR_600SemiBold' },

  /* 섹션 헤더 (의미/대화예시 — 18px 타이틀) */
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  sectionTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  sectionTitleEn: { fontSize: 12, color: Colors.textTertiary },

  /* 섹션 헤더 (문화적배경/추가정보 카드 내부 — 16px 타이틀) */
  sectionHeaderRowSm: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  sectionTitleSm: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  sectionTitleEnSm: { fontSize: 10, color: Colors.textTertiary },

  /* 의미 */
  meaningBlock: { gap: 6 },
  definitionText: { fontSize: 16, color: Colors.textSecondary, lineHeight: 20 },
  definitionEng: { fontSize: 12, color: Colors.textTertiary, lineHeight: 16 },

  /* 문화적 배경 / 추가 정보 공통 텍스트 */
  contextBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 18 },
  contextBodyEn: { fontSize: 12, color: Colors.textTertiary, lineHeight: 16, marginTop: 4 },

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
  chatName: { fontSize: 12, color: Colors.textSecondary },
  chatAvatar: { width: 32, height: 32, borderRadius: 16 },
  /* 버블+간격(8)+아바타(32)가 컬럼 한계 안에 들어야 아바타가 가장자리로 밀리지 않는다
   * (운영자 규칙: 말풍선이 캐릭터를 밀어내지 않기, 좌우 여백 대칭) */
  /* 말풍선 최대 폭 = 문화 배경 카드와 같은 콘텐츠 폭(아바타 옆 남은 공간 전부) — 고정 208 캡 제거(운영자 지시) */
  chatBubble: { flexShrink: 1, borderRadius: 12, padding: 12, gap: 2 },
  chatBubbleLeft: {
    backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border,
    borderTopLeftRadius: 0,
  },
  chatBubbleRight: {
    backgroundColor: Colors.navBar, borderWidth: 0.5, borderColor: Colors.border,
    borderTopRightRadius: 0,
  },
  chatKor: { fontSize: 14, color: Colors.textSecondary, lineHeight: 18 },
  chatEng: { fontSize: 12, color: Colors.textTertiary, lineHeight: 16 },
  chatKorRight: { fontSize: 14, color: Colors.border, lineHeight: 18, textAlign: 'right' },
  chatEngRight: { fontSize: 12, color: Colors.border, lineHeight: 16, textAlign: 'right' },

  /* 추가 정보 카드 (메인 카드 밖) */
  tipCard: {
    marginTop: 16,
    backgroundColor: Colors.divider, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 16, gap: 12,
  },
  tipHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tipTitle: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.point1 },
  tipTitleEn: { fontSize: 10, color: Colors.textTertiary, marginLeft: 4 },

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
  relatedChipText: { fontSize: 13, color: Colors.textEmphasis, fontFamily: 'NotoSerifKR_600SemiBold' },

  /* 커뮤니티 배너 */
  communityBanner: {
    marginTop: 16, padding: 16,
    backgroundColor: Colors.navBar, borderRadius: 12, gap: 4,
  },
  communityBannerTitle: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
  communityBannerSub: { fontSize: 12, color: Colors.navBarIconMuted },

  /* Not found */
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  backBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontFamily: 'NotoSerifKR_600SemiBold' },
});
