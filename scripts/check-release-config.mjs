const stage = process.env.EXPO_PUBLIC_RELEASE_STAGE ?? 'production';
const validStages = new Set(['private-beta', 'production']);

if (!validStages.has(stage)) {
  console.error('Invalid EXPO_PUBLIC_RELEASE_STAGE. Use private-beta or production.');
  process.exit(1);
}

const requiredKeys = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
];

if (stage === 'production') {
  requiredKeys.push(
    'EXPO_PUBLIC_PRIVACY_POLICY_URL',
    'EXPO_PUBLIC_TERMS_OF_SERVICE_URL',
    'EXPO_PUBLIC_ACCOUNT_DELETION_URL',
    'EXPO_PUBLIC_SUPPORT_EMAIL',
  );
}

const missing = requiredKeys.filter(key => !process.env[key]?.trim());
const urlKeys = stage === 'production'
  ? ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_PRIVACY_POLICY_URL', 'EXPO_PUBLIC_TERMS_OF_SERVICE_URL', 'EXPO_PUBLIC_ACCOUNT_DELETION_URL']
  : ['EXPO_PUBLIC_SUPABASE_URL'];
const invalidUrls = urlKeys.filter(key => {
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
const invalidEmail = stage === 'production'
  && !!supportEmail
  && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail);

if (missing.length > 0 || invalidUrls.length > 0 || invalidEmail) {
  console.error(`Release configuration check failed for ${stage}.`);
  if (missing.length > 0) console.error(`Missing: ${missing.join(', ')}`);
  if (invalidUrls.length > 0) console.error(`Invalid public HTTPS URL: ${invalidUrls.join(', ')}`);
  if (invalidEmail) console.error('Invalid support email: EXPO_PUBLIC_SUPPORT_EMAIL');
  process.exit(1);
}

console.log(`Release configuration check passed for ${stage}.`);
