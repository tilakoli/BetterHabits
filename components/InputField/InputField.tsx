import React, { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Text } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';

export interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  // Formik props
  error?: string;
  touched?: boolean;
  
  // Custom props
  leftIcon?: {
    name: string;
    size?: number;
  };
  rightIcon?: {
    name: string;
    size?: number;
    onPress?: () => void;
  };
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  showError?: boolean;
  label?: string;
  helperText?: string;
}

const InputField = forwardRef<TextInput, InputFieldProps>(({
  error,
  touched,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  errorStyle,
  showError = true,
  label,
  helperText,
  secureTextEntry,
  ...props
}, ref) => {
  const colorScheme = useColorScheme() || 'light';
  const themeColors = Colors[colorScheme as keyof typeof Colors];
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(!secureTextEntry);

  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <FontAwesome
        name={leftIcon.name as any}
        size={leftIcon.size || 18}
        color={colorScheme === 'dark' ? '#A0A0A0' : '#666'}
        style={styles.inputIcon}
      />
    );
  };

  const renderRightIcon = () => {
    if (!rightIcon) return null;

    return (
      <TouchableOpacity
        onPress={rightIcon.onPress}
        style={styles.rightIconContainer}
      >
        <FontAwesome
          name={rightIcon.name as any}
          size={rightIcon.size || 18}
          color={colorScheme === 'dark' ? '#A0A0A0' : '#666'}
        />
      </TouchableOpacity>
    );
  };

  const hasError = touched && error;
  const borderColor = hasError ? '#ff3b30' : themeColors.border;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: themeColors.text }]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: themeColors.card, borderColor },
          containerStyle,
        ]}
      >
        {renderLeftIcon()}
        
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { color: themeColors.text },
            inputStyle,
          ]}
          placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={handlePasswordToggle}
            style={styles.passwordToggle}
          >
            <FontAwesome
              name={isPasswordVisible ? 'eye-slash' : 'eye'}
              size={18}
              color={colorScheme === 'dark' ? '#A0A0A0' : '#666'}
            />
          </TouchableOpacity>
        )}

        {renderRightIcon()}
      </View>

      {showError && hasError && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}

      {helperText && !hasError && (
        <Text style={[styles.helperText, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  rightIconContainer: {
    padding: 8,
  },
  passwordToggle: {
    padding: 8,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

InputField.displayName = 'InputField';

export default InputField; 