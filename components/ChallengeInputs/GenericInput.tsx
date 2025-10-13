import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';

interface GenericInputProps {
  onSubmit: (completed: boolean) => void;
  isLoading?: boolean;
}

export function GenericInput({ onSubmit, isLoading }: GenericInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Did you complete today's challenge?</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.noButton]}
          onPress={() => onSubmit(false)}
          disabled={isLoading}
        >
          <FontAwesome name="times" size={20} color="white" />
          <Text style={styles.buttonText}>No</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.yesButton]}
          onPress={() => onSubmit(true)}
          disabled={isLoading}
        >
          <FontAwesome name="check" size={20} color="white" />
          <Text style={styles.buttonText}>Yes</Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  yesButton: {
    backgroundColor: '#27AE60',
  },
  noButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});