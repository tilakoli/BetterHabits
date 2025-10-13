import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import InputField from '../InputField/InputField';

interface WaterInputProps {
  onSubmit: (data: { type: 'water'; glasses: number; ml?: number }) => void;
  isLoading?: boolean;
}

export function WaterInput({ onSubmit, isLoading }: WaterInputProps) {
  const [glasses, setGlasses] = useState('');
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const handleSubmit = () => {
    const glassCount = parseInt(glasses);
    if (glassCount > 0) {
      onSubmit({
        type: 'water',
        glasses: glassCount,
        ml: glassCount * 250, // Assuming 250ml per glass
      });
      setGlasses('');
    }
  };

  // Quick buttons for common amounts
  const quickAdd = (count: number) => {
    setGlasses(count.toString());
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        How many glasses of water did you drink?
      </Text>
      
      <View style={styles.quickButtons}>
        {[4, 6, 8, 10].map((count) => (
          <TouchableOpacity
            key={count}
            style={[styles.quickButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => quickAdd(count)}
          >
            <Text style={[styles.quickButtonText, { color: colors.text }]}>{count}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <InputField
        placeholder="Or enter custom amount"
        value={glasses}
        onChangeText={setGlasses}
        keyboardType="numeric"
        // leftIcon="tint"
      />

      {glasses && (
        <Text style={[styles.mlText, { color: colors.text }]}>
          ≈ {parseInt(glasses) * 250}ml
        </Text>
      )}

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={!glasses || isLoading}
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
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mlText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
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