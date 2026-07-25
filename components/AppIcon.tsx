import { useState } from 'react';
import { Pressable, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';

/** Sok-Dak Color/Font_03(본문) — 앱 전체 아이콘 기본색 */
export const ICON_DEFAULT = Colors.textSecondary;
/** Sok-Dak Color/Point_02 — 마우스 호버 시 색 */
export const ICON_HOVER = Colors.point2;

/**
 * 앱 공통 아이콘 래퍼 — Lucide 아이콘을 통일된 스타일로 렌더링한다.
 * - Outline 전용, 선 두께 1.5px 고정 (absoluteStrokeWidth: 크기와 무관하게 항상 1.5px)
 * - 기본색 Font_03/본문, 마우스 호버 시 Point_02 — 웹/포인터 환경에서 동작,
 *   터치 기기에는 호버 개념이 없어 기본색 유지
 * - 다크 배경(헤더/FAB 등) 위에서는 color로 밝은 색을 넘겨 대비 확보
 * - 표준 크기 24×24px (SOKDAK_GUIDELINES.md 4-5) — 검색바(18px)·메타 아이콘(12px) 등은
 *   컨텍스트별로 호출부에서 size를 개별 지정
 */
export function AppIcon({
  icon: Icon,
  size = 24,
  color = ICON_DEFAULT,
  hoverColor = ICON_HOVER,
  fill,
  onPress,
  hitSlop,
  style,
}: {
  icon: LucideIcon;
  size?: number;
  color?: string;
  hoverColor?: string;
  /** 저장됨/좋아요 등 활성 상태 표현용 채움색 (외곽선은 유지) */
  fill?: string;
  onPress?: () => void;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [hovered, setHovered] = useState(false);
  const stroke = hovered ? hoverColor : color;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      hitSlop={hitSlop}
      style={style}
    >
      <Icon size={size} color={stroke} strokeWidth={1.5} absoluteStrokeWidth fill={fill ?? 'none'} />
    </Pressable>
  );
}

/** 조회수/좋아요/댓글수 등 "아이콘+숫자" 메타 표시용 헬퍼 — 이모지(👁❤️💬) 대체 */
export function IconStat({
  icon,
  value,
  size = 12,
  color = ICON_DEFAULT,
  textStyle,
}: {
  icon: LucideIcon;
  value: string | number;
  size?: number;
  color?: string;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <AppIcon icon={icon} size={size} color={color} />
      <Text style={textStyle}>{value}</Text>
    </View>
  );
}
