import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/components/icons/TabIcon', () => {
  const { View: MockView } = require('react-native');
  return { TabIcon: () => <MockView testID="tab-icon" /> };
});

import { TabBarIcon } from '@/app/tabs/_layout';

describe('<TabBarIcon />', () => {
  it('keeps focused tabs icon-only and does not render a repeated text label', async () => {
    const screen = await render(<TabBarIcon name="home" focused />);

    expect(screen.getByTestId('tab-icon')).toBeTruthy();
    expect(screen.queryByText('Home')).toBeNull();
    expect(screen.queryByText('홈')).toBeNull();
  });
});
