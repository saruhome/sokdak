import { render } from '@testing-library/react-native';
import { CharacterSuccessFeedback } from '@/components/CharacterSuccessFeedback';

describe('CharacterSuccessFeedback', () => {
  const image = require('../assets/characters/poses/horang-cheer.png');

  it('announces the localized success state without exposing the decorative character', async () => {
    const screen = await render(
      <CharacterSuccessFeedback
        image={image}
        title="Saved"
        word="갓생"
        testID="word-saved-success-feedback"
      />,
    );

    const feedback = screen.getByTestId('word-saved-success-feedback');
    expect(feedback).toBeTruthy();
    expect(feedback.props.accessibilityRole).toBe('alert');
    expect(feedback.props.accessibilityLiveRegion).toBe('polite');
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.getByText('“갓생”')).toBeTruthy();
  });
});
