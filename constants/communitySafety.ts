export const COMMUNITY_GUIDELINES_VERSION = '2026-08-14';

export const COMMUNITY_GUIDELINES = [
  '타인을 괴롭히거나 차별·혐오·위협하는 표현을 게시하지 않습니다.',
  '성적 착취, 불법 행위 조장, 자해·폭력 조장, 사기·도박 홍보 콘텐츠를 게시하지 않습니다.',
  '본인 또는 타인의 전화번호, 이메일, 주소, 계좌번호 등 개인정보를 공개하지 않습니다.',
  '타인의 저작권·초상권·상표권을 침해하는 글과 이미지를 게시하지 않습니다.',
  '신고된 콘텐츠는 운영 정책에 따라 숨김, 삭제, 계정 제한 또는 관계 기관 협조 대상이 될 수 있습니다.',
] as const;

const MAX_TITLE_LENGTH = 80;
const MAX_CONTENT_LENGTH = 3_000;

const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /(?:01[016789][-\s]?\d{3,4}[-\s]?\d{4})/,
    message: '전화번호로 보이는 정보는 게시할 수 없어요. 개인정보를 제거한 뒤 다시 작성해주세요.',
  },
  {
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    message: '이메일 주소로 보이는 정보는 게시할 수 없어요. 개인정보를 제거한 뒤 다시 작성해주세요.',
  },
  {
    pattern: /\b\d{6}[-\s]?\d{7}\b/,
    message: '민감한 식별 정보로 보이는 숫자는 게시할 수 없어요.',
  },
];

export type CommunitySafetyResult = { ok: true } | { ok: false; message: string };

/**
 * 클라이언트의 1차 안전 가드다. 운영자가 서버 측 모더레이션과 신고 검토를 병행해야 하며,
 * 이 검증만으로 유해 콘텐츠를 완전히 탐지한다고 가정해서는 안 된다.
 */
export function validateCommunityText(text: string, kind: 'post' | 'comment'): CommunitySafetyResult {
  const normalized = text.trim();
  const maxLength = kind === 'post' ? MAX_CONTENT_LENGTH : 1_000;
  if (!normalized) return { ok: false, message: '내용을 입력해주세요.' };
  if (normalized.length > maxLength) {
    return { ok: false, message: `내용은 최대 ${maxLength.toLocaleString('ko-KR')}자까지 작성할 수 있어요.` };
  }

  const sensitive = SENSITIVE_PATTERNS.find(({ pattern }) => pattern.test(normalized));
  if (sensitive) return { ok: false, message: sensitive.message };
  return { ok: true };
}

export function validateCommunityPost(title: string, content: string): CommunitySafetyResult {
  const normalizedTitle = title.trim();
  if (normalizedTitle.length < 2) return { ok: false, message: '제목은 2자 이상 입력해주세요.' };
  if (normalizedTitle.length > MAX_TITLE_LENGTH) {
    return { ok: false, message: `제목은 최대 ${MAX_TITLE_LENGTH}자까지 작성할 수 있어요.` };
  }

  const titleSafety = validateCommunityText(normalizedTitle, 'comment');
  if (!titleSafety.ok) return titleSafety;
  return validateCommunityText(content, 'post');
}
