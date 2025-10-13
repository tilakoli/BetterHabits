import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import InputField from '../InputField/InputField';

interface ReadingInputProps {
  onSubmit: (data: { type: 'reading'; pagesRead: number; reflection?: string }) => void;
  isLoading?: boolean;
}

export function ReadingInput({ onSubmit, isLoading }: ReadingInputProps) {
  const [pages, setPages] = useState('');
  const [reflection, setReflection] = useState('');
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const handleSubmit = () => {
    const pagesNum = parseInt(pages);
    if (pagesNum > 0) {
      onSubmit({
        type: 'reading',
        pagesRead: pagesNum,
        ...(reflection && { reflection }),
      });
      setPages('');
      setReflection('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        How many pages did you read today?
      </Text>
      
      <InputField
        placeholder="Enter pages (e.g., 10)"
        value={pages}
        onChangeText={setPages}
        keyboardType="numeric"
        // leftIcon="book"
      />

      <Text style={[styles.label, { color: colors.text }]}>
        Quick reflection (optional)
      </Text>
      <TextInput
        style={[styles.textarea, { 
          backgroundColor: colors.card, 
          color: colors.text,
          borderColor: colors.border 
        }]}
        placeholder="What did you think about today's reading?"
        placeholderTextColor="#999"
        value={reflection}
        onChangeText={setReflection}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={!pages || isLoading}
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
    minHeight: 100,
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