import React from 'react';
import { render, userEvent, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/constants/authStore', () => ({
  authStore: {
    isLoggedIn: jest.fn(),
    acceptCommunityGuidelines: jest.fn(),
  },
}));

jest.mock('@/constants/languageStore', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/constants/navigation', () => ({
  safeGoBack: jest.fn(),
}));

jest.mock('@/constants/alert', () => ({
  Alert: { alert: jest.fn() },
}));

jest.mock('@/components/AppText', () => ({
  AppText: require('react-native').Text,
}));

jest.mock('@/components/AppIcon', () => ({
  AppIcon: () => null,
}));

jest.mock('lucide-react-native', () => ({
  Check: () => null,
  ShieldAlert: () => null,
}));

jest.mock('@/components/icons/SocialIcons', () => ({
  BackIcon: () => null,
}));

import { router } from 'expo-router';
import { authStore } from '@/constants/authStore';
import { useLanguage } from '@/constants/languageStore';
import { safeGoBack } from '@/constants/navigation';
import { Alert } from '@/constants/alert';
import CommunityGuidelinesScreen from '@/app/tabs/mypage/community-guidelines';

const mockPush = router.push as jest.Mock;
const mockAuthStore = authStore as unknown as {
  isLoggedIn: jest.Mock;
  acceptCommunityGuidelines: jest.Mock;
};
const mockUseLanguage = useLanguage as jest.Mock;
const mockSafeGoBack = safeGoBack as jest.Mock;
const mockAlert = Alert.alert as jest.Mock;

const checkboxName = '커뮤니티 운영정책 동의';
const continueName = '운영정책 동의하고 계속하기';

async function explicitlyAgree(
  screen: Awaited<ReturnType<typeof render>>,
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.press(screen.getByRole('checkbox', { name: checkboxName }));
  await waitFor(() => {
    expect(screen.getByRole('checkbox', { name: checkboxName }).props.accessibilityState)
      .toMatchObject({ checked: true });
  });
}

describe('<CommunityGuidelinesScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStore.isLoggedIn.mockReturnValue(true);
    mockUseLanguage.mockReturnValue('vi');
    mockAuthStore.acceptCommunityGuidelines.mockResolvedValue({
      error: null,
      consent: { policy_locale: 'vi' },
    });
  });

  it('keeps the agree action disabled until the policy checkbox is selected', async () => {
    const screen = await render(<CommunityGuidelinesScreen />);
    const user = userEvent.setup();

    expect(screen.getByRole('checkbox', { name: checkboxName }).props.accessibilityState)
      .toMatchObject({ checked: false });
    expect(screen.getByRole('button', { name: continueName }).props.accessibilityState)
      .toMatchObject({ disabled: true });

    await user.press(screen.getByRole('button', { name: continueName }));
    expect(mockAuthStore.acceptCommunityGuidelines).not.toHaveBeenCalled();
  });

  it('sends the current UI locale to the consent ledger after explicit agreement', async () => {
    const screen = await render(<CommunityGuidelinesScreen />);
    const user = userEvent.setup();

    await explicitlyAgree(screen, user);
    await user.press(screen.getByRole('button', { name: continueName }));

    await waitFor(() => {
      expect(mockAuthStore.acceptCommunityGuidelines).toHaveBeenCalledWith({
        locale: 'vi',
        source: 'community_onboarding',
      });
    });
    expect(mockAlert).toHaveBeenCalledWith(
      '운영정책에 동의했어요',
      '안전한 커뮤니티를 위해 함께 지켜주세요.',
    );
    expect(mockSafeGoBack).toHaveBeenCalledTimes(1);
  });

  it('routes an unauthenticated user to login without writing a consent record', async () => {
    mockAuthStore.isLoggedIn.mockReturnValue(false);
    const screen = await render(<CommunityGuidelinesScreen />);
    const user = userEvent.setup();

    await explicitlyAgree(screen, user);
    await user.press(screen.getByRole('button', { name: continueName }));

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
    expect(mockAuthStore.acceptCommunityGuidelines).not.toHaveBeenCalled();
  });

  it('shows an error and remains on the policy screen when the server rejects consent', async () => {
    mockAuthStore.acceptCommunityGuidelines.mockResolvedValue({
      error: 'No published community policy translation exists for locale vi',
    });
    const screen = await render(<CommunityGuidelinesScreen />);
    const user = userEvent.setup();

    await explicitlyAgree(screen, user);
    await user.press(screen.getByRole('button', { name: continueName }));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        '동의 저장에 실패했어요',
        'No published community policy translation exists for locale vi',
      );
    });
    expect(mockSafeGoBack).not.toHaveBeenCalled();
  });
});
