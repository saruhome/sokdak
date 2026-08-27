import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';
import { BOARD_COLORS, getBoardLabel, type PostBoard } from '@/constants/mockPosts';
import { tFor, type Language } from '@/constants/languageStore';

export type CommunityBoardTab = '전체' | PostBoard;

/**
 * 커뮤니티 게시판 필터 바 — 선택 상태를 색뿐 아니라 underline+bold+accessibilityState로 전달하고,
 * 좁은 화면/큰 글꼴에서 잘리는 대신 가로 스크롤된다. 콜백만 받는 순수 컴포넌트.
 */
export function CommunityFilterBar({
  tabs,
  active,
  onSelect,
  language,
}: {
  tabs: CommunityBoardTab[];
  active: CommunityBoardTab;
  onSelect: (tab: CommunityBoardTab) => void;
  language: Language;
}) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {tabs.map(tab => {
          const selected = active === tab;
          const activeColor = tab === '전체' ? Colors.navBar : BOARD_COLORS[tab as PostBoard].bg;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onSelect(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.tab, selected && { borderBottomColor: activeColor, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.tabText, selected && { color: activeColor, fontWeight: '700' }]}>
                {tab === '전체' ? tFor(language, 'allLabel') : getBoardLabel(tab as PostBoard, language)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1, borderBottomColor: Colors.divider, marginTop: 12 },
  row: { gap: 24, paddingHorizontal: 24 },
  tab: {
    minHeight: 44, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 16, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textTertiary },
});
