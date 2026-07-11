import {
  StyleSheet, View, SafeAreaView, FlatList, TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { MOCK_WORDS, type Word } from '../../../constants/mockWords';
import { authStore } from '../../../constants/authStore';

/** Figma: 229:3738 — 저장한 단어 (북마크된 단어 목록, 삭제 가능) */
export default function SavedWordsScreen() {
  const [savedIds, setSavedIds] = useState<string[]>(authStore.getSavedWordIds());

  /* 다른 화면(단어 상세)에서 저장/해제 후 돌아왔을 때 동기화 */
  useFocusEffect(
    useCallback(() => {
      setSavedIds(authStore.getSavedWordIds());
    }, []),
  );

  /* 이 화면이 떠 있는 동안 삭제 등으로 바뀐 값도 즉시 반영 */
  useEffect(() => {
    const unsub = authStore.subscribeBookmarks(() => setSavedIds(authStore.getSavedWordIds()));
    return () => { unsub(); };
  }, []);

  const words = savedIds
    .map(id => MOCK_WORDS.find(w => w.id === id))
    .filter((w): w is Word => !!w);

  const handleRemove = (id: string) => {
    authStore.toggleWordSaved(id);
    setSavedIds(authStore.getSavedWordIds());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>저장한 단어</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={words}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.wordItem}
            onPress={() => router.push(`/tabs/dictionary/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.wordItemLeft}>
              <Text style={styles.wordText}>{item.word}</Text>
              <Text style={styles.wordDesc} numberOfLines={1}>{item.shortDesc}</Text>
            </View>
            <View style={styles.wordRight}>
              <Text style={styles.wordCategory}>{item.category}</Text>
              <TouchableOpacity onPress={() => handleRemove(item.id)} hitSlop={8}>
                <Text style={styles.removeIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📌</Text>
            <Text style={styles.emptyText}>아직 저장한 단어가 없어요</Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push('/tabs/dictionary')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>사전 둘러보기</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={words.length === 0 ? { flex: 1 } : { paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  wordItem: {
    flexDirection: 'row', alignItems: 'center', height: 80,
    paddingHorizontal: 20, backgroundColor: Colors.background,
  },
  wordItemLeft: { flex: 1, gap: 4 },
  wordText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  wordDesc: { fontSize: 12, color: Colors.textSecondary },
  wordRight: { alignItems: 'center', gap: 10, flexDirection: 'row' },
  wordCategory: {
    fontSize: 10, color: Colors.accent, fontWeight: '600',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  removeIcon: { fontSize: 15 },

  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: 20 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 14, color: Colors.textTertiary },
  emptyCta: {
    marginTop: 8, paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 20, backgroundColor: Colors.navBar,
  },
  emptyCtaText: { fontSize: 13, fontWeight: '600', color: Colors.navBarIconActive },
});
