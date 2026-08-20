export const COMMUNITY_GUIDELINES_VERSION = '2026-08-14';

import type { Language } from './languageStore';

export const COMMUNITY_GUIDELINES = [
  '타인을 괴롭히거나 차별·혐오·위협하는 표현을 게시하지 않습니다.',
  '성적 착취, 불법 행위 조장, 자해·폭력 조장, 사기·도박 홍보 콘텐츠를 게시하지 않습니다.',
  '본인 또는 타인의 전화번호, 이메일, 주소, 계좌번호 등 개인정보를 공개하지 않습니다.',
  '타인의 저작권·초상권·상표권을 침해하는 글과 이미지를 게시하지 않습니다.',
  '신고된 콘텐츠는 운영 정책에 따라 숨김, 삭제, 계정 제한 또는 관계 기관 협조 대상이 될 수 있습니다.',
] as const;

type CommunityGuidelineCopy = {
  title: string;
  noticeTitle: string;
  noticeBody: string;
  intro: string;
  guidelines: readonly string[];
  checkboxLabel: string;
  acceptLabel: string;
  savingLabel: string;
  agreementRequiredTitle: string;
  agreementRequiredBody: string;
  acceptedTitle: string;
  acceptedBody: string;
};

const GERMAN_COMMUNITY_GUIDELINE_COPY: CommunityGuidelineCopy = {
  title: 'Community-Regeln',
  noticeTitle: 'Unser Versprechen für eine sichere Community',
  noticeBody: 'Um Beiträge und Kommentare zu schreiben, musst du den folgenden Regeln zustimmen.',
  intro: 'SokDak ist ein sicherer Ort, um koreanischen Slang und Kultur zu teilen. Gemeldete Inhalte prüft das Moderationsteam. Bei Verstößen können Beiträge verborgen oder gelöscht und Konten eingeschränkt werden.',
  guidelines: [
    'Veröffentliche keine Inhalte, die andere belästigen, diskriminieren, Hass schüren oder bedrohen.',
    'Veröffentliche keine Inhalte, die sexuelle Ausbeutung, illegale Handlungen, Selbstverletzung, Gewalt, Betrug oder Glücksspiel fördern.',
    'Gib keine persönlichen Daten wie Telefon- oder Kontonummern, E-Mail-Adressen oder Anschriften von dir oder anderen preis.',
    'Veröffentliche keine Texte oder Bilder, die Urheberrechte, Persönlichkeitsrechte oder Markenrechte anderer verletzen.',
    'Gemeldete Inhalte können gemäß den Betriebsregeln verborgen oder gelöscht werden, zu Kontoeinschränkungen führen oder an zuständige Stellen weitergegeben werden.',
  ],
  checkboxLabel: 'Ich habe die Community-Regeln gelesen und stimme ihnen zu.',
  acceptLabel: 'Zustimmen und fortfahren',
  savingLabel: 'Zustimmung wird gespeichert…',
  agreementRequiredTitle: 'Bestätigung erforderlich',
  agreementRequiredBody: 'Bitte lies die Regeln und wähle, ob du ihnen zustimmst.',
  acceptedTitle: 'Du hast den Community-Regeln zugestimmt',
  acceptedBody: 'Hilf mit, die Community sicher und respektvoll zu halten.',
};

const KOREAN_COMMUNITY_GUIDELINE_COPY: CommunityGuidelineCopy = {
  title: '커뮤니티 운영정책',
  noticeTitle: '안전한 커뮤니티를 위한 약속',
  noticeBody: '게시글과 댓글을 작성하려면 아래 운영정책에 동의해야 합니다.',
  intro: '속닥은 신조어와 한국 문화에 관한 정보를 안전하게 나누는 공간입니다. 신고된 콘텐츠는 운영팀이 검토하며, 정책을 위반하면 게시물 숨김·삭제 또는 계정 제한 조치가 이뤄질 수 있습니다.',
  guidelines: COMMUNITY_GUIDELINES,
  checkboxLabel: '운영정책을 읽었으며 이에 동의합니다.',
  acceptLabel: '동의하고 계속하기',
  savingLabel: '저장 중...',
  agreementRequiredTitle: '확인이 필요해요',
  agreementRequiredBody: '운영정책을 읽고 동의 여부를 선택해주세요.',
  acceptedTitle: '운영정책에 동의했어요',
  acceptedBody: '안전한 커뮤니티를 위해 함께 지켜주세요.',
};

/** 독일어가 아닌 기존 로케일은 기존 한국어 정책 원문을 그대로 보존한다.
 * 정책 전문은 출시 전 버전별 공개 URL과 검토된 번역본으로 교체해야 한다. */
export function getCommunityGuidelineCopy(language: Language): CommunityGuidelineCopy {
  return language === 'de' ? GERMAN_COMMUNITY_GUIDELINE_COPY : KOREAN_COMMUNITY_GUIDELINE_COPY;
}

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
