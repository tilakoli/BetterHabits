import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import StepCounter from './StepCounter';
import StepGoalModal from './StepGoalModal';
import { formatDate } from '@/utils/dateUtils';
import { Habit, Challenge } from '@/types';

interface WalkingChallengeDetailProps {
  challenge: Challenge;
  habit?: Habit | null;
  onJoinChallenge: () => void;
  isJoined: boolean;
}

const WalkingChallengeDetail: React.FC<WalkingChallengeDetailProps> = ({
  challenge,
  habit,
  onJoinChallenge,
  isJoined
}) => {
  const [stepGoal, setStepGoal] = useState(10000);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [dailyHistory, setDailyHistory] = useState<Record<string, number>>({});
  const [challengeStarted, setChallengeStarted] = useState(false);
  
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  // Storage keys
  const STEP_GOAL_KEY = `@HabitPro:stepGoal:${challenge.id}`;
  const TRACKING_KEY = `@HabitPro:tracking:${challenge.id}`;
  const CHALLENGE_STARTED_KEY = `@HabitPro:challengeStarted:${challenge.id}`;
  const HISTORY_KEY = `@HabitPro:history:${challenge.id}`;
  
  // Load saved data
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load step goal
        const savedGoal = await AsyncStorage.getItem(STEP_GOAL_KEY);
        if (savedGoal) {
          setStepGoal(parseInt(savedGoal, 10));
        }
        
        // Load tracking state
        const savedTracking = await AsyncStorage.getItem(TRACKING_KEY);
        if (savedTracking) {
          setIsTracking(savedTracking === 'true');
        }
        
        // Load challenge started state
        const savedStarted = await AsyncStorage.getItem(CHALLENGE_STARTED_KEY);
        if (savedStarted) {
          setChallengeStarted(savedStarted === 'true');
        }
        
        // Load daily history
        const savedHistory = await AsyncStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
          setDailyHistory(JSON.parse(savedHistory));
        }
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    };
    
    loadSavedData();
  }, [challenge.id]);
  
  // Save step goal
  const saveStepGoal = async (goal: number) => {
    try {
      await AsyncStorage.setItem(STEP_GOAL_KEY, goal.toString());
      setStepGoal(goal);
    } catch (e) {
      console.error('Failed to save step goal', e);
    }
  };
  
  // Save tracking state
  const saveTrackingState = async (isActive: boolean) => {
    try {
      await AsyncStorage.setItem(TRACKING_KEY, isActive.toString());
      setIsTracking(isActive);
    } catch (e) {
      console.error('Failed to save tracking state', e);
    }
  };
  
  // Save challenge started state
  const saveChallengeStarted = async (started: boolean) => {
    try {
      await AsyncStorage.setItem(CHALLENGE_STARTED_KEY, started.toString());
      setChallengeStarted(started);
    } catch (e) {
      console.error('Failed to save challenge started state', e);
    }
  };
  
  // Save daily history
  const saveDailyHistory = async (history: Record<string, number>) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      setDailyHistory(history);
    } catch (e) {
      console.error('Failed to save daily history', e);
    }
  };
  
  // Handle step count changes
  const handleStepCountChange = (steps: number) => {
    setCurrentSteps(steps);
    
    // Update daily history
    const today = formatDate(new Date());
    const updatedHistory = { ...dailyHistory, [today]: steps };
    saveDailyHistory(updatedHistory);
  };
  
  // Handle join challenge
  const handleJoinChallenge = () => {
    if (challengeStarted) {
      return;
    }
    
    Alert.alert(
      'Join Walking Challenge',
      'Are you ready to start the 22-day walking challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          style: 'default',
          onPress: () => {
            saveChallengeStarted(true);
            onJoinChallenge();
          }
        }
      ]
    );
  };
  
  // Calculate days completed
  const getDaysCompleted = () => {
    return Object.entries(dailyHistory).filter(([_, steps]) => steps >= stepGoal).length;
  };
  
  // Calculate current streak
  const getCurrentStreak = () => {
    const today = new Date();
    let currentDate = new Date(today);
    let streak = 0;
    
    // Check if today is completed
    const todayFormatted = formatDate(today);
    if (dailyHistory[todayFormatted] && dailyHistory[todayFormatted] >= stepGoal) {
      streak = 1;
      // Start checking from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // If today is not completed, start checking from today
      currentDate = today;
    }
    
    // Check consecutive previous days
    while (true) {
      const dateStr = formatDate(currentDate);
      if (!dailyHistory[dateStr] || dailyHistory[dateStr] < stepGoal) {
        break;
      }
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };
  
  // Calculate days remaining
  const getDaysRemaining = () => {
    return challenge.duration - getDaysCompleted();
  };
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    const daysCompleted = getDaysCompleted();
    return (daysCompleted / challenge.duration) * 100;
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Walking Challenge</Text>
        <Text style={styles.subtitle}>22 Days of Consistent Walking</Text>
      </View>
      
      {!challengeStarted ? (
        <View style={styles.joinSection}>
          <View style={styles.goalSection}>
            <Text style={styles.goalTitle}>Your Daily Step Goal</Text>
            <View style={styles.goalValueContainer}>
              <Text style={styles.goalValue}>{stepGoal.toLocaleString()}</Text>
              <Text style={styles.goalUnit}>steps</Text>
            </View>
            <TouchableOpacity 
              style={[styles.editButton, { borderColor: colors.primary }]}
              onPress={() => setIsEditModalVisible(true)}
            >
              <FontAwesome name="pencil" size={16} color={colors.primary} style={styles.editIcon} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Goal</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.joinButton, { backgroundColor: colors.primary }]}
            onPress={handleJoinChallenge}
          >
            <FontAwesome name="flag" size={20} color="white" style={styles.joinButtonIcon} />
            <Text style={styles.joinButtonText}>Start Challenge</Text>
          </TouchableOpacity>
          
          <View style={styles.infoContainer}>
            <FontAwesome name="info-circle" size={16} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              You can edit your goal now, but once the challenge starts, your goal cannot be changed.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.trackingSection}>
          <StepCounter
            targetSteps={stepGoal}
            onStepCountChange={handleStepCountChange}
            challengeId={challenge.id}
            isActive={isTracking}
            onToggle={saveTrackingState}
          />
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <FontAwesome name="calendar-check-o" size={20} color={colors.text} />
              <Text style={styles.statValue}>{getDaysCompleted()}</Text>
              <Text style={styles.statLabel}>Days Complete</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <FontAwesome name="calendar" size={20} color={colors.text} />
              <Text style={styles.statValue}>{getDaysRemaining()}</Text>
              <Text style={styles.statLabel}>Days Left</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <FontAwesome name="fire" size={20} color={colors.accent} />
              <Text style={styles.statValue}>{getCurrentStreak()}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <FontAwesome name="info-circle" size={16} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Complete your daily step goal of {stepGoal.toLocaleString()} steps for all 22 days to complete the challenge.
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Challenge Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{challenge.duration} days</Text>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Difficulty</Text>
            <Text style={styles.detailValue}>{challenge.difficulty}</Text>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{challenge.category}</Text>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Participants</Text>
            <Text style={styles.detailValue}>{challenge.participationCount.toLocaleString()}</Text>
          </View>
        </View>
      </View>
      
      <StepGoalModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSave={saveStepGoal}
        initialValue={stepGoal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  joinSection: {
    padding: 20,
    alignItems: 'center',
  },
  goalSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  goalValueContainer: {
    alignItems: 'center',
  },
  goalValue: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  goalUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
  },
  editIcon: {
    marginRight: 8,
  },
  editButtonText: {
    fontWeight: '500',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '80%',
    marginBottom: 20,
  },
  joinButtonIcon: {
    marginRight: 10,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  trackingSection: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#ddd',
  },
  detailsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#ddd',
  },
});

export default WalkingChallengeDetail;
