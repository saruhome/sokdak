const requiredKeys = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_PRIVACY_POLICY_URL',
  'EXPO_PUBLIC_TERMS_OF_SERVICE_URL',
  'EXPO_PUBLIC_ACCOUNT_DELETION_URL',
  'EXPO_PUBLIC_SUPPORT_EMAIL',
];

const missing = requiredKeys.filter(key => !process.env[key]?.trim());
const invalidUrls = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_PRIVACY_POLICY_URL',
  'EXPO_PUBLIC_TERMS_OF_SERVICE_URL',
  'EXPO_PUBLIC_ACCOUNT_DELETION_URL',
].filter(key => {
  const value = process.env[key];
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol !== 'https:' || url.hostname.includes('example.');
  } catch {
    return true;
  }
});

const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL;
const invalidEmail = !!supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail);

if (missing.length > 0 || invalidUrls.length > 0 || invalidEmail) {
  console.error('Release configuration check failed.');
  if (missing.length > 0) console.error(`Missing: ${missing.join(', ')}`);
  if (invalidUrls.length > 0) console.error(`Invalid public HTTPS URL: ${invalidUrls.join(', ')}`);
  if (invalidEmail) console.error('Invalid support email: EXPO_PUBLIC_SUPPORT_EMAIL');
  process.exit(1);
}

console.log('Release configuration check passed.');
