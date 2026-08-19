jest.mock('expo-constants', () => ({ expoConfig: { version: '1.0.0-beta.1' } }));
jest.mock('@/constants/languageStore', () => ({
  languageStore: { getLanguage: () => 'en' },
}));

import { reportAppError } from '@/constants/errorReporting';

describe('reportAppError privacy minimization', () => {
  it('redacts email addresses, tokens, passwords, bearer credentials, and phone-like values', () => {
    const payload = reportAppError(
      new Error('email=user@example.com token=secret-token password=hunter2 Bearer abc.def.ghi +82 10 1234 5678'),
      { source: 'network_request', route: '/tabs/mypage' },
    );

    expect(payload.errorMessage).toContain('[redacted-email]');
    expect(payload.errorMessage).toContain('token=[redacted]');
    expect(payload.errorMessage).toContain('password=[redacted]');
    expect(payload.errorMessage).toContain('Bearer [redacted]');
    expect(payload.errorMessage).toContain('[redacted-phone]');
    expect(payload.errorMessage).not.toContain('user@example.com');
    expect(payload.errorMessage).not.toContain('secret-token');
    expect(payload.errorMessage).not.toContain('hunter2');
  });
});
