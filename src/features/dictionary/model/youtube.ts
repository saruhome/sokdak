/** 유튜브 임베드 관련 순수 함수 — 다운로드/재호스팅 없이 유튜브 자체 URL만 다룬다.
 * 썸네일도 유튜브 공식 썸네일 CDN URL을 그대로 쓴다(자체 캡처 이미지 저장 없음 —
 * 원본이 유튜브 서버에 남아있는 형태라 저작권/초상권 노출이 자체 호스팅보다 낮다). */

/** 유튜브 영상 ID 또는 전체 URL(watch/youtu.be/shorts/embed)에서 11자리 ID를 추출 */
export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const match = trimmed.match(re);
    if (match) return match[1];
  }
  return null;
}

/** "90", "1:30", "1:02:03" 등을 초로 변환. 이미 숫자면 그대로. */
export function parseTimeToSeconds(input: string | number | null | undefined): number | undefined {
  if (input === null || input === undefined || input === '') return undefined;
  if (typeof input === 'number') return input;
  if (/^\d+$/.test(input)) return Number(input);

  const parts = input.split(':').map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  return parts.reduce((sec, part) => sec * 60 + part, 0);
}

/** 유튜브 공식 썸네일 CDN — 자체 캡처/저장 없이 유튜브 서버의 이미지를 그대로 표시 */
export function youtubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}
