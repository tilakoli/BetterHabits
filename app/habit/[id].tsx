import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import ProgressCircle from '@/components/ProgressCircle';
import CalendarView from '@/components/CalendarView';
import BadgeIcon from '@/components/BadgeIcon';
import WalkingChallengeDetail from '@/components/WalkingChallengeDetail';
import { sampleHabits, sampleBadges, sampleChallenges } from '@/constants/SampleData';
import { completeHabitForToday, calculateProgressPercentage } from '@/utils/habitUtils';
import { Habit, Challenge } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<'habit' | 'challenge'>('habit');
  const [isWalkingChallenge, setIsWalkingChallenge] = useState(false);
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);
  
  // Load joined challenges from AsyncStorage
  useEffect(() => {
    const loadJoinedChallenges = async () => {
      try {
        const savedChallenges = await AsyncStorage.getItem('@HabitPro:joinedChallenges');
        if (savedChallenges) {
          setJoinedChallenges(JSON.parse(savedChallenges));   
        }
      } catch (e) {
        console.error('Failed to load joined challenges', e);
      }
    };
    
    loadJoinedChallenges();
  }, []);

  useEffect(() => {
    // Check if the ID matches a habit
    const foundHabit = sampleHabits.find(h => h.id === id);
    if (foundHabit) {
      setHabit(foundHabit);
      setSource('habit');
      setIsLoading(false);
      return;
    }
    
    // Check if the ID matches a challenge
    const foundChallenge = sampleChallenges.find(c => c.id === id);
    if (foundChallenge) {
      setChallenge(foundChallenge);
      setSource('challenge');
      
      // Check if this is the Walking Challenge (id: 6)
      if (foundChallenge.id === '6') {
        setIsWalkingChallenge(true);
      }
      
      // Create a partial habit from the challenge for display compatibility
      const habitFromChallenge: Habit = {
        id: foundChallenge.id,
        name: foundChallenge.name,
        type: 'guided',
        category: foundChallenge.category,
        frequency: 'daily',
        duration: foundChallenge.duration,
        startDate: formatDate(new Date()),
        progress: {
          daysCompleted: 0,
          currentStreak: 0,
          bestStreak: 0,
          completionHistory: {},
        },
        reminderTime: '08:00',
        rewards: {
          badges: [],
          points: 0,
        },
      };
      
      setHabit(habitFromChallenge);
    }
    
    setIsLoading(false);
  }, [id]);

  const handleStartChallenge = async () => {
    if (!challenge) return;
    
    // For Walking Challenge, we'll handle this in the WalkingChallengeDetail component
    if (isWalkingChallenge) {
      // Just update the joined challenges list
      const updatedJoinedChallenges = [...joinedChallenges, challenge.id];
      try {
        await AsyncStorage.setItem('@HabitPro:joinedChallenges', JSON.stringify(updatedJoinedChallenges));
        setJoinedChallenges(updatedJoinedChallenges);
      } catch (e) {
        console.error('Failed to save joined challenges', e);
      }
      return;
    }
    
    // For other challenges
    Alert.alert(
      'Join Challenge',
      `Are you ready to start the "${challenge.name}" challenge?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          style: 'default',
          onPress: async () => {
            // Update joined challenges
            const updatedJoinedChallenges = [...joinedChallenges, challenge.id];
            try {
              await AsyncStorage.setItem('@HabitPro:joinedChallenges', JSON.stringify(updatedJoinedChallenges));
              setJoinedChallenges(updatedJoinedChallenges);
              Alert.alert('Success', 'You have joined the challenge!');
            } catch (e) {
              console.error('Failed to save joined challenges', e);
              Alert.alert('Error', 'Failed to join the challenge. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const handleCompleteHabit = () => {
    if (!habit) return;
    
    const today = formatDate(new Date());
    
    // Don't allow completing twice in the same day
    if (habit.progress.completionHistory[today]) {
      Alert.alert(
        'Already Completed',
        'You have already completed this habit today. Great job!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Update habit
    const updatedHabit = completeHabitForToday(habit);
    setHabit(updatedHabit);
    
    // Return to home after completion
    router.replace('/(tabs)');
  };
  
  const handleDeleteHabit = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would be an API call
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  if (!habit && !challenge) {
    return (
      <View style={styles.errorContainer}>
        <Text>Habit or challenge not found</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const progress = source === 'habit' && habit 
    ? calculateProgressPercentage(habit) 
    : 0;
  
  const daysRemaining = habit 
    ? habit.duration - (source === 'habit' ? habit.progress.daysCompleted : 0) 
    : 0;
  
  // Get earned badges for this habit (only if it's a habit, not a challenge)
  const earnedBadges = source === 'habit' && habit 
    ? sampleBadges.filter(badge => badge.unlocked && habit.rewards.badges.includes(badge.id))
    : [];
  
  // Check if this challenge is already joined
  const isJoined = joinedChallenges.includes(challenge?.id || '');

  // If this is the Walking Challenge, render the special Walking Challenge detail component
  if (isWalkingChallenge && challenge) {
    return (
      <View style={styles.container}>
        <WalkingChallengeDetail 
          challenge={challenge}
          habit={habit}
          onJoinChallenge={handleStartChallenge}
          isJoined={isJoined}
        />
      </View>
    );
  }

  // For all other challenges and habits, render the standard detail view
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.habitTitle}>{habit?.name || challenge?.name}</Text>
            <View style={styles.categoryContainer}>
              <FontAwesome 
                name={
                  (habit?.category || challenge?.category) === 'mindfulness' ? 'leaf' :
                  (habit?.category || challenge?.category) === 'fitness' ? 'heartbeat' :
                  (habit?.category || challenge?.category) === 'learning' ? 'book' :
                  (habit?.category || challenge?.category) === 'health' ? 'medkit' : 'star'
                } 
                size={14} 
                color={colors.primary} 
              />
              <Text style={styles.categoryText}>{habit?.category || challenge?.category}</Text>
            </View>
          </View>
          
          {source === 'habit' && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/habit/[id]')}
            >
              <FontAwesome name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {challenge && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{challenge.description}</Text>
          </View>
        )}
        
        <View style={styles.progressSection}>
          <View style={styles.progressCircleContainer}>
            <ProgressCircle
              percentage={progress}
              size={150}
              strokeWidth={15}
              color={colors.primary}
              showPercentage={true}
            />
          </View>
          
          <View style={styles.statsContainer}>
            {source === 'challenge' && challenge ? (
              <>
                <View style={styles.statItem}>
                  <FontAwesome name="trophy" size={20} color={colors.text} />
                  <Text style={styles.statValue}>{challenge.difficulty}</Text>
                  <Text style={styles.statLabel}>Difficulty</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <FontAwesome name="calendar" size={20} color={colors.text} />
                  <Text style={styles.statValue}>{challenge.duration}</Text>
                  <Text style={styles.statLabel}>Days</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <FontAwesome name="users" size={20} color={colors.accent} />
                  <Text style={styles.statValue}>{challenge.participationCount.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Participants</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.statItem}>
                  <FontAwesome name="calendar-check-o" size={20} color={colors.text} />
                  <Text style={styles.statValue}>{habit?.progress.daysCompleted}</Text>
                  <Text style={styles.statLabel}>Days Complete</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <FontAwesome name="calendar" size={20} color={colors.text} />
                  <Text style={styles.statValue}>{daysRemaining}</Text>
                  <Text style={styles.statLabel}>Days Left</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <FontAwesome name="fire" size={20} color={colors.accent} />
                  <Text style={styles.statValue}>{habit?.progress.currentStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </>
            )}
          </View>
          
          {source === 'challenge' ? (
            <TouchableOpacity 
              style={[styles.completeButton, { backgroundColor: colors.primary }]}
              onPress={handleStartChallenge}
              disabled={isJoined}
            >
              <FontAwesome name="trophy" size={20} color="white" style={styles.completeButtonIcon} />
              <Text style={styles.completeButtonText}>{isJoined ? 'Already Joined' : 'Join Challenge'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.completeButton, { backgroundColor: colors.secondary }]}
              onPress={handleCompleteHabit}
            >
              <FontAwesome name="check" size={20} color="white" style={styles.completeButtonIcon} />
              <Text style={styles.completeButtonText}>Complete Today</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {source === 'habit' && habit && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Your History</Text>
            <CalendarView completionHistory={habit.progress.completionHistory} />
          </View>
        )}
        
        {earnedBadges.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Earned Badges</Text>
            <View style={styles.badgesContainer}>
              {earnedBadges.map(badge => (
                <BadgeIcon
                  key={badge.id}
                  badge={badge}
                  size="medium"
                  showName={true}
                />
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsCard}>
            {source === 'habit' ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Frequency</Text>
                  <Text style={styles.detailValue}>
                    {habit?.frequency === 'daily' ? 'Daily' : habit?.frequency.join(', ')}
                  </Text>
                </View>
                
                <View style={styles.detailDivider} />
              </>
            ) : null}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{habit?.duration || challenge?.duration} days</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            {source === 'habit' ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reminder</Text>
                  <Text style={styles.detailValue}>{habit?.reminderTime}</Text>
                </View>
                
                <View style={styles.detailDivider} />
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Start Date</Text>
                  <Text style={styles.detailValue}>{habit?.startDate}</Text>
                </View>
              </>
            ) : (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>
                  {challenge && challenge.category 
                    ? challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)
                    : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {source === 'habit' && (
          <TouchableOpacity 
            style={[styles.deleteButton, { borderColor: '#E74C3C' }]}
            onPress={handleDeleteHabit}
          >
            <FontAwesome name="trash" size={16} color="#E74C3C" style={styles.deleteButtonIcon} />
            <Text style={[styles.deleteButtonText, { color: '#E74C3C' }]}>Delete Habit</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 16,
    textTransform: 'capitalize',
    color: '#666',
  },
  editButton: {
    padding: 10,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
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
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
  },
  completeButtonIcon: {
    marginRight: 10,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
  },
  deleteButtonIcon: {
    marginRight: 10,
  },
  deleteButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 