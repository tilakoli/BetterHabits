import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import InputField from '../InputField/InputField';

interface WalkingInputProps {
  onSubmit: (data: { type: 'walking'; steps: number }) => void;
  isLoading?: boolean;
}

export function WalkingInput({ onSubmit, isLoading }: WalkingInputProps) {
  const [steps, setSteps] = useState('');
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const handleSubmit = () => {
    const stepsNum = parseInt(steps);
    if (stepsNum > 0) {
      onSubmit({ type: 'walking', steps: stepsNum });
      setSteps('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        How many steps did you walk today?
      </Text>
      
      <InputField
        placeholder="Enter steps (e.g., 10000)"
        value={steps}
        onChangeText={setSteps}
        keyboardType="numeric"
        // leftIcon="walking"
      />

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={!steps || isLoading}
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