import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import ProgressCircle from './ProgressCircle';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { formatDate } from '@/utils/dateUtils';

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
  challengeId,
  isActive,
  onToggle
}) => {
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const subscription = useRef<any>(null);
  const appState = useRef(AppState.currentState);

  // Calculate progress percentage
  const progressPercentage = Math.min((currentSteps / targetSteps) * 100, 100);
  
  // Format for storage key
  const getStorageKey = () => {
    const today = formatDate(new Date());
    return `@HabitPro:steps:${challengeId}:${today}`;
  };

  // Load saved steps for today
  const loadSavedSteps = async () => {
    try {
      const key = getStorageKey();
      const savedSteps = await AsyncStorage.getItem(key);
      if (savedSteps !== null) {
        setCurrentSteps(parseInt(savedSteps, 10));
      }
    } catch (e) {
      console.error('Failed to load saved steps', e);
    }
  };

  // Save steps to AsyncStorage
  const saveSteps = async (steps: number) => {
    try {
      const key = getStorageKey();
      await AsyncStorage.setItem(key, steps.toString());
    } catch (e) {
      console.error('Failed to save steps', e);
    }
  };

  // Check if pedometer is available
  const checkPedometerAvailability = async () => {
    try {
      const result = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(result);
      if (!result) {
        setError('Pedometer is not available on this device');
      }
    } catch (e) {
      setError('Error checking pedometer availability');
      console.error(e);
    }
  };

  // Start tracking steps
  const startTracking = async () => {
    if (!isPedometerAvailable) {
      Alert.alert('Not Available', 'Pedometer is not available on this device');
      return;
    }

    try {
      // Get start of today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Subscribe to pedometer updates
      subscription.current = Pedometer.watchStepCount(result => {
        const steps = result.steps;
        setCurrentSteps(prevSteps => {
          const newSteps = Math.max(steps, prevSteps);
          if (onStepCountChange) {
            onStepCountChange(newSteps);
          }
          saveSteps(newSteps);
          return newSteps;
        });
      });
      
      // Also get steps since midnight
      const pastStepCountResult = await Pedometer.getStepCountAsync(today, new Date());
      if (pastStepCountResult) {
        const steps = pastStepCountResult.steps;
        setCurrentSteps(prevSteps => {
          const newSteps = Math.max(steps, prevSteps);
          if (onStepCountChange) {
            onStepCountChange(newSteps);
          }
          saveSteps(newSteps);
          return newSteps;
        });
      }
    } catch (e) {
      setError('Failed to start step counter');
      console.error(e);
    }
  };

  // Stop tracking steps
  const stopTracking = () => {
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }
  };

  // Toggle tracking
  const toggleTracking = () => {
    if (isActive) {
      stopTracking();
      onToggle(false);
    } else {
      startTracking();
      onToggle(true);
    }
  };

  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active' && isActive) {
      // App has come to the foreground and tracking is active
      loadSavedSteps();
      startTracking();
    } else if (nextAppState.match(/inactive|background/) && isActive) {
      // App is going to the background but tracking is active
      stopTracking();
    }
    appState.current = nextAppState;
  };

  // Initialize on component mount
  useEffect(() => {
    checkPedometerAvailability();
    loadSavedSteps();
    
    // Set up app state change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Start tracking if active
    if (isActive && isPedometerAvailable) {
      startTracking();
    }
    
    // Clean up on unmount
    return () => {
      stopTracking();
      subscription.remove();
    };
  }, [isPedometerAvailable]);

  // Effect to handle isActive changes
  useEffect(() => {
    if (isActive && isPedometerAvailable) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isActive, isPedometerAvailable]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <ProgressCircle
          percentage={progressPercentage}
          size={180}
          strokeWidth={15}
          color={colors.primary}
          showPercentage={false}
        >
          <View style={styles.stepsContainer}>
            <Text style={[styles.stepsCount, { color: colors.text }]}>
              {currentSteps.toLocaleString()}
            </Text>
            <Text style={[styles.stepsLabel, { color: colors.text }]}>steps</Text>
            <Text style={[styles.targetLabel, { color: colorScheme === 'dark' ? '#AAA' : '#666' }]}>
              of {targetSteps.toLocaleString()}
            </Text>
          </View>
        </ProgressCircle>
      </View>
      
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { backgroundColor: isActive ? colors.secondary : colors.primary }
        ]}
        onPress={toggleTracking}
      >
        <FontAwesome
          name={isActive ? 'pause' : 'play'}
          size={20}
          color="white"
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>
          {isActive ? 'Pause Tracking' : 'Start Tracking'}
        </Text>
      </TouchableOpacity>
      
      {!isPedometerAvailable && (
        <Text style={styles.notAvailableText}>
          Pedometer is not available on this device
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  stepsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsCount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  stepsLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  targetLabel: {
    fontSize: 14,
    marginTop: 4,
    color: '#666',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 20,
    width: '80%',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#E74C3C',
    textAlign: 'center',
  },
  notAvailableText: {
    marginTop: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },
});

export default StepCounter;
