import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import ProgressCircle from '@/components/ProgressCircle/ProgressCircle';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';

interface StepCounterProps {
  targetSteps: number;
  onStepCountChange?: (steps: number) => void;
  challengeId: string;
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
}

const StepCounter: React.FC<StepCounterProps> = ({ 
  targetSteps, 
  onStepCountChange, 
  isActive,
  onToggle
}) => {
  const [steps, setSteps] = useState(0);
  const isCountingRef = useRef(false);
  const lastYRef = useRef(0);
  const lastTimestampRef = useRef(Date.now());
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const subscription = useRef<any>(null);

  // Calculate progress percentage
  const progressPercentage = Math.min((steps / targetSteps) * 100, 100);

  useEffect(() => {
    Accelerometer.isAvailableAsync().then((result) => {
      setIsAvailable(result);
      if (!result) {
        Alert.alert('Accelerometer not available', 'Step counting is not supported on this device.');
      }
    });
  }, []);

  useEffect(() => {
    if (!isActive || isAvailable === false) return;
    Accelerometer.setUpdateInterval(200); // 5Hz
    const localSubscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y, z } = accelerometerData;
      const threshold = 0.1;
      const timestamp = Date.now();
      // Debug logs
      console.log('Accelerometer:', { x, y, z });
      console.log('Diff:', Math.abs(y - lastYRef.current), 'Threshold:', threshold);
      if (
        Math.abs(y - lastYRef.current) > threshold &&
        !isCountingRef.current &&
        (timestamp - lastTimestampRef.current > 800)
      ) {
        console.log('Step detected!');
        isCountingRef.current = true;
        lastYRef.current = y;
        lastTimestampRef.current = timestamp;
        setSteps((prevSteps) => {
          const newSteps = prevSteps + 1;
          if (onStepCountChange) onStepCountChange(newSteps);
          return newSteps;
        });
        setTimeout(() => {
          isCountingRef.current = false;
        }, 1200);
      }
    });
    subscription.current = localSubscription;
    return () => {
      if (subscription.current) subscription.current.remove();
    };
  }, [isActive, isAvailable, onStepCountChange]);

  const handleToggle = () => {
    if (isAvailable === false) {
      Alert.alert('Accelerometer not available', 'Step counting is not supported on this device.');
      return;
    }
    onToggle(!isActive);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepsTextHeading}>Today's goal: {targetSteps}</Text>
      <ProgressCircle percentage={progressPercentage} size={120} strokeWidth={10} showPercentage={false}>
        <Text style={styles.stepsText}>{steps}</Text>
        <Text style={styles.label}>steps</Text>
      </ProgressCircle>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: isActive ? colors.primary : '#ccc' }]}
          onPress={handleToggle}
        >
          <Text style={styles.toggleButtonText}>{isActive ? 'Stop' : 'Start'} Counting</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  stepsTextHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  toggleButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
});

export default StepCounter;
