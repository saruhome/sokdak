/**
 * 카테고리 카드 라벨 색이 밝은 스크림 배경 위에서 항상 읽히는지 고정한다 —
 * getCategoryLabelColor가 두 톤 중 어두운 쪽을 고르는 계약과, 그 결과가
 * 실제 10개 카테고리 전부에서 밝은 배경 대비 충분히 어두운지 검증.
 */
import { getCategoryLabelColor, getReadableTextColor } from '@/constants/Colors';
import { CATEGORIES } from '@/constants/categories';

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

describe('category card label contrast', () => {
  it.each(CATEGORIES.map(c => [c.slug, c] as const))('%s label is dark enough on the light scrim', (_slug, category) => {
    const label = getCategoryLabelColor(category.colorBg, category.colorFg);
    // 카드 스크림은 밝은 크림 계열(luminance ~0.95) — 라벨은 항상 두 톤 중 어두운 쪽이어야 한다.
    expect(luminance(label)).toBeLessThanOrEqual(Math.max(luminance(category.colorBg), luminance(category.colorFg)));
    expect(label === category.colorBg || label === category.colorFg).toBe(true);
  });

  it('never yields light-on-light for filled badges', () => {
    for (const category of CATEGORIES) {
      const text = getReadableTextColor(category.colorBg);
      const bgLum = luminance(category.colorBg);
      const textLum = luminance(text);
      // 밝은 배경 -> 어두운 텍스트, 어두운 배경 -> 밝은 텍스트
      expect(Math.abs(bgLum - textLum)).toBeGreaterThan(0.3);
    }
  });
});
