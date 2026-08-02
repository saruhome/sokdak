/**
 * react-native-web의 Alert.alert()는 빈 no-op이라 웹에서는 로그인 필요/에러/확인 등
 * 모든 Alert 기반 안내가 아무 반응 없이 조용히 사라진다(react-native-web/src/exports/Alert).
 * 네이티브는 RN Alert 그대로 쓰고, 웹만 window.alert/confirm으로 대체한다.
 */
import { Alert as RNAlert, Platform } from 'react-native';

type AlertButton = {
  text?: string;
  onPress?: (value?: string) => void;
  style?: 'default' | 'cancel' | 'destructive';
};

function webAlert(title: string, message?: string, buttons?: AlertButton[]) {
  const text = message ? `${title}\n\n${message}` : title;
  if (!buttons || buttons.length <= 1) {
    window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }
  const cancelBtn = buttons.find(b => b.style === 'cancel') ?? buttons[0];
  const confirmBtn = buttons.find(b => b !== cancelBtn) ?? buttons[buttons.length - 1];
  if (window.confirm(text)) {
    confirmBtn.onPress?.();
  } else {
    cancelBtn.onPress?.();
  }
}

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    if (Platform.OS === 'web') {
      webAlert(title, message, buttons);
    } else {
      RNAlert.alert(title, message, buttons);
    }
  },
};
