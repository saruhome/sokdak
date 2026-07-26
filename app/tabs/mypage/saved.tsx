import {
  StyleSheet, View, SafeAreaView, ScrollView, Image, ImageBackground, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { MOCK_WORDS, type Word } from '../../../constants/mockWords';
import { authStore } from '../../../constants/authStore';
import { getCategoryBySlug, type Category } from '../../../constants/categories';
import { AppIcon } from '@/components/AppIcon';
import { Star, Volume2, ChevronDown, List } from 'lucide-react-native';

const MIC_ICON = require('../../../assets/categories/icon-mic.png');
const STAR_ICON = require('../../../assets/categories/icon-star.png');

/** Figma: 229:3738(즐겨찾기) — 좋아요 한 카테고리 + 저장한 단어를 함께 보여주는 화면 */
export default function SavedWordsScreen() {
  const [savedIds, setSavedIds] = useState<string[]>(authStore.getSavedWordIds());
  const [likedCategorySlugs, setLikedCategorySlugs] = useState<string[]>(authStore.getLikedCategorySlugs());
  const [showAllCategories, setShowAllCategories] = useState(false);

  const sync = useCallback(() => {
    setSavedIds(authStore.getSavedWordIds());
    setLikedCategorySlugs(authStore.getLikedCategorySlugs());
  }, []);

  useFocusEffect(useCallback(() => { sync(); }, [sync]));
  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(sync);
    return () => { unsub(); };
  }, [sync]);

  const words = savedIds
    .map(id => MOCK_WORDS.find(w => w.id === id))
    .filter((w): w is Word => !!w);

  const likedCategories = likedCategorySlugs
    .map(slug => getCategoryBySlug(slug))
    .filter((c): c is Category => !!c);
  const visibleCategories = showAllCategories ? likedCategories : likedCategories.slice(0, 2);

  const handleRemoveWord = (id: string) => {
    authStore.toggleWordSaved(id);
    sync();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>즐겨찾기</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── 총 단어 수 + 정렬/카테고리 트리거 ── */}
        <View style={styles.filterBar}>
          <Text style={styles.totalCount}>총 {words.length} 단어</Text>
          <View style={styles.filterTriggers}>
            <View style={styles.sortTrigger}>
              <Text style={styles.sortTriggerText}>인기순</Text>
              <AppIcon icon={ChevronDown} size={14} color={Colors.textSecondary} />
            </View>
            <TouchableOpacity style={styles.categoryTrigger} onPress={() => router.push('/tabs/category')}>
              <Text style={styles.categoryTriggerText}>카테고리</Text>
              <AppIcon icon={List} size={12} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 좋아요 한 카테고리 ── */}
        {likedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리 {likedCategories.length}개</Text>
            <View style={styles.categoryRow}>
              {visibleCategories.map(category => (
                <TouchableOpacity
                  key={category.slug}
                  style={styles.categoryCard}
                  onPress={() => router.push(`/tabs/category/${category.slug}`)}
                  activeOpacity={0.85}
                >
                  <ImageBackground source={category.image} style={styles.categoryCardBg} imageStyle={styles.categoryCardBgImage}>
                    <Image source={MIC_ICON} style={styles.micIcon} />
                    <Image source={STAR_ICON} style={[styles.starIcon, { tintColor: category.colorFg }]} />
                    <View style={styles.categoryScrim} />
                    <View style={styles.categoryTextWrap}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryDesc} numberOfLines={1}>{category.description}</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
            {likedCategories.length > 2 && (
              <TouchableOpacity onPress={() => setShowAllCategories(p => !p)} style={styles.moreBtn}>
                <Text style={styles.moreBtnText}>{showAllCategories ? '접기' : '더보기'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── 저장한 단어 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>단어 {words.length}개</Text>
          <View style={styles.wordList}>
            {words.map(word => {
              const category = getCategoryBySlug(word.category);
              const secondaryCategory = word.secondaryCategory ? getCategoryBySlug(word.secondaryCategory) : undefined;
              return (
                <TouchableOpacity
                  key={word.id}
                  style={styles.wordItem}
                  onPress={() => router.push(`/tabs/dictionary/${word.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.wordItemLeft}>
                    <View style={styles.wordTopRow}>
                      <Text style={styles.wordText}>{word.word}</Text>
                      <Text style={styles.wordReading}>{word.romanization}</Text>
                      {category && (
                        <View style={[styles.wordBadge, { backgroundColor: category.colorBg }]}>
                          <Text style={[styles.wordBadgeText, { color: category.colorFg }]}>{category.name}</Text>
                        </View>
                      )}
                      {secondaryCategory && (
                        <View style={[styles.wordBadge, { backgroundColor: secondaryCategory.colorBg }]}>
                          <Text style={[styles.wordBadgeText, { color: secondaryCategory.colorFg }]}>{secondaryCategory.name}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.wordDesc} numberOfLines={1}>{word.shortDesc}</Text>
                  </View>
                  <View style={styles.wordItemRight}>
                    <AppIcon
                      icon={Star} size={18} fill="#FACC15" color="#FACC15"
                      style={styles.iconBtn} hitSlop={6}
                      onPress={() => handleRemoveWord(word.id)}
                    />
                    <AppIcon icon={Volume2} size={18} style={styles.iconBtn} onPress={() => {}} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {words.length === 0 && likedCategories.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>아직 즐겨찾기한 단어나 카테고리가 없어요</Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push('/tabs/dictionary')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>사전 둘러보기</Text>
            </TouchableOpacity>
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
  backIcon: { fontSize: 28, color: Colors.navBarIconActive, lineHeight: 34 },
  topBarTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },

  content: { paddingBottom: 40 },

  filterBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, marginTop: 16, marginBottom: 12,
  },
  totalCount: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  filterTriggers: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortTrigger: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sortTriggerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  categoryTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.divider, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6,
  },
  categoryTriggerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },

  section: { paddingHorizontal: 24, marginTop: 12, gap: 12 },
  sectionTitle: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },

  /* 좋아요 한 카테고리 */
  categoryRow: { flexDirection: 'row', gap: 12 },
  categoryCard: {
    flex: 1, height: 104, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  categoryCardBg: { flex: 1 },
  categoryCardBgImage: { resizeMode: 'cover' },
  micIcon: { position: 'absolute', left: 12, top: 12, width: 16, height: 16, tintColor: '#1A1A1A' },
  starIcon: { position: 'absolute', right: 12, top: 12, width: 16, height: 16 },
  categoryScrim: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 44,
    backgroundColor: 'rgba(248,248,248,0.88)',
  },
  categoryTextWrap: { position: 'absolute', left: 12, right: 12, bottom: 10, gap: 2 },
  categoryName: { fontSize: 13, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  categoryDesc: { fontSize: 11, color: Colors.textTertiary, fontFamily: undefined },
  moreBtn: { alignItems: 'center', paddingTop: 4 },
  moreBtnText: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },

  /* 저장한 단어 */
  wordList: { gap: 8 },
  wordItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, minHeight: 80,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  wordItemLeft: { flex: 1, gap: 8 },
  wordTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  wordText: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBar },
  wordReading: { fontSize: 12, color: Colors.textTertiary, fontFamily: undefined },
  wordBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  wordBadgeText: { fontSize: 10, fontWeight: '600' },
  wordDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: undefined },
  wordItemRight: { alignItems: 'center', gap: 4 },
  iconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 60 },
  emptyText: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: 40 },
  emptyCta: {
    marginTop: 8, paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 20, backgroundColor: Colors.navBar,
  },
  emptyCtaText: { fontSize: 13, fontWeight: '600', color: Colors.navBarIconActive },
});
