import { StyleSheet, View, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Colors, getReadableTextColor } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { cardGloss, fetchWordsByIds, type Word } from '../../../constants/words';
import { authStore } from '../../../constants/authStore';
import { getCategoryBySlug, getCategoryName, type Category } from '../../../constants/categories';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { speakWord } from '@/constants/speech';
import { AppIcon } from '@/components/AppIcon';
import { CharacterEmptyState } from '@/components/CharacterEmptyState';
import {
  WordFilterBar, SORT_TABS, sortWords, matchesCategories, getInitialConsonant,
} from '@/components/WordFilterBar';
import { Star, Volume2 } from 'lucide-react-native';
import { BackIcon } from '@/components/icons/SocialIcons';

const ACTIVE_STAR_COLOR = '#FACC15';
const HORANG_READING = require('../../../assets/characters/transparent/horang-reading.png');

/** Figma: 229:3738(즐겨찾기) — 좋아요 한 카테고리 + 저장한 단어를 함께 보여주는 화면 */
export default function SavedWordsScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [savedIds, setSavedIds] = useState<string[]>(authStore.getSavedWordIds());
  const [likedCategorySlugs, setLikedCategorySlugs] = useState<string[]>(authStore.getLikedCategorySlugs());
  const [showAllCategories, setShowAllCategories] = useState(false);
  /* 정렬·카테고리 필터는 사전 화면과 동일하게 동작한다 (WordFilterBar 공유) */
  const [sortIndex, setSortIndex] = useState(0);
  const [consonant, setConsonant] = useState<string>('전체');
  const [filterSlugs, setFilterSlugs] = useState<string[]>([]);
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [wordsLoaded, setWordsLoaded] = useState(false);

  const sync = useCallback(() => {
    setSavedIds(authStore.getSavedWordIds());
    setLikedCategorySlugs(authStore.getLikedCategorySlugs());
  }, []);

  useFocusEffect(useCallback(() => { sync(); }, [sync]));
  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(sync);
    return () => { unsub(); };
  }, [sync]);
  useEffect(() => {
    let active = true;
    setWordsLoaded(false);
    fetchWordsByIds(savedIds).then(data => {
      if (!active) return;
      setSavedWords(data);
      setWordsLoaded(true);
    });
    return () => { active = false; };
  }, [savedIds.join(',')]);

  const filteredWords = sortWords(savedWords.filter(w => matchesCategories(w, filterSlugs)), sortIndex);
  const words = sortIndex === 2 && consonant !== '전체'
    ? filteredWords.filter(w => getInitialConsonant(w.word) === consonant)
    : filteredWords;

  const likedCategories = likedCategorySlugs
    .map(slug => getCategoryBySlug(slug))
    .filter((c): c is Category => !!c);
  const visibleCategories = showAllCategories ? likedCategories : likedCategories.slice(0, 2);

  const handleRemoveWord = (id: string) => {
    authStore.toggleWordSaved(id);
    sync();
  };

  const handleToggleCategory = (slug: string) => {
    authStore.toggleCategoryLiked(slug);
    sync();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" style={styles.backBtn} onPress={() => safeGoBack('/tabs/mypage')}>
          <BackIcon size={24} color={Colors.navBarIconActive} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('favoritesTitle')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── 총 단어 수 + 정렬/카테고리 트리거 ── */}
        {words.length > 0 && (
          <WordFilterBar
            total={words.length}
            sortIndex={sortIndex}
            onCycleSort={() => setSortIndex(p => (p + 1) % SORT_TABS.length)}
            categorySlugs={filterSlugs}
            onToggleCategory={slug => setFilterSlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug])}
            onClearCategories={() => setFilterSlugs([])}
            consonant={consonant}
            onSelectConsonant={setConsonant}
          />
        )}

        {/* ── 좋아요 한 카테고리 ── */}
        {likedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'ko' ? `${t('categoriesSuffix')} ${likedCategories.length}개` : `${likedCategories.length} ${t('categoriesSuffix')}`}
            </Text>
            <View style={styles.categoryRow}>
              {visibleCategories.map(category => (
                /* role="button" 금지 — 카드 안에 즐겨찾기 버튼이 있어 웹에서 <button> 중첩 오류 */
                <TouchableOpacity
                  key={category.slug}
                  style={styles.categoryCard}
                  onPress={() => router.push(`/tabs/category/${category.slug}`)}
                  activeOpacity={0.85}
                >
                  <ImageBackground source={category.image} style={styles.categoryCardBg} imageStyle={styles.categoryCardBgImage}>
                    <View style={StyleSheet.absoluteFill}>
                      <View style={styles.categoryCardOverlay} />
                    </View>
                    <TouchableOpacity accessibilityRole="button"
                      style={styles.likeBtn}
                      onPress={e => {
                        e.stopPropagation?.();
                        handleToggleCategory(category.slug);
                      }}
                      hitSlop={8}
                      accessibilityLabel={t('a11yLikeCategory')}
                    >
                      <AppIcon
                        icon={Star}
                        size={18}
                        fill={ACTIVE_STAR_COLOR}
                        color={ACTIVE_STAR_COLOR}
                      />
                    </TouchableOpacity>
                    <View style={styles.categoryTextWrap}>
                      <View style={styles.categoryTextScrim}>
                        <Text style={styles.categoryName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                          {getCategoryName(category, language).replace('\n', ' ')}
                        </Text>
                        <Text style={styles.categoryDesc} numberOfLines={1}>{category.description}</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
            {likedCategories.length > 2 && (
              <TouchableOpacity accessibilityRole="button" onPress={() => setShowAllCategories(p => !p)} style={styles.moreBtn}>
                <Text style={styles.moreBtnText}>{showAllCategories ? t('collapseLabel') : t('moreLink')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── 즐겨찾기 단어 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'ko' ? `${t('favoritesLabel')} ${words.length}개` : `${words.length} ${t('favoritesLabel')}`}
          </Text>
          <View style={styles.wordList}>
            {words.map(word => {
              const category = getCategoryBySlug(word.category);
              const secondaryCategory = word.secondaryCategory ? getCategoryBySlug(word.secondaryCategory) : undefined;
              return (
                /* role="button" 금지 — 행 안에 별/발음 버튼이 있어 웹에서 <button> 중첩 오류 */
                <TouchableOpacity
                  key={word.id}
                  style={styles.wordItem}
                  onPress={() => router.push(`/tabs/mypage/word/${word.id}` as never)}
                  activeOpacity={0.7}
                >
                  <View style={styles.wordItemLeft}>
                    <View style={styles.wordTopRow}>
                      <Text style={styles.wordText}>{word.word}</Text>
                      <Text style={styles.wordReading} numberOfLines={1}>{word.romanization}</Text>
                      {category && (
                        <View style={[styles.wordBadge, { backgroundColor: category.colorBg }]}>
                          <Text style={[styles.wordBadgeText, { color: getReadableTextColor(category.colorBg) }]} numberOfLines={1} ellipsizeMode="tail">{getCategoryName(category, language)}</Text>
                        </View>
                      )}
                      {secondaryCategory && (
                        <View style={[styles.wordBadge, { backgroundColor: secondaryCategory.colorBg }]}>
                          <Text style={[styles.wordBadgeText, { color: getReadableTextColor(secondaryCategory.colorBg) }]} numberOfLines={1} ellipsizeMode="tail">{getCategoryName(secondaryCategory, language)}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.wordDesc} numberOfLines={1}>{cardGloss(word, language)}</Text>
                  </View>
                  <View style={styles.wordItemRight}>
                    <AppIcon
                      icon={Star} size={18} fill={ACTIVE_STAR_COLOR} color={ACTIVE_STAR_COLOR}
                      style={styles.iconBtn} hitSlop={8}
                      onPress={() => handleRemoveWord(word.id)}
                      accessibilityLabel={t('a11ySaveWord')}
                    />
                    <AppIcon
                      icon={Volume2} size={18} style={styles.iconBtn} hitSlop={8}
                      onPress={() => speakWord(word)}
                      accessibilityLabel={t('a11yPlayPronunciation')}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {wordsLoaded && words.length === 0 && likedCategories.length === 0 && (
          <View style={styles.emptyWrap}>
            <CharacterEmptyState
              image={HORANG_READING}
              title={t('noFavoritesYet')}
              ctaLabel={t('browseDictionary')}
              onPressCta={() => router.push('/tabs/dictionary')}
              testID="saved-words-empty-state"
            />
          </View>
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

  content: { paddingBottom: 40 },


  section: { paddingHorizontal: 24, marginTop: 12, gap: 12 },
  sectionTitle: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },

  /* 좋아요 한 카테고리 */
  categoryRow: { flexDirection: 'row', gap: 12 },
  categoryCard: {
    flex: 1, height: 104, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  /* width/height 미지정 시 ImageBackground가 이미지 원본 폭 기준으로 커져 카드가 넘친다 */
  categoryCardBg: { flex: 1, width: '100%', height: '100%' },
  /* 카테고리 그리드와 동일 — 좌상단 앵커로 소재가 잘리지 않게. 카드 폭이 flex라 %+aspectRatio 사용
   * (에셋 600×395). 125%는 기기 폭 430dp까지 카드를 덮는다. */
  categoryCardBgImage: { resizeMode: 'cover', top: 0, left: 0, width: '125%', height: undefined, aspectRatio: 600 / 395 },
  categoryCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  likeBtn: {
    position: 'absolute', right: 4, top: 4, width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  /* 카테고리 그리드와 동일 — 래퍼는 위치만, 안쪽 스크림이 제목 폭에 딱 맞게 수축 */
  categoryTextWrap: { position: 'absolute', left: 8, right: 8, bottom: 8, alignItems: 'flex-start' },
  categoryTextScrim: {
    gap: 2, maxWidth: '100%',
    backgroundColor: 'rgba(246, 242, 234, 0.85)',
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3,
  },
  categoryName: { fontSize: 13, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  categoryDesc: { fontSize: 11, color: Colors.textTertiary },
  moreBtn: { alignItems: 'center', paddingTop: 4 },
  moreBtnText: { fontSize: 12, color: Colors.textTertiary },

  /* 저장한 단어 */
  wordList: { gap: 8 },
  wordItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, minHeight: 80,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  wordItemLeft: { flex: 1, gap: 8 },
  /* 태그가 항상 단어 옆 한 줄에 붙어 있도록 줄바꿈을 막고, 대신 로마자 표기가
   * 공간이 부족할 때 먼저 줄어들게(shrink+ellipsis) 해서 카드가 항상 2줄로 고정된다 */
  wordTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordText: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBar, flexShrink: 0 },
  wordReading: { fontSize: 12, color: Colors.textTertiary, flexShrink: 1, minWidth: 0 },
  wordBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, flexShrink: 0 },
  wordBadgeText: { fontSize: 10, fontFamily: 'NotoSerifKR_600SemiBold' },
  wordDesc: { fontSize: 12, color: Colors.textSecondary },
  wordItemRight: { alignItems: 'center', gap: 4 },
  iconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 60 },
  emptyText: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: 40 },
  emptyCta: {
    marginTop: 8, paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 20, backgroundColor: Colors.navBar,
  },
  emptyCtaText: { fontSize: 13, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
});
