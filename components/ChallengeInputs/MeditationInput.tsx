import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import InputField from '../InputField/InputField';

interface MeditationInputProps {
  onSubmit: (data: { type: 'meditation'; minutes: number; notes?: string }) => void;
  isLoading?: boolean;
}

export function MeditationInput({ onSubmit, isLoading }: MeditationInputProps) {
  const [minutes, setMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const handleSubmit = () => {
    const mins = parseInt(minutes);
    if (mins > 0) {
      onSubmit({
        type: 'meditation',
        minutes: mins,
        ...(notes && { notes }),
      });
      setMinutes('');
      setNotes('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        How long did you meditate today?
      </Text>
      
      <InputField
        placeholder="Enter minutes (e.g., 10)"
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="numeric"
        // leftIcon="clock-o"
      />

      <Text style={[styles.label, { color: colors.text }]}>
        How did it feel? (optional)
      </Text>
      <TextInput
        style={[styles.textarea, { 
          backgroundColor: colors.card, 
          color: colors.text,
          borderColor: colors.border 
        }]}
        placeholder="Any thoughts or reflections..."
        placeholderTextColor="#999"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={!minutes || isLoading}
      >
        <FontAwesome name="check" size={20} color="white" />
        <Text style={styles.submitText}>Submit Progress</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});