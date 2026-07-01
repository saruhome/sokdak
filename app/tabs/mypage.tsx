import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

const ACTIVITY_MENU = [
  { label: '저장한 단어', emoji: '📌' },
  { label: '내 게시글', emoji: '📝' },
  { label: '댓글 단 글', emoji: '💬' },
];

const SETTINGS_MENU = [
  { label: '내 정보 관리', emoji: '⚙️' },
  { label: '언어 설정', emoji: '🌐' },
];

export default function MyPageScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar - Figma: Navigation/TopAppBar/Default/Default (375×44) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>마이페이지</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Figma: Display/UserProfile (327×60) */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>속닥 유저</Text>
            <Text style={styles.profileEmail}>user@sokdak.com</Text>
          </View>
        </View>

        {/* Figma: Frame 535 - 활동 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>활동</Text>
          <View style={styles.menuGroup}>
            {ACTIVITY_MENU.map((item) => (
              <TouchableOpacity key={item.label} style={styles.menuItem}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Figma: Frame 536 - 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>설정</Text>
          <View style={styles.menuGroup}>
            {SETTINGS_MENU.map((item) => (
              <TouchableOpacity key={item.label} style={styles.menuItem}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Figma: 고객센터 텍스트 */}
        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>고객센터</Text>
          </TouchableOpacity>
        </View>

        {/* Figma: Controls/Buttons/Text Button_02 - 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  scroll: { flex: 1 },
  // Display/UserProfile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    height: 80,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.navBar,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 22 },
  profileInfo: { gap: 2 },
  profileName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  profileEmail: { fontSize: 12, color: Colors.textTertiary },
  // 섹션
  section: { paddingHorizontal: 24, marginTop: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary, marginBottom: 8 },
  menuGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuEmoji: { fontSize: 18, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  menuArrow: { fontSize: 18, color: Colors.textTertiary },
  // 하단
  footerLinks: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  footerLink: { fontSize: 13, color: Colors.textTertiary },
  logoutBtn: {
    marginHorizontal: 24,
    marginBottom: 32,
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { fontSize: 15, color: Colors.error, fontWeight: '600' },
});
