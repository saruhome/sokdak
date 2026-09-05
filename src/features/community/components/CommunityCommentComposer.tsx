import type { RefObject } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';
import { tFor, type Language } from '@/constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { X } from 'lucide-react-native';

/**
 * 댓글 입력창 — 1줄로 시작해 최대 3줄까지 자연스럽게 늘어난다.
 * 답글 모드에서는 대상 닉네임을 배너로 보여주고, 전송 중에는 중복 제출을 막는다.
 * 상태와 동작은 전부 부모가 소유한다(순수 표시 컴포넌트).
 */
export function CommunityCommentComposer({
  language,
  value,
  onChangeText,
  onSend,
  sending,
  replyingToName,
  onCancelReply,
  inputRef,
}: {
  language: Language;
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  replyingToName: string | null;
  onCancelReply: () => void;
  inputRef?: RefObject<TextInput | null>;
}) {
  return (
    <View style={styles.wrap}>
      {replyingToName != null && (
        <View style={styles.replyingBanner}>
          <Text style={styles.replyingText} numberOfLines={1}>
            {tFor(language, 'replyingLabel')} · {replyingToName}
          </Text>
          <AppIcon
            icon={X} size={14} color={Colors.textTertiary}
            hitSlop={12}
            accessibilityLabel={tFor(language, 'cancelLabel')}
            onPress={onCancelReply}
          />
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={tFor(language, 'commentPlaceholder')}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!value.trim() || sending) && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={!value.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel={tFor(language, 'sendLabel')}
          accessibilityState={{ disabled: !value.trim() || sending }}
        >
          {/* 전송 중에도 라벨을 바꾸지 않는다 — '전송 중…'으로 바뀌면 버튼 폭이 늘어나 입력창이 줄어듦.
            * 진행 표시는 비활성(회색) 상태로 충분(전송은 보통 1초 미만). */}
          <Text style={styles.sendBtnText}>{tFor(language, 'sendLabel')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1, borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  replyingBanner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: Colors.navBar + '15',
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  replyingText: { flex: 1, fontSize: 12, color: Colors.navBar, fontFamily: 'NotoSerifKR_600SemiBold' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  /* 네이티브: 1줄(36px)로 시작해 3줄(~80px)까지 확장 — 그 이상은 내부 스크롤.
   * 웹: textarea가 minHeight를 무시하고 기본 2줄 높이로 렌더돼 전송 버튼(36px)보다
   * 커지므로 높이를 버튼과 동일하게 고정한다(길어지면 내부 스크롤). */
  input: { fontFamily: 'NotoSerifKR_400Regular',
    flex: 1, minHeight: 36, maxHeight: 80,
    ...(Platform.OS === 'web' ? { height: 36, maxHeight: 36 } : null),
    backgroundColor: Colors.surface,
    borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 14, color: Colors.textPrimary,
  },
  sendBtn: {
    height: 36, paddingHorizontal: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar, borderRadius: 18,
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendBtnText: { fontSize: 13, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.navBarIconActive },
});
