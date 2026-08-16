import { act, render, userEvent, waitFor } from '@testing-library/react-native';

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Mic: () => React.createElement(Text, null, 'mic'),
    Square: () => React.createElement(Text, null, 'stop'),
  };
});

jest.mock('expo-speech-recognition', () => {
  const React = require('react');
  const listeners: Record<string, (event: any) => void> = {};
  const module = {
    isRecognitionAvailable: jest.fn(() => true),
    requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
    start: jest.fn(),
    stop: jest.fn(),
  };

  return {
    ExpoSpeechRecognitionModule: module,
    useSpeechRecognitionEvent: (eventName: string, listener: (event: any) => void) => {
      React.useEffect(() => {
        listeners[eventName] = listener;
        return () => { delete listeners[eventName]; };
      }, [eventName, listener]);
    },
    __speechMock: { listeners, module },
  };
});

type SpeechMock = {
  listeners: Record<string, (event: any) => void>;
  module: {
    isRecognitionAvailable: jest.Mock;
    requestPermissionsAsync: jest.Mock;
    start: jest.Mock;
    stop: jest.Mock;
  };
};

const { VoiceSearchButton } = require('@/components/VoiceSearchButton') as typeof import('@/components/VoiceSearchButton');

const { __speechMock } = jest.requireMock('expo-speech-recognition') as {
  __speechMock: SpeechMock;
};

describe('VoiceSearchButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __speechMock.module.isRecognitionAvailable.mockReturnValue(true);
    __speechMock.module.requestPermissionsAsync.mockResolvedValue({ granted: true });
  });

  it('마이크 권한 후 ko-KR 음성 인식을 시작하고 최종 결과를 검색어로 전달한다', async () => {
    const onTranscript = jest.fn();
    const user = userEvent.setup();
    const view = await render(<VoiceSearchButton onTranscript={onTranscript} contextualStrings={['MZ세대', '갓생']} />);

    await user.press(view.getByLabelText('음성 검색'));

    await waitFor(() => {
      expect(__speechMock.module.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(__speechMock.module.start).toHaveBeenCalledWith(expect.objectContaining({
        lang: 'ko-KR',
        continuous: false,
        contextualStrings: ['MZ세대', '갓생'],
      }));
    });

    await act(async () => {
      __speechMock.listeners.result({
        isFinal: true,
        results: [{ transcript: ' 갓생 ', confidence: 1, segments: [] }],
      });
    });

    expect(onTranscript).toHaveBeenCalledWith('갓생');
  });

  it('인식 중 버튼을 누르면 새 세션을 만들지 않고 인식을 중지한다', async () => {
    const user = userEvent.setup();
    const view = await render(<VoiceSearchButton onTranscript={jest.fn()} />);

    await act(async () => { __speechMock.listeners.start(null); });
    await waitFor(() => expect(view.getByLabelText('음성 검색 중지')).toBeTruthy());
    await user.press(view.getByLabelText('음성 검색 중지'));

    expect(__speechMock.module.stop).toHaveBeenCalledTimes(1);
    expect(__speechMock.module.start).not.toHaveBeenCalled();
  });
});
