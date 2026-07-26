import {
  StyleSheet, View, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import ProfileAvatar from '@/components/ProfileAvatar';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { authStore } from '../../../constants/authStore';

const EMOJI_OPTIONS = ['🐦', '🐯', '🇰🇷', '🇺🇸', '🇯🇵', '🇨🇳', '🇫🇷', '🇩🇪', '🇧🇷', '✨'];

/** Figma: 229:3295 — 내 정보 관리 (닉네임·이메일·프로필 이미지 수정) */
export default function ProfileScreen() {
  const user = authStore.getUser();

  const [name, setName] = useState(user?.name ?? '');
  const email = user?.email ?? '';
  const [emoji, setEmoji] = useState(user?.emoji ?? '🐦');
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(user?.avatarUrl ?? null);

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

  const isValid = name.trim().length >= 1;
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    setAvatarUrl(null);
  };

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert('입력 확인', '닉네임을 입력해주세요.');
      return;
    }
    setSaving(true);
    const { error } = await authStore.updateUser({ name: name.trim(), emoji, avatarUrl: avatarUrl ?? null });
    setSaving(false);
    if (error) {
      Alert.alert('저장 실패', error);
      return;
    }
    Alert.alert('저장 완료', '내 정보가 수정됐어요.', [{ text: '확인', onPress: () => safeGoBack() }]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>내 정보 관리</Text>
          <TouchableOpacity
            style={[styles.saveBtn, isValid && !saving && { backgroundColor: Colors.navBar }]}
            onPress={handleSave}
            disabled={!isValid || saving}
          >
            <Text style={[styles.saveBtnText, isValid && !saving && { color: Colors.navBarIconActive }]}>
              {saving ? '저장 중…' : '저장'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.profileHeader}>
            <ProfileAvatar uri={avatarUrl} emoji={emoji} size={76} style={styles.avatarPreview} />
            <View style={styles.profileNameBox}>
              <Text style={styles.fieldLabel}>닉네임</Text>
              <TextInput
                style={[styles.fieldInput, styles.nameInput]}
                value={name}
                onChangeText={setName}
                placeholder="닉네임을 입력하세요"
                placeholderTextColor={Colors.textTertiary}
                maxLength={20}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>계정 정보</Text>

          <View style={styles.cardGroup}>
            <View style={styles.cardItem}>
              <View>
                <Text style={styles.cardLabel}>이메일 Email</Text>
                <Text style={styles.cardText}>{email}</Text>
              </View>
            </View>
            <View style={styles.cardItem}>
              <View>
                <Text style={styles.cardLabel}>비밀번호 Password</Text>
                <Text style={styles.cardText}>******</Text>
              </View>
            </View>
            <View style={styles.cardItem}>
              <View>
                <Text style={styles.cardLabel}>휴대폰 번호 Phone Number</Text>
                <Text style={styles.cardText}>+43 680 1224 7685</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.cardItem, styles.cardItemButton]} activeOpacity={0.8} onPress={() => {}}>
              <View>
                <Text style={styles.cardLabel}>시간대 Time Zone</Text>
                <Text style={styles.cardText}>Europe/Berlin</Text>
              </View>
              <View style={styles.cardArrow} />
            </TouchableOpacity>
          </View>

          <Text style={styles.avatarHint}>프로필 아이콘 선택</Text>
          <View style={styles.avatarActionRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto} activeOpacity={0.8}>
              <Text style={styles.photoBtnText}>{avatarUrl ? '사진 바꾸기' : '사진 추가'}</Text>
            </TouchableOpacity>
            {avatarUrl ? (
              <TouchableOpacity style={styles.photoRemoveBtn} onPress={removePhoto} activeOpacity={0.8}>
                <Text style={styles.photoRemoveText}>사진 제거</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.avatarHintSmall}>국기 이모지 또는 프로필 사진을 선택할 수 있어요.</Text>
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

          <TouchableOpacity style={styles.logoutBtn} onPress={() => authStore.logout()}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
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

  scroll: { paddingHorizontal: 24, paddingVertical: 24, gap: 20 },

  profileHeader: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 12,
  },
  avatarPreview: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: Colors.navBar, alignItems: 'center', justifyContent: 'center',
  },
  avatarPreviewText: { fontSize: 36 },
  profileNameBox: { flex: 1, gap: 8 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  cardGroup: { width: '100%', gap: 12 },
  cardItem: {
    width: '100%', minHeight: 80,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cardItemButton: { backgroundColor: Colors.surface },
  cardLabel: { fontSize: 11, color: Colors.textTertiary, marginBottom: 6 },
  cardText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },
  cardArrow: {
    width: 10, height: 10, borderLeftWidth: 1, borderBottomWidth: 1,
    borderColor: Colors.textTertiary, transform: [{ rotate: '45deg' }],
  },

  avatarHint: { fontSize: 12, color: Colors.textTertiary, marginBottom: 8 },
  avatarHintSmall: { fontSize: 11, color: Colors.textTertiary, marginBottom: 14 },
  avatarActionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  photoBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.navBar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBtnText: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive },
  photoRemoveBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  photoRemoveText: { fontSize: 14, color: Colors.textSecondary },

  emojiGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10 },
  emojiOption: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  emojiOptionActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '15' },
  emojiOptionText: { fontSize: 20 },

  logoutBtn: {
    width: '100%', height: 48,
    borderRadius: 10, backgroundColor: Colors.divider,
    alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  logoutText: { fontSize: 15, color: Colors.textSecondary },

  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  fieldInput: {
    height: 48, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingHorizontal: 14,
    fontSize: 15, color: Colors.textPrimary,
  },
  nameInput: { width: '100%' },
  fieldInputDisabled: { backgroundColor: Colors.divider, color: Colors.textTertiary },
  fieldHint: { fontSize: 11, color: Colors.textTertiary },

  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  notFoundBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  notFoundBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
