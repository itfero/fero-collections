import Toast from 'react-native-toast-message';

export function showErrorToast(message?: string, title = 'Error') {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message ?? 'Something went wrong',
    position: 'bottom',
    visibilityTime: 4000,
    autoHide: true,
    bottomOffset: 48,
  });
}

export function showSuccessToast(message?: string, title = 'Success') {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
    autoHide: true,
    bottomOffset: 48,
  });
}

export function showInfoToast(message?: string, title = 'Info') {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
    autoHide: true,
    bottomOffset: 48,
  });
}