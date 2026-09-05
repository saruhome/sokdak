import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import ProfileAvatar from '@/components/ProfileAvatar';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { authStore } from '../../../constants/authStore';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { BackIcon } from '@/components/icons/SocialIcons';
import { Camera } from 'lucide-react-native';
import { AppIcon } from '@/components/AppIcon';
import { removeProfileAvatar, uploadProfileAvatar } from '@/constants/profileAvatarStorage';

/** featured: 기본으로 노출 12개국(6×2줄) — 한국어 학습 인구가 많은 나라 (세종학당 수강생 통계 기준,
 * 튀르키예·인도는 최근 수요 급증국으로 추가) */
const COUNTRY_OPTIONS = [
  { flag: '🇰🇷', en: 'South Korea', ko: '대한민국', featured: true },
  { flag: '🇯🇵', en: 'Japan', ko: '일본', featured: true },
  { flag: '🇨🇳', en: 'China', ko: '중국', featured: true },
  { flag: '🇹🇼', en: 'Taiwan', ko: '대만' },
  { flag: '🇭🇰', en: 'Hong Kong', ko: '홍콩' },
  { flag: '🇻🇳', en: 'Vietnam', ko: '베트남', featured: true },
  { flag: '🇹🇭', en: 'Thailand', ko: '태국', featured: true },
  { flag: '🇵🇭', en: 'Philippines', ko: '필리핀', featured: true },
  { flag: '🇮🇩', en: 'Indonesia', ko: '인도네시아', featured: true },
  { flag: '🇲🇾', en: 'Malaysia', ko: '말레이시아' },
  { flag: '🇸🇬', en: 'Singapore', ko: '싱가포르' },
  { flag: '🇮🇳', en: 'India', ko: '인도', featured: true },
  { flag: '🇲🇳', en: 'Mongolia', ko: '몽골', featured: true },
  { flag: '🇰🇭', en: 'Cambodia', ko: '캄보디아' },
  { flag: '🇲🇲', en: 'Myanmar', ko: '미얀마' },
  { flag: '🇱🇦', en: 'Laos', ko: '라오스' },
  { flag: '🇳🇵', en: 'Nepal', ko: '네팔' },
  { flag: '🇧🇩', en: 'Bangladesh', ko: '방글라데시' },
  { flag: '🇵🇰', en: 'Pakistan', ko: '파키스탄' },
  { flag: '🇺🇿', en: 'Uzbekistan', ko: '우즈베키스탄', featured: true },
  { flag: '🇰🇿', en: 'Kazakhstan', ko: '카자흐스탄' },
  { flag: '🇸🇦', en: 'Saudi Arabia', ko: '사우디아라비아' },
  { flag: '🇦🇪', en: 'United Arab Emirates', ko: '아랍에미리트' },
  { flag: '🇮🇱', en: 'Israel', ko: '이스라엘' },
  { flag: '🇹🇷', en: 'Turkey', ko: '튀르키예', featured: true },
  { flag: '🇮🇷', en: 'Iran', ko: '이란' },
  { flag: '🇮🇶', en: 'Iraq', ko: '이라크' },
  { flag: '🇪🇬', en: 'Egypt', ko: '이집트' },
  { flag: '🇬🇧', en: 'United Kingdom', ko: '영국' },
  { flag: '🇫🇷', en: 'France', ko: '프랑스' },
  { flag: '🇩🇪', en: 'Germany', ko: '독일' },
  { flag: '🇮🇹', en: 'Italy', ko: '이탈리아' },
  { flag: '🇪🇸', en: 'Spain', ko: '스페인' },
  { flag: '🇵🇹', en: 'Portugal', ko: '포르투갈' },
  { flag: '🇳🇱', en: 'Netherlands', ko: '네덜란드' },
  { flag: '🇧🇪', en: 'Belgium', ko: '벨기에' },
  { flag: '🇨🇭', en: 'Switzerland', ko: '스위스' },
  { flag: '🇦🇹', en: 'Austria', ko: '오스트리아' },
  { flag: '🇸🇪', en: 'Sweden', ko: '스웨덴' },
  { flag: '🇳🇴', en: 'Norway', ko: '노르웨이' },
  { flag: '🇩🇰', en: 'Denmark', ko: '덴마크' },
  { flag: '🇫🇮', en: 'Finland', ko: '핀란드' },
  { flag: '🇵🇱', en: 'Poland', ko: '폴란드' },
  { flag: '🇨🇿', en: 'Czechia', ko: '체코' },
  { flag: '🇬🇷', en: 'Greece', ko: '그리스' },
  { flag: '🇭🇺', en: 'Hungary', ko: '헝가리' },
  { flag: '🇷🇴', en: 'Romania', ko: '루마니아' },
  { flag: '🇺🇦', en: 'Ukraine', ko: '우크라이나' },
  { flag: '🇷🇺', en: 'Russia', ko: '러시아' },
  { flag: '🇮🇪', en: 'Ireland', ko: '아일랜드' },
  { flag: '🇺🇸', en: 'United States', ko: '미국', featured: true },
  { flag: '🇨🇦', en: 'Canada', ko: '캐나다' },
  { flag: '🇲🇽', en: 'Mexico', ko: '멕시코' },
  { flag: '🇧🇷', en: 'Brazil', ko: '브라질' },
  { flag: '🇦🇷', en: 'Argentina', ko: '아르헨티나' },
  { flag: '🇨🇱', en: 'Chile', ko: '칠레' },
  { flag: '🇨🇴', en: 'Colombia', ko: '콜롬비아' },
  { flag: '🇵🇪', en: 'Peru', ko: '페루' },
  { flag: '🇦🇺', en: 'Australia', ko: '호주' },
  { flag: '🇳🇿', en: 'New Zealand', ko: '뉴질랜드' },
  { flag: '🇿🇦', en: 'South Africa', ko: '남아프리카공화국' },
  { flag: '🇳🇬', en: 'Nigeria', ko: '나이지리아' },
  { flag: '🇰🇪', en: 'Kenya', ko: '케냐' },
  { flag: '🇲🇦', en: 'Morocco', ko: '모로코' },
];

/** Figma: 229:3295 — 내 정보 관리 (닉네임·이메일·프로필 이미지 수정) */
export default function ProfileScreen() {
  const t = languageStore.t;
  const language = useLanguage();
  const user = authStore.getUser();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState(user?.timezone ?? 'UTC');
  const [emoji, setEmoji] = useState(user?.emoji ?? '🇰🇷');
  const [countryQuery, setCountryQuery] = useState('');
  /* 국기 그리드는 한 줄 6개 고정(운영자 규칙) — 컨테이너 실측폭으로 셀 크기를 계산해
   * 좌우 여백이 항상 대칭이 되게 한다. */
  const [flagGridW, setFlagGridW] = useState(0);
  const FLAG_GAP = 8;
  const flagCell = flagGridW > 0 ? Math.floor((flagGridW - FLAG_GAP * 5) / 6) : 44;
  /* 현재 UI 언어 국가명은 데이터를 따로 두지 않고 국기 이모지→ISO 코드→Intl.DisplayNames로 얻는다.
   * Intl 미지원 환경(구형 Hermes 등)에서는 기존 한국어/영어 검색으로 폴백. */
  const regionNames = useMemo(() => {
    try { return new Intl.DisplayNames([language], { type: 'region' }); } catch { return null; }
  }, [language]);
  const codeOfFlag = (flag: string) =>
    [...flag].map(ch => String.fromCodePoint((ch.codePointAt(0) ?? 0) - 0x1f1e6 + 65)).join('');
  const localCountryName = (flag: string) => {
    try { return regionNames?.of(codeOfFlag(flag)) ?? ''; } catch { return ''; }
  };
  const q = countryQuery.trim().toLowerCase();
  const filteredCountries = q
    ? COUNTRY_OPTIONS.filter(c =>
        c.en.toLowerCase().includes(q) ||
        c.ko.includes(countryQuery.trim()) ||
        localCountryName(c.flag).toLowerCase().includes(q),
      )
    : COUNTRY_OPTIONS.filter(c => c.featured);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null | undefined>(user?.avatarUrl ?? null);
  const [avatarChange, setAvatarChange] = useState<'unchanged' | 'replace' | 'remove'>('unchanged');
  const [pendingAvatar, setPendingAvatar] = useState<{ uri: string; mimeType?: string | null } | null>(null);
  /* 사진 관리 진입점은 닉네임 옆 아바타 탭 — 사진 없으면 바로 선택기, 있으면 인라인 메뉴(변경/삭제).
   * 웹 Alert 래퍼가 버튼 2개까지만 지원해 액션시트 대신 인라인 메뉴를 쓴다. */
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [tzPickerOpen, setTzPickerOpen] = useState(false);
  const [tzQuery, setTzQuery] = useState('');
  const timezoneOptions = useMemo<string[]>(() => {
    try {
      const list = (Intl as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.('timeZone');
      if (list?.length) return ['UTC', ...list.filter(z => z !== 'UTC')];
    } catch { /* 구형 엔진 폴백 */ }
    // ponytail: Intl.supportedValuesOf 미지원 엔진용 최소 목록 — 유저 국가 분포 기준, 부족하면 추가
    return ['UTC', 'Asia/Seoul', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Taipei', 'Asia/Hong_Kong',
      'Asia/Ho_Chi_Minh', 'Asia/Bangkok', 'Asia/Manila', 'Asia/Jakarta', 'Asia/Kuala_Lumpur',
      'Asia/Singapore', 'Asia/Kolkata', 'Asia/Ulaanbaatar', 'Asia/Tashkent', 'Asia/Almaty',
      'Europe/Istanbul', 'Asia/Dubai', 'Asia/Riyadh', 'Africa/Cairo', 'Europe/London', 'Europe/Berlin',
      'Europe/Paris', 'Europe/Madrid', 'Europe/Rome', 'Europe/Moscow', 'Europe/Kyiv', 'Europe/Warsaw',
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Toronto',
      'America/Mexico_City', 'America/Sao_Paulo', 'America/Buenos_Aires', 'America/Santiago',
      'America/Bogota', 'America/Lima', 'Australia/Sydney', 'Pacific/Auckland', 'Africa/Johannesburg'];
  }, []);
  const filteredTimezones = tzQuery.trim()
    ? timezoneOptions.filter(z => z.toLowerCase().includes(tzQuery.trim().toLowerCase()))
    : timezoneOptions;

  useEffect(() => {
    return authStore.subscribe(() => {
      if (avatarChange === 'unchanged') setAvatarPreviewUrl(authStore.getUser()?.avatarUrl ?? null);
    });
  }, [avatarChange]);

  if (!user) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>{t('loginRequiredGeneric')}</Text>
        <TouchableOpacity accessibilityRole="button" style={styles.notFoundBtn} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.notFoundBtnText}>{t('goToLogin')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isValid = name.trim().length >= 1;
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissionNeededTitle'), t('galleryPermissionMessage'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const asset = result.assets[0];
      setPendingAvatar({ uri: asset.uri, mimeType: asset.mimeType });
      setAvatarPreviewUrl(asset.uri);
      setAvatarChange('replace');
    }
  };

  const removePhoto = () => {
    setPendingAvatar(null);
    setAvatarPreviewUrl(null);
    setAvatarChange('remove');
  };

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert(t('inputCheckTitle'), t('nicknameRequiredMessage'));
      return;
    }
    setSaving(true);
    let nextAvatarPath = user.avatarPath ?? null;
    let uploadedAvatarPath: string | null = null;

    if (avatarChange === 'replace' && pendingAvatar) {
      const upload = await uploadProfileAvatar(pendingAvatar);
      if (upload.error || !upload.path) {
        setSaving(false);
        Alert.alert(t('saveFailedTitle'), upload.error ?? t('saveFailedTitle'));
        return;
      }
      nextAvatarPath = upload.path;
      uploadedAvatarPath = upload.path;
    } else if (avatarChange === 'remove') {
      nextAvatarPath = null;
    }

    const { error } = await authStore.updateUser({
      name: name.trim(), emoji,
      ...(avatarChange === 'unchanged' ? {} : { avatarPath: nextAvatarPath }),
      timezone: timezone.trim() || 'UTC',
    });
    if (error && uploadedAvatarPath) await removeProfileAvatar(uploadedAvatarPath);
    if (!error && email.trim() !== user.email) {
      const res = await authStore.updateEmail(email.trim());
      if (res.error) { setSaving(false); Alert.alert(t('saveFailedTitle'), res.error); return; }
    }
    if (!error && password) {
      const res = await authStore.updatePassword(password);
      if (res.error) { setSaving(false); Alert.alert(t('saveFailedTitle'), res.error); return; }
      setPassword('');
    }
    setSaving(false);
    if (error) {
      Alert.alert(t('saveFailedTitle'), error);
      return;
    }
    if (avatarChange !== 'unchanged' && user.avatarPath !== nextAvatarPath) {
      await removeProfileAvatar(user.avatarPath);
    }
    Alert.alert(t('saveCompleteTitle'), t('saveCompleteMessage'), [{ text: t('confirmLabel'), onPress: () => safeGoBack('/tabs/mypage') }]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('withdrawConfirmTitle'),
      t('withdrawConfirmMessage'),
      [
        { text: t('cancelLabel'), style: 'cancel' },
        {
          text: t('withdrawConfirmBtn'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await authStore.deleteAccount();
            if (error) { Alert.alert(t('withdrawFailedTitle'), error); return; }
            router.replace('/tabs');
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity accessibilityRole="button" style={styles.backBtn} onPress={() => safeGoBack('/tabs/mypage')}>
            <BackIcon size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{t('myInfoTitle')}</Text>
          <TouchableOpacity accessibilityRole="button"
            style={[styles.saveBtn, isValid && !saving && { backgroundColor: Colors.navBar }]}
            onPress={handleSave}
            disabled={!isValid || saving}
          >
            <Text style={[styles.saveBtnText, isValid && !saving && { color: Colors.navBarIconActive }]}>
              {saving ? t('savingLabel') : t('saveBtnLabel')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.profileHeader}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={avatarPreviewUrl ? t('changePhoto') : t('addPhoto')}
              onPress={() => (avatarPreviewUrl ? setPhotoMenuOpen(v => !v) : pickPhoto())}
              activeOpacity={0.8}
            >
              <ProfileAvatar uri={avatarPreviewUrl} emoji={emoji} size={76} style={styles.avatarPreview} />
              {/* 편집 배지는 뒤로가기·알림과 같은 벡터 아이콘 계열(운영자 지시 2026-09-03) */}
              <View style={styles.avatarBadge}><AppIcon icon={Camera} size={14} color={Colors.textPrimary} /></View>
            </TouchableOpacity>
            <View style={styles.profileNameBox}>
              <Text style={styles.fieldLabel}>{t('nicknameLabel')}</Text>
              <TextInput
                style={[styles.fieldInput, styles.nameInput]}
                value={name}
                onChangeText={setName}
                placeholder={t('nicknamePlaceholder')}
                placeholderTextColor={Colors.textTertiary}
                maxLength={20}
              />
            </View>
          </View>
          {photoMenuOpen && (
            <View style={styles.photoMenuRow}>
              <TouchableOpacity accessibilityRole="button"
                style={styles.photoMenuBtn}
                onPress={() => { setPhotoMenuOpen(false); pickPhoto(); }}
              >
                <Text style={styles.photoMenuText}>{t('changePhoto')}</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button"
                style={styles.photoMenuBtn}
                onPress={() => { setPhotoMenuOpen(false); removePhoto(); }}
              >
                <Text style={[styles.photoMenuText, { color: Colors.error }]}>{t('removePhoto')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>{t('accountInfoSection')}</Text>

          <View style={styles.cardGroup}>
            <View style={styles.cardItem}>
              <Text style={styles.cardLabel}>{t('emailLabel')}</Text>
              <TextInput
                style={styles.cardInput}
                value={email}
                onChangeText={setEmail}
                placeholder={t('emailPlaceholder')}
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.cardItem}>
              <Text style={styles.cardLabel}>{t('passwordLabel')}</Text>
              <TextInput
                style={styles.cardInput}
                value={password}
                onChangeText={setPassword}
                placeholder={t('passwordChangePlaceholder')}
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
              />
            </View>
            <TouchableOpacity accessibilityRole="button" style={styles.cardItem} onPress={() => setTzPickerOpen(true)} activeOpacity={0.7}>
              <Text style={styles.cardLabel}>{t('timezoneLabel')}</Text>
              <View style={styles.tzValueRow}>
                <Text style={styles.cardInput}>{timezone}</Text>
                <Text style={styles.tzChevron}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 계정 정보 섹션과 같은 타이틀 + 내부 간격 8px */}
          <View style={styles.avatarSection}>
          <Text style={[styles.sectionTitle, styles.noMargin]}>{t('profileIconHint')}</Text>
          <Text style={styles.avatarHintSmall}>{t('avatarHintSmall')}</Text>
          <TextInput
            style={styles.countrySearchInput}
            value={countryQuery}
            onChangeText={setCountryQuery}
            placeholder={t('countrySearchPlaceholder')}
            placeholderTextColor={Colors.textTertiary}
          />
          <View style={styles.emojiGrid} onLayout={e => setFlagGridW(e.nativeEvent.layout.width)}>
            {filteredCountries.map(c => (
              <TouchableOpacity accessibilityRole="button"
                key={c.flag}
                style={[
                  styles.emojiOption,
                  { width: flagCell, height: flagCell, borderRadius: flagCell / 2 },
                  c.flag === emoji && styles.emojiOptionActive,
                ]}
                onPress={() => setEmoji(c.flag)}
              >
                <Text style={styles.emojiOptionText}>{c.flag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          </View>

          {/* 파괴적 액션은 일반 버튼과 같은 무게로 두지 않는다 — 작은 텍스트 링크로 강등(디자인 감사 2026-09-02) */}
          <TouchableOpacity style={styles.withdrawLink} onPress={handleDeleteAccount} accessibilityRole="button">
            <Text style={styles.withdrawLinkText}>{t('withdrawAccount')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={tzPickerOpen} transparent animationType="fade" onRequestClose={() => setTzPickerOpen(false)}>
          <View style={styles.tzModalBackdrop}>
            <View style={styles.tzModalCard}>
              <Text style={styles.tzModalTitle}>{t('timezoneLabel')}</Text>
              <TextInput
                style={styles.countrySearchInput}
                value={tzQuery}
                onChangeText={setTzQuery}
                placeholder={t('timezonePlaceholder')}
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
              />
              <FlatList
                data={filteredTimezones}
                keyExtractor={z => z}
                style={styles.tzList}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity accessibilityRole="button"
                    style={[styles.tzRow, item === timezone && styles.tzRowActive]}
                    onPress={() => { setTimezone(item); setTzQuery(''); setTzPickerOpen(false); }}
                  >
                    <Text style={[styles.tzRowText, item === timezone && styles.tzRowTextActive]}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity accessibilityRole="button" style={styles.tzCloseBtn} onPress={() => { setTzQuery(''); setTzPickerOpen(false); }}>
                <Text style={styles.tzCloseText}>{t('cancelLabel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  profileNameBox: { flex: 1, gap: 8 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  cardGroup: { width: '100%', gap: 12 },
  cardItem: {
    width: '100%',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    gap: 6,
  },
  cardLabel: { fontSize: 11, color: Colors.textTertiary },
  cardInput: { fontFamily: 'NotoSerifKR_400Regular', fontSize: 15, color: Colors.textPrimary, padding: 0 },

  avatarSection: { gap: 8 },
  noMargin: { marginBottom: 0 },
  avatarHintSmall: { fontSize: 11, color: Colors.textTertiary },
  avatarBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  photoMenuRow: { flexDirection: 'row', gap: 10, marginTop: -8 },
  photoMenuBtn: {
    flex: 1, height: 40, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  photoMenuText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  tzValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tzChevron: { fontSize: 18, color: Colors.textTertiary },
  tzModalBackdrop: {
    flex: 1, backgroundColor: 'rgba(30, 29, 26, 0.45)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  tzModalCard: {
    width: '100%', maxHeight: '75%',
    backgroundColor: Colors.background, borderRadius: 16, padding: 16, gap: 10,
  },
  tzModalTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  tzList: { flexGrow: 0 },
  tzRow: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tzRowActive: { backgroundColor: Colors.accent + '15', borderRadius: 8 },
  tzRowText: { fontSize: 14, color: Colors.textPrimary },
  tzRowTextActive: { color: Colors.accent, fontWeight: '700' },
  tzCloseBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
  tzCloseText: { fontSize: 15, color: Colors.textSecondary },

  countrySearchInput: {
    height: 40, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingHorizontal: 12,
    fontSize: 14, color: Colors.textPrimary, fontFamily: 'NotoSerifKR_400Regular',
  },
  emojiGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 8 },
  emojiOption: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  emojiOptionActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '15' },
  emojiOptionText: { fontSize: 20 },

  withdrawLink: { alignSelf: 'center', marginTop: 20, paddingVertical: 10, paddingHorizontal: 12 },
  withdrawLinkText: { fontSize: 13, color: Colors.textTertiary, textDecorationLine: 'underline' },

  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  fieldInput: { fontFamily: 'NotoSerifKR_400Regular',
    height: 48, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingHorizontal: 14,
    fontSize: 15, color: Colors.textPrimary,
  },
  nameInput: { fontFamily: 'NotoSerifKR_400Regular', width: '100%' },

  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  notFoundBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  notFoundBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
