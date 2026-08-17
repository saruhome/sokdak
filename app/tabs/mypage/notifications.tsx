import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { useEffect, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { Toggle } from '@/components/Toggle';
import { authStore, type NotificationPrefs } from '../../../constants/authStore';
import { languageStore, useLanguage, type Language } from '../../../constants/languageStore';
import { BackIcon } from '@/components/icons/SocialIcons';

type NotificationKey = keyof NotificationPrefs;

const CONTENT_ITEMS: Record<Language, { key: NotificationKey; label: string; desc: string }[]> = {
  ko: [
    { key: 'newSlang',     label: '새로운 신조어/카테고리', desc: '새로운 신조어 소식을 알려드려요' },
    { key: 'popularSlang', label: '인기 신조어/카테고리',   desc: '가장 많이 검색하는 단어를 알려드려요' },
  ],
  en: [
    { key: 'newSlang',     label: 'New slang & categories', desc: 'Get notified about new slang' },
    { key: 'popularSlang', label: 'Trending slang & categories', desc: 'Get notified about the most searched words' },
  ],
  ja: [
    { key: 'newSlang',     label: '新しい新造語/カテゴリー', desc: '新しい新造語のお知らせをお届けします' },
    { key: 'popularSlang', label: '人気の新造語/カテゴリー', desc: '最も検索されている単語をお知らせします' },
  ],
  vi: [
    { key: 'newSlang',     label: 'Từ lóng/danh mục mới', desc: 'Nhận thông báo về từ lóng mới' },
    { key: 'popularSlang', label: 'Từ lóng/danh mục thịnh hành', desc: 'Nhận thông báo về những từ được tìm kiếm nhiều nhất' },
  ],
  es: [
    { key: 'newSlang',     label: 'Jerga y categorías nuevas', desc: 'Recibe avisos sobre jerga nueva' },
    { key: 'popularSlang', label: 'Jerga y categorías populares', desc: 'Recibe avisos sobre las palabras más buscadas' },
  ],
};

const COMMUNITY_ITEMS: Record<Language, { key: NotificationKey; label: string; desc: string }[]> = {
  ko: [
    { key: 'popularPost', label: '인기글 알림', desc: '베스트 게시물을 빠르게 알려드려요' },
    { key: 'like',        label: '좋아요 알림', desc: '내 게시물에 좋아요가 달리면 알려드려요' },
    { key: 'comment',     label: '댓글 알림',   desc: '내 게시물에 댓글이 작성되면 알려드려요' },
  ],
  en: [
    { key: 'popularPost', label: 'Trending posts', desc: 'Get notified about the best posts' },
    { key: 'like',        label: 'Likes', desc: 'Get notified when someone likes your post' },
    { key: 'comment',     label: 'Comments', desc: 'Get notified when someone comments on your post' },
  ],
  ja: [
    { key: 'popularPost', label: '人気投稿の通知', desc: '注目の投稿をすばやくお知らせします' },
    { key: 'like',        label: 'いいねの通知', desc: '自分の投稿にいいねが付いたらお知らせします' },
    { key: 'comment',     label: 'コメントの通知', desc: '自分の投稿にコメントが付いたらお知らせします' },
  ],
  vi: [
    { key: 'popularPost', label: 'Bài viết nổi bật', desc: 'Nhận thông báo nhanh về các bài viết hay nhất' },
    { key: 'like',        label: 'Lượt thích', desc: 'Nhận thông báo khi có người thích bài viết của bạn' },
    { key: 'comment',     label: 'Bình luận', desc: 'Nhận thông báo khi có người bình luận bài viết của bạn' },
  ],
  es: [
    { key: 'popularPost', label: 'Publicaciones destacadas', desc: 'Recibe avisos sobre las mejores publicaciones' },
    { key: 'like',        label: 'Me gusta', desc: 'Recibe avisos cuando a alguien le guste tu publicación' },
    { key: 'comment',     label: 'Comentarios', desc: 'Recibe avisos cuando alguien comente tu publicación' },
  ],
};

const DEFAULT_STATE: NotificationPrefs = {
  newSlang: true,
  popularSlang: true,
  popularPost: true,
  like: true,
  comment: true,
};

/** Figma: 831:4800 — 알림 설정 (전체 알림 + 컨텐츠 + 커뮤니티)
 * like/comment는 실제 알림 트리거가 참고하는 real setting — Supabase `profiles.notification_prefs`. */
export default function NotificationsScreen() {
  const language = useLanguage();
  const t = languageStore.t;
  const [settings, setSettings] = useState(DEFAULT_STATE);
  const allOn = Object.values(settings).every(Boolean);

  useEffect(() => {
    authStore.fetchNotificationPrefs().then(setSettings);
  }, []);

  const toggle = (key: NotificationKey) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      authStore.updateNotificationPrefs(next);
      return next;
    });
  };

  const toggleAll = () => {
    const next = !allOn;
    const nextState: NotificationPrefs = {
      newSlang: next, popularSlang: next, popularPost: next, like: next, comment: next,
    };
    setSettings(nextState);
    authStore.updateNotificationPrefs(nextState);
  };

  const renderRow = (item: { key: NotificationKey; label: string; desc: string }, isLast: boolean) => (
    <View key={item.key} style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{item.label}</Text>
        <Text style={styles.rowDesc}>{item.desc}</Text>
      </View>
      <Toggle value={settings[item.key]} onValueChange={() => toggle(item.key)} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <BackIcon size={24} color={Colors.navBarIconActive} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('notificationSettings')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{t('allNotifications')}</Text>
              <Text style={styles.rowDesc}>{t('allNotificationsDesc')}</Text>
            </View>
            <Toggle value={allOn} onValueChange={toggleAll} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t('contentSectionLabel')}</Text>
        <View style={styles.group}>
          {CONTENT_ITEMS[language].map((item, i) => renderRow(item, i === CONTENT_ITEMS[language].length - 1))}
        </View>

        <Text style={styles.sectionLabel}>{t('communitySectionLabel')}</Text>
        <View style={styles.group}>
          {COMMUNITY_ITEMS[language].map((item, i) => renderRow(item, i === COMMUNITY_ITEMS[language].length - 1))}
        </View>
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
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.navBarIconActive },

  scroll: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: Colors.textPrimary,
    marginTop: 24, marginBottom: 10,
  },
  group: {
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  rowText: { flex: 1, gap: 4 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  rowDesc: { fontSize: 12, color: Colors.textTertiary },
});
