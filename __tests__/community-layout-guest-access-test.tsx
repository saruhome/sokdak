import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  Stack.Screen = () => null;
  return { Stack };
});

jest.mock('@/constants/Colors', () => ({
  Colors: { background: '#ffffff' },
}));

import CommunityLayout from '@/app/tabs/community/_layout';

describe('<CommunityLayout />', () => {
  it('renders the community stack without a global guest-login redirect', () => {
    expect(() => render(<CommunityLayout />)).not.toThrow();
  });
});
