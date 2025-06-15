import React from 'react';
import { Alert, AlertButton } from 'react-native';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface CustomAlertProps {
  title: string;
  message: string;
  type?: AlertType;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

const showAlert = ({
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK' }],
  onDismiss,
}: CustomAlertProps) => {
  Alert.alert(
    title,
    message,
    [
      ...buttons,
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onDismiss,
      },
    ],
    { cancelable: true }
  );
};

export default showAlert;

// Usage example:
// showAlert({
//   title: 'Success',
//   message: 'Account created successfully!',
//   type: 'success',
//   buttons: [
//     {
//       text: 'OK',
//       onPress: () => console.log('OK Pressed'),
//     },
//   ],
// }); 