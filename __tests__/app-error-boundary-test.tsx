import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';

let shouldThrow = true;

function RecoverableChild() {
  if (shouldThrow) throw new Error('test render failure');
  return <Text>Recovered content</Text>;
}

describe('<AppErrorBoundary />', () => {
  beforeEach(() => {
    shouldThrow = true;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a localized recovery UI for a render error and retries successfully', async () => {
    const screen = await render(
      <AppErrorBoundary>
        <RecoverableChild />
      </AppErrorBoundary>,
    );

    await waitFor(() => expect(screen.getByText('화면을 불러오지 못했어요')).toBeTruthy());
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(screen.getByLabelText('다시 시도'));

    await waitFor(() => expect(screen.getByText('Recovered content')).toBeTruthy());
  });
});
