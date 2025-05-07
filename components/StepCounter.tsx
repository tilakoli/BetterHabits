import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import GoogleFit, { Scopes, BucketUnit } from 'react-native-google-fit';
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

interface GoogleFitSubscription {
  remove: () => void;
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
  const subscription = useRef<GoogleFitSubscription | Pedometer.Subscription | null>(null);
  const appState = useRef(AppState.currentState);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

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

  // Initialize Google Fit
  const initializeGoogleFit = async () => {
    try {
      const options = {
        scopes: [
          Scopes.FITNESS_ACTIVITY_READ,
          Scopes.FITNESS_ACTIVITY_WRITE,
          Scopes.FITNESS_BODY_READ,
          Scopes.FITNESS_BODY_WRITE,
        ],
      };

      const authResult = await GoogleFit.authorize(options);
      
      if (authResult.success) {
        setIsPedometerAvailable(true);
        // @ts-ignore
        await GoogleFit.startRecording([{
          dataType: 'step_count',
          dataSource: 'step_count_delta',
        }], () => {
          console.log('Step recording started successfully');
        });
      } else {
        setError('Failed to authorize Google Fit');
        setIsPedometerAvailable(false);
      }
    } catch (error) {
      console.error('Google Fit initialization error:', error);
      setError('Failed to initialize step tracking');
      setIsPedometerAvailable(false);
    }
  };

  // Check if step counting is available
  const checkPedometerAvailability = async () => {
    try {
      if (Platform.OS === 'ios') {
        const result = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(result);
        if (!result) {
          setError('Pedometer is not available on this device');
        }
      } else {
        // For Android, initialize Google Fit
        await initializeGoogleFit();
      }
    } catch (e) {
      setError('Error checking step counter availability');
      console.error(e);
    }
  };

  // Get steps from Google Fit
  const getGoogleFitSteps = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();

      const options = {
        startDate: today.toISOString(),
        endDate: now.toISOString(),
        bucketUnit: BucketUnit.DAY,
        bucketInterval: 1
      };

      const dailySteps = await GoogleFit.getDailyStepCountSamples(options);
      
      if (dailySteps && dailySteps.length > 0) {
        // Get steps from the estimated steps source
        const estimatedSteps = dailySteps.find(
          source => source.source === 'com.google.android.gms:estimated_steps'
        );

        if (estimatedSteps && estimatedSteps.steps && estimatedSteps.steps.length > 0) {
          const steps = estimatedSteps.steps[0].value;
          setCurrentSteps(steps);
          if (onStepCountChange) {
            onStepCountChange(steps);
          }
          await saveSteps(steps);
        }
      }
    } catch (error) {
      console.error('Error getting steps from Google Fit:', error);
    }
  };

  // Start tracking steps
  const startTracking = async () => {
    if (!isPedometerAvailable) {
      Alert.alert('Not Available', 'Step counter is not available on this device');
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        // iOS implementation using Pedometer
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
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
      } else {
        // Android implementation using Google Fit
        await getGoogleFitSteps(); // Get initial steps
        
        // Update steps every minute using setInterval
        const interval = setInterval(getGoogleFitSteps, 60000);
        updateInterval.current = interval as unknown as NodeJS.Timeout;
      }
    } catch (e) {
      setError('Failed to start step counter');
      console.error(e);
    }
  };

  // Stop tracking steps
  const stopTracking = () => {
    if (Platform.OS === 'ios') {
      if (subscription.current) {
        subscription.current.remove();
        subscription.current = null;
      }
    } else {
      // Clear the update interval for Android
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }
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
      loadSavedSteps();
      startTracking();
    } else if (nextAppState.match(/inactive|background/) && isActive) {
      stopTracking();
    }
    appState.current = nextAppState;
  };

  // Initialize on component mount
  useEffect(() => {
    checkPedometerAvailability();
    loadSavedSteps();
    
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    if (isActive && isPedometerAvailable) {
      startTracking();
    }
    
    return () => {
      stopTracking();
      appStateSubscription.remove();
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
      
      {Platform.OS === 'android' && !isPedometerAvailable && (
        <Text style={styles.notAvailableText}>
          Please authorize Google Fit to track your steps
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
  },
  stepsCount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  stepsLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  targetLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#E74C3C',
    textAlign: 'center',
  },
  notAvailableText: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default StepCounter;
