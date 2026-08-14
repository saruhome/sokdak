export type LegalLinkKey = 'privacyPolicy' | 'termsOfService' | 'accountDeletion';

export const LEGAL_LINKS: Record<LegalLinkKey, string | undefined> = {
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
  termsOfService: process.env.EXPO_PUBLIC_TERMS_OF_SERVICE_URL,
  accountDeletion: process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL,
};

export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL;

export function isValidPublicUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.hostname.includes('example.');
  } catch {
    return false;
  }
}

export function hasRequiredLegalLinks(): boolean {
  return Object.values(LEGAL_LINKS).every(isValidPublicUrl);
}
