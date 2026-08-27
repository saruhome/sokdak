import type { RefObject } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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
          <Text style={styles.sendBtnText}>
            {sending ? tFor(language, 'sendingLabel') : tFor(language, 'sendLabel')}
          </Text>
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
  replyingText: { flex: 1, fontSize: 12, color: Colors.navBar, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  /* 1줄(36px)로 시작해 3줄(~80px)까지 확장 — 그 이상은 내부 스크롤 */
  input: {
    flex: 1, minHeight: 36, maxHeight: 80,
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
  sendBtnText: { fontSize: 13, fontWeight: '700', color: Colors.navBarIconActive },
});
