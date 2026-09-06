import { DIALECT_REGION_LABEL_KEY, EXPRESSIONS } from '../src/features/home/model/dailyPicks';

/** 히어로 배지가 사투리 카드에서만 지역을 띄우므로 둘은 항상 함께 붙어 있어야 한다.
 * 수집 파이프라인이 매일 사투리를 추가하니 사람 검수 대신 여기서 막는다. */
describe('dialect expressions', () => {
  it('carries a known region exactly when the situation is dialect', () => {
    for (const e of EXPRESSIONS) {
      if (e.situation === 'dialect') {
        expect(e.region && DIALECT_REGION_LABEL_KEY[e.region]).toBeTruthy();
      } else {
        expect(e.region).toBeUndefined();
      }
    }
  });

  it('has at least one dialect expression for the daily dialect slot', () => {
    expect(EXPRESSIONS.some(e => e.situation === 'dialect')).toBe(true);
  });
});
