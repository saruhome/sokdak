/**
 * 호환 facade — 구현은 src/shared/i18n/으로 이동했다 (locale 리소스는 locales/*.ts,
 * 상태·persistence·번역 조회는 languageStore.ts). 기존 import 경로를 깨지 않기 위해
 * migration 기간 동안 이 파일이 전체 public API를 그대로 re-export한다.
 * 새 코드는 src/shared/i18n/languageStore에서 직접 import할 것.
 */
export { languageStore, tFor, useLanguage } from '../src/shared/i18n/languageStore';
export type { Language, TranslationKey } from '../src/shared/i18n/keys';
