import {
  StyleSheet, View, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { authStore } from '../../../constants/authStore';

const EMOJI_OPTIONS = ['🦊', '🐯', '🇰🇷', '🇺🇸', '🇯🇵', '🇨🇳', '🇫🇷', '🇩🇪', '🇧🇷', '✨'];

/** Figma: 229:3295 — 내 정보 관리 (닉네임·이메일·프로필 이미지 수정) */
export default function ProfileScreen() {
  const user = authStore.getUser();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [emoji, setEmoji] = useState(user?.emoji ?? '🦊');

  if (!user) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>로그인이 필요해요</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.notFoundBtnText}>로그인하러 가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isValid = name.trim().length >= 1 && /\S+@\S+\.\S+/.test(email.trim());

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('입력 확인', '닉네임과 올바른 이메일 주소를 입력해주세요.');
      return;
    }
    authStore.updateUser({ name: name.trim(), email: email.trim(), emoji });
    Alert.alert('저장 완료', '내 정보가 수정됐어요.', [{ text: '확인', onPress: () => router.back() }]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>내 정보 관리</Text>
          <TouchableOpacity
            style={[styles.saveBtn, isValid && { backgroundColor: Colors.navBar }]}
            onPress={handleSave}
            disabled={!isValid}
          >
            <Text style={[styles.saveBtnText, isValid && { color: Colors.navBarIconActive }]}>저장</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatarPreview}>
              <Text style={styles.avatarPreviewText}>{emoji}</Text>
            </View>
            <Text style={styles.avatarHint}>프로필 아이콘 선택</Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiOption, e === emoji && styles.emojiOptionActive]}
                  onPress={() => setEmoji(e)}
                >
                  <Text style={styles.emojiOptionText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>닉네임</Text>
            <TextInput
              style={styles.fieldInput}
              value={name}
              onChangeText={setName}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor={Colors.textTertiary}
              maxLength={20}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>이메일</Text>
            <TextInput
              style={styles.fieldInput}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.border, marginRight: 4 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textTertiary },

  scroll: { padding: 24, gap: 8 },

  avatarSection: { alignItems: 'center', marginBottom: 24, gap: 8 },
  avatarPreview: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: Colors.navBar, alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  avatarPreviewText: { fontSize: 36 },
  avatarHint: { fontSize: 12, color: Colors.textTertiary, marginBottom: 4 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  emojiOption: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  emojiOptionActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '15' },
  emojiOptionText: { fontSize: 20 },

  field: { marginBottom: 20, gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  fieldInput: {
    height: 48, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingHorizontal: 14,
    fontSize: 15, color: Colors.textPrimary,
  },

  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  notFoundBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  notFoundBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
