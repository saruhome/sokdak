import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useState } from 'react';
import { Colors, getCategoryLabelColor, getReadableTextColor } from '@/constants/Colors';
import { CATEGORIES, getCategoryBySlug, getCategoryName } from '@/constants/categories';
import { languageStore, useLanguage } from '@/constants/languageStore';
import { SCREEN_HEIGHT } from '@/constants/layout';
import { type Word } from '@/constants/words';
import { AppIcon } from '@/components/AppIcon';
import { BottomSheet } from '@/components/BottomSheet';
import { ChevronDown, List, X, RotateCcw } from 'lucide-react-native';

export const SORT_TABS = ['인기순', '최신순', 'ㄱㄴㄷ순'] as const;

/** 기본(단자음) 초성 14개 — 겹자음(ㄲㄸㅃㅆㅉ)은 필터 UI에 없어 아래 매핑으로 기본 자음에 합친다 */
export const CONSONANT_FILTERS = ['전체', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const;
const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const DOUBLED_TO_BASE: Record<string, string> = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };

/** 완성형 한글 음절이면 초성을, 낱자음(ㅋㅋ 같은 초성체 단어)이면 첫 글자 자체를 기본 자음으로 정규화해 반환 */
export function getInitialConsonant(word: string): string | null {
  if (!word) return null;
  const code = word.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const cho = CHOSEONG[Math.floor((code - 0xAC00) / (21 * 28))];
    return DOUBLED_TO_BASE[cho] ?? cho;
  }
  const ch = word[0];
  return DOUBLED_TO_BASE[ch] ?? ch;
}

/** 단어가 선택된 카테고리들 중 하나라도 속하는지 (주/보조 카테고리 모두 검사) */
export function matchesCategories(word: Word, slugs: string[]) {
  if (slugs.length === 0) return true;
  return slugs.includes(word.category) || (!!word.secondaryCategory && slugs.includes(word.secondaryCategory));
}

/** SORT_TABS 인덱스에 맞춰 정렬한 새 배열 반환 */
export function sortWords(list: Word[], sortIndex: number): Word[] {
  const base = [...list];
  if (sortIndex === 0) return base.sort((a, b) => b.likes - a.likes);
  if (sortIndex === 1) return base.sort((a, b) => Number(b.id) - Number(a.id));
  return base.sort((a, b) => a.word.localeCompare(b.word, 'ko'));
}

/**
 * 단어 목록 화면들이 공유하는 필터 바 — "총 N 단어 / 정렬 / 카테고리" 행,
 * 적용된 카테고리 칩, 카테고리 선택 모달, ㄱㄴㄷ순일 때의 초성 필터까지 담당한다.
 * 사전·카테고리 상세·즐겨찾기가 같은 동작을 하도록 한 곳에 모았다.
 */
export function WordFilterBar({
  total,
  sortIndex,
  onCycleSort,
  categorySlugs,
  onToggleCategory,
  onClearCategories,
  consonant,
  onSelectConsonant,
}: {
  total: number;
  sortIndex: number;
  onCycleSort: () => void;
  categorySlugs: string[];
  onToggleCategory: (slug: string) => void;
  onClearCategories: () => void;
  consonant: string;
  onSelectConsonant: (c: string) => void;
}) {
  const language = useLanguage();
  const t = languageStore.t;
  const [pickerOpen, setPickerOpen] = useState(false);
  const showConsonantRow = sortIndex === 2;
  const sortLabel = sortIndex === 0 ? t('sortPopular') : sortIndex === 1 ? t('sortRecent') : t('sortConsonant');

  return (
    <>
      <View style={styles.filterBar}>
        <Text style={styles.totalCount}>
          {t('totalPrefix')} <Text style={styles.totalCountNumber}>{total}</Text> {t('wordsSuffix')}
        </Text>
        <View style={styles.filterTriggers}>
          <TouchableOpacity style={styles.sortTrigger} onPress={onCycleSort}>
            <Text style={styles.sortTriggerText}>{sortLabel}</Text>
            <AppIcon icon={ChevronDown} size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTrigger} onPress={() => setPickerOpen(true)}>
            <Text style={styles.categoryTriggerText}>{t('categoryFilterLabel')}</Text>
            <AppIcon icon={List} size={12} color={Colors.textSecondary} />
            {/* Figma: 필터가 걸려 있으면 버튼에 활성 점 표시 */}
            {categorySlugs.length > 0 && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* 적용된 카테고리 칩 (× 로 개별 해제) */}
      {categorySlugs.length > 0 && (
        <View style={styles.chipRow}>
          {categorySlugs.map(slug => {
            const c = getCategoryBySlug(slug);
            if (!c) return null;
            return (
              <TouchableOpacity key={slug} style={styles.chip} onPress={() => onToggleCategory(slug)}>
                <Text style={styles.chipText} numberOfLines={1}>{getCategoryName(c, language)}</Text>
                <AppIcon icon={X} size={12} color={Colors.textTertiary} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {showConsonantRow && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.consonantRowScroll}
          contentContainerStyle={styles.consonantRow}
        >
          {CONSONANT_FILTERS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.consonantChip, consonant === c && styles.consonantChipActive]}
              onPress={() => onSelectConsonant(c)}
            >
              <Text style={[styles.consonantChipText, consonant === c && styles.consonantChipTextActive]}>
                {c === '전체' ? t('allLabel') : c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Figma: Filter/Category/Bottom sheet — 아래에서 올라오고, 바깥을 누르면 닫힌다 */}
      <BottomSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} panelStyle={styles.modalSheet}>
        <View style={styles.grabHandle} />
        <View style={styles.modalHint}>
          <Text style={styles.modalHintText} numberOfLines={1}>{t('modalHint')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.chipGrid}>
          <View style={styles.chipGridHeader}>
            <Text style={styles.chipGridTitle}>{t('categoryFilterLabel')}</Text>
            <Text style={styles.chipCount}>
              {categorySlugs.length}
              <Text style={styles.chipCountTotal}>/{CATEGORIES.length}</Text>
            </Text>
          </View>
          <View style={styles.chipGridRow}>
            {CATEGORIES.map(c => {
              const on = categorySlugs.includes(c.slug);
              return (
                <TouchableOpacity
                  key={c.slug}
                  style={[styles.pickChip, on && { backgroundColor: c.colorBg, borderColor: c.colorBg }]}
                  onPress={() => onToggleCategory(c.slug)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pickChipText,
                      { color: on ? getReadableTextColor(c.colorBg) : getCategoryLabelColor(c.colorBg, c.colorFg) },
                    ]}
                    numberOfLines={1}
                  >
                    {getCategoryName(c, language)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.modalReset} onPress={onClearCategories}>
            <AppIcon icon={RotateCcw} size={16} color={Colors.textTertiary} />
            <Text style={styles.modalResetText}>{t('resetLabel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalApply} onPress={() => setPickerOpen(false)}>
            <Text style={styles.modalApplyText}>
              {language === 'ko' ? `총 ${categorySlugs.length}개 적용하기` : `${t('applyLabel')} ${categorySlugs.length}`}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 24, marginTop: 24, marginBottom: 12,
  },
  totalCount: { fontSize: 12, color: Colors.textSecondary },
  totalCountNumber: { fontSize: 12, color: Colors.textPrimary, fontWeight: '700' },
  filterTriggers: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortTrigger: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sortTriggerText: { fontSize: 12, color: Colors.textSecondary },
  categoryTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.divider, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6,
  },
  categoryTriggerText: { fontSize: 12, color: Colors.textSecondary },
  filterDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.point1 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginHorizontal: 24, marginBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipText: { fontSize: 12, color: Colors.textTertiary },

  /* width:100%이 없으면 네이티브(Yoga)에서 칩 14개의 내용 너비가 그대로 부모 컬럼의
   * 최소 너비로 계산돼 검색바·배너·단어카드까지 전부 오른쪽으로 늘어난다(웹은 overflow
   * 스크롤 요소의 자동 최소 크기가 0이라 발생하지 않아 재현되지 않았음). */
  consonantRowScroll: { width: '100%' },
  consonantRow: { gap: 8, paddingHorizontal: 24, paddingBottom: 12 },
  consonantChip: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  consonantChipActive: { backgroundColor: Colors.navBar, borderColor: Colors.navBar },
  consonantChipText: { fontSize: 13, color: Colors.textSecondary },
  consonantChipTextActive: { color: Colors.navBarIconActive, fontFamily: 'NotoSerifKR_600SemiBold' },

  /* maxHeight를 '80%'로 두면 BottomSheet의 Animated.View 래퍼가 높이를 못 정해(퍼센트
   * 기준이 되는 부모 높이가 콘텐츠 크기에 따라 달라지는 순환 참조) 시트 아래로 빈 공간이
   * 생겨 하단 탭바가 그대로 드러났다 — 고정 px 기준(SCREEN_HEIGHT)으로 바꿔 해결. */
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: Colors.border,
    paddingTop: 16, maxHeight: SCREEN_HEIGHT * 0.8,
  },
  grabHandle: {
    alignSelf: 'center', width: 96, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, marginBottom: 16,
  },
  modalHint: {
    paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border,
  },
  modalHintText: { fontSize: 14, color: Colors.textPrimary, textAlign: 'center' },

  chipGrid: { paddingHorizontal: 24, paddingTop: 16, gap: 12 },
  chipGridHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  chipGridTitle: { fontSize: 18, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  chipCount: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  chipCountTotal: { color: Colors.textTertiary },
  chipGridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickChip: {
    height: 36, paddingHorizontal: 16, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 1, elevation: 1,
  },
  pickChipText: { fontSize: 14, fontFamily: 'NotoSerifKR_600SemiBold' },

  modalFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  modalReset: {
    width: 56, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    backgroundColor: Colors.divider, borderWidth: 1, borderColor: Colors.border,
  },
  modalResetText: { fontSize: 10, color: Colors.textTertiary },
  modalApply: {
    flex: 1, height: 48, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 1, elevation: 2,
  },
  modalApplyText: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
});
