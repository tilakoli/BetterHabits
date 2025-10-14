import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';

interface EditFieldBottomSheetProps {
  bottomSheetRef: any;
  title: string;
  fieldLabel: string;
  currentValue: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  maxLength?: number;
  onSave: (value: string) => Promise<void>;
  validate?: (value: string) => string | null; // Returns error message or null
  multiline?: boolean;
  helperText?: string;
}

export default function EditFieldBottomSheet({
  bottomSheetRef,
  title,
  fieldLabel,
  currentValue,
  placeholder,
  keyboardType = 'default',
  maxLength,
  onSave,
  validate,
  multiline = false,
  helperText,
}: EditFieldBottomSheetProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const snapPoints = useMemo(() => ['50%'], []);

  const [value, setValue] = useState(currentValue);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update value when currentValue changes
  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleClose = () => {
    bottomSheetRef.current?.close();
    setValue(currentValue); // Reset to original value
    setError(null);
  };

  const handleSave = async () => {
    // Validate if validator provided
    if (validate) {
      const validationError = validate(value.trim());
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Check if value changed
    if (value.trim() === currentValue.trim()) {
      handleClose();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(value.trim());
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const isValueChanged = value.trim() !== currentValue.trim();

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
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FontAwesome name="times" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
        >
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{fieldLabel}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: error ? '#E74C3C' : colors.text + '20',
                },
                multiline && styles.multilineInput,
              ]}
              value={value}
              onChangeText={(text) => {
                setValue(text);
                setError(null);
              }}
              placeholder={placeholder}
              placeholderTextColor={colors.text + '60'}
              keyboardType={keyboardType}
              maxLength={maxLength}
              autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
              autoCorrect={false}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
            />
            {helperText && !error && (
              <Text style={[styles.helperText, { color: colors.text + '80' }]}>
                {helperText}
              </Text>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {maxLength && (
              <Text style={[styles.characterCount, { color: colors.text + '60' }]}>
                {value.length}/{maxLength}
              </Text>
            )}
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
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.primary },
                (!isValueChanged || isLoading) && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={!isValueChanged || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
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
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 6,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
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
  saveButton: {
    // backgroundColor set dynamically
  },
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