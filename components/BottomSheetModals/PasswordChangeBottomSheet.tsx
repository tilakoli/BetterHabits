import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import InputField from '@/components/InputField/InputField';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface PasswordChangeBottomSheetProps {
  bottomSheetRef: any;
}

export default function PasswordChangeBottomSheet({ bottomSheetRef }: PasswordChangeBottomSheetProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const snapPoints = useMemo(() => ['60%'], []);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const handleClose = () => {
    bottomSheetRef.current?.close();
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        throw new Error('User not found');
      }

      // Reauthenticate
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      Alert.alert('Success', 'Password updated successfully!', [{ text: 'OK', onPress: handleClose }]);
    } catch (error: any) {
      let errorMessage = 'Failed to change password';
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ newPassword: 'Password is too weak' });
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.text + '40' }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FontAwesome name="times" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formContainer}>
          <View style={styles.inputsContainer}>
            <View>
              <InputField
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChangeText={(text) => {
                  setPasswordData({ ...passwordData, currentPassword: text });
                  setErrors({ ...errors, currentPassword: '' });
                }}
                secureTextEntry
                leftIcon="lock"
                editable={!isLoading}
              />
              {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
            </View>

            <View>
              <InputField
                placeholder="New Password"
                value={passwordData.newPassword}
                onChangeText={(text) => {
                  setPasswordData({ ...passwordData, newPassword: text });
                  setErrors({ ...errors, newPassword: '' });
                }}
                secureTextEntry
                leftIcon="key"
                editable={!isLoading}
              />
              {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
            </View>

            <View>
              <InputField
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChangeText={(text) => {
                  setPasswordData({ ...passwordData, confirmPassword: text });
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                secureTextEntry
                leftIcon="key"
                editable={!isLoading}
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
<Text style={[styles.helperText, { color: colors.text + '80' }]}>
              Password must be at least 6 characters long
            </Text>
            
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }, isLoading && styles.disabledButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    flex: 1,
  },
  inputsContainer: {
    gap: 16,
    flex: 1,
    height: '100%',
    justifyContent: 'space-around'
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {},
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButtonText: {
    color: '#FFF',
  },
});