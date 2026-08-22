import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

const readJson = fileName => {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), fileName), 'utf8'));
  } catch (error) {
    console.error(`Unable to read ${fileName}: ${error.message}`);
    process.exit(1);
  }
};

const appConfig = readJson('app.json').expo;
const easConfig = readJson('eas.json');
const configErrors = [];

if (!appConfig?.name?.trim() || !appConfig.slug?.trim() || !appConfig.scheme?.trim()) {
  configErrors.push('app.json must define non-empty expo.name, expo.slug, and expo.scheme.');
}

if (!/^\d+\.\d+\.\d+$/.test(appConfig.version ?? '')) {
  configErrors.push('app.json expo.version must use a three-part semantic version.');
}

if (!/^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$/.test(appConfig.ios?.bundleIdentifier ?? '')) {
  configErrors.push('app.json ios.bundleIdentifier must use reverse-domain notation.');
}

if (!/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/.test(appConfig.android?.package ?? '')) {
  configErrors.push('app.json android.package must use reverse-domain notation.');
}

const expectedProfiles = {
  'private-beta': {
    distribution: 'internal',
    channel: 'private-beta',
    releaseStage: 'private-beta',
  },
  production: {
    channel: 'production',
    releaseStage: 'production',
  },
};

for (const [profileName, expected] of Object.entries(expectedProfiles)) {
  const profile = easConfig.build?.[profileName];
  if (!profile) {
    configErrors.push(`eas.json is missing the ${profileName} build profile.`);
    continue;
  }
  if (profile.channel !== expected.channel) {
    configErrors.push(`eas.json ${profileName}.channel must be ${expected.channel}.`);
  }
  if (profile.env?.EXPO_PUBLIC_RELEASE_STAGE !== expected.releaseStage) {
    configErrors.push(`eas.json ${profileName} must set EXPO_PUBLIC_RELEASE_STAGE=${expected.releaseStage}.`);
  }
  if (expected.distribution && profile.distribution !== expected.distribution) {
    configErrors.push(`eas.json ${profileName}.distribution must be ${expected.distribution}.`);
  }
}

if (easConfig.build?.production?.autoIncrement !== true) {
  configErrors.push('eas.json production.autoIncrement must be true.');
}

if (missing.length > 0 || invalidUrls.length > 0 || invalidEmail || configErrors.length > 0) {
  console.error(`Release configuration check failed for ${stage}.`);
  if (missing.length > 0) console.error(`Missing: ${missing.join(', ')}`);
  if (invalidUrls.length > 0) console.error(`Invalid public HTTPS URL: ${invalidUrls.join(', ')}`);
  if (invalidEmail) console.error('Invalid support email: EXPO_PUBLIC_SUPPORT_EMAIL');
  for (const error of configErrors) console.error(error);
  process.exit(1);
}

console.log(`Release configuration check passed for ${stage}; private-beta and production profiles are aligned.`);
