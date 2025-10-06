import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { ProgressCircle, CalendarView } from '@/components';
import { HabitTemplate, HabitParticipation } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { habitService } from '@/services/habitService';
import { useAuth } from '@/providers/AuthProvider/useAuth';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user } = useAuth();
  
  const [challengeTemplate, setChallengeTemplate] = useState<HabitTemplate | null>(null);
  const [userParticipation, setUserParticipation] = useState<HabitParticipation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isRecordingProgress, setIsRecordingProgress] = useState(false);
  const [todayProgress, setTodayProgress] = useState<{ hasProgress: boolean; completed?: boolean }>({ hasProgress: false });

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  useEffect(() => {
    loadChallengeData();
  }, [id, user]);

  const loadChallengeData = async () => {
    if (!id || !user?.uid) return;
    
    try {
      setIsLoading(true);
      
      // 1. Load the challenge template
      const template = await habitService.getHabitById(id as string);
      if (!template) {
        Alert.alert('Error', 'Challenge not found');
        router.back();
        return;
      }
      setChallengeTemplate(template);
      
      // 2. Check if user has joined this challenge
      const activeChallenge = await habitService.getUserActiveChallenge(user.uid);
      
      if (activeChallenge && activeChallenge.habitId === id) {
        setUserParticipation(activeChallenge);
        
        // 3. Check today's progress
        const todayStatus = await habitService.getTodayProgressStatus(user.uid, activeChallenge.id!);
        setTodayProgress(todayStatus);
      }
      
    } catch (error) {
      console.error('Error loading challenge data:', error);
      Alert.alert('Error', 'Failed to load challenge data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!challengeTemplate || !user?.uid) return;
    
    try {
      setIsJoining(true);
      
      const result = await habitService.joinHabitChallenge(user.uid, challengeTemplate);
      
      if (result.success) {
        Alert.alert('Success!', 'You have joined the challenge! Start tracking your progress today.', [
          { text: 'OK', onPress: () => loadChallengeData() }
        ]);
      } else {
        Alert.alert('Unable to Join', result.error || 'Failed to join the challenge');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      Alert.alert('Error', 'An error occurred while joining the challenge');
    } finally {
      setIsJoining(false);
    }
  };

  const handleRecordProgress = async (completed: boolean) => {
    if (!userParticipation || !user?.uid) return;
    
    try {
      setIsRecordingProgress(true);
      
      const result = await habitService.recordDailyProgress(
        user.uid,
        userParticipation.id!,
        today,
        completed
      );
      
      if (result.success) {
        if (result.challengeCompleted) {
          Alert.alert(
            'Challenge Completed! 🎉', 
            'Congratulations! You have successfully completed this challenge!',
            [{ text: 'Amazing!', onPress: () => router.replace('/(tabs)') }]
          );
        } else {
          Alert.alert(
            'Progress Recorded!', 
            completed ? 'Great job today! Keep it up!' : 'Thanks for checking in. Tomorrow is a new day!',
            [{ text: 'OK', onPress: () => loadChallengeData() }]
          );
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to record progress');
      }
    } catch (error) {
      console.error('Error recording progress:', error);
      Alert.alert('Error', 'An error occurred while recording progress');
    } finally {
      setIsRecordingProgress(false);
    }
  };

  const calculateProgress = () => {
    if (!userParticipation) return 0;
    return Math.round((userParticipation.totalCompletedDays / userParticipation.totalDays) * 100);
  };

  const getDaysRemaining = () => {
    if (!userParticipation) return 0;
    return userParticipation.totalDays - userParticipation.totalCompletedDays;
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading challenge...
        </Text>
      </View>
    );
  }
  
  // Show error if challenge not found
  if (!challengeTemplate) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={48} color={colors.text} />
        <Text style={[styles.errorText, { color: colors.text }]}>Challenge not found</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isJoined = !!userParticipation;
  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>
              {challengeTemplate.name}
            </Text>
            <View style={styles.categoryContainer}>
              <FontAwesome 
                name={
                  challengeTemplate.category === 'mindfulness' ? 'leaf' :
                  challengeTemplate.category === 'fitness' ? 'heartbeat' :
                  challengeTemplate.category === 'learning' ? 'book' :
                  challengeTemplate.category === 'health' ? 'medkit' : 'star'
                } 
                size={14} 
                color={colors.primary} 
              />
              <Text style={[styles.categoryText, { color: colors.text }]}>
                {challengeTemplate.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: colors.text }]}>
            {challengeTemplate.description}
          </Text>
        </View>
        
        {/* Progress Section */}
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
          
          {/* Stats */}
          <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            {isJoined ? (
              <>
                <View style={styles.statItem}>
                  <FontAwesome name="calendar-check-o" size={20} color={colors.text} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {userParticipation!.totalCompletedDays}
                  </Text>
                  <Text style={styles.statLabel}>Days Complete</Text>
                </View>
                
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                
                <View style={styles.statItem}>
                  <FontAwesome name="calendar" size={20} color={colors.text} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {daysRemaining}
                  </Text>
                  <Text style={styles.statLabel}>Days Left</Text>
                </View>
                
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                
                <View style={styles.statItem}>
                  <FontAwesome name="percent" size={20} color={colors.accent} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {userParticipation!.completionRate}%
                  </Text>
                  <Text style={styles.statLabel}>Complete</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.statItem}>
                  <FontAwesome name="trophy" size={20} color={colors.text} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {challengeTemplate.difficulty}
                  </Text>
                  <Text style={styles.statLabel}>Difficulty</Text>
                </View>
                
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                
                <View style={styles.statItem}>
                  <FontAwesome name="calendar" size={20} color={colors.text} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {challengeTemplate.duration}
                  </Text>
                  <Text style={styles.statLabel}>Days</Text>
                </View>
                
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                
                <View style={styles.statItem}>
                  <FontAwesome name="users" size={20} color={colors.accent} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {challengeTemplate.participantCount || 0}
                  </Text>
                  <Text style={styles.statLabel}>Participants</Text>
                </View>
              </>
            )}
          </View>
          
          {/* Action Button */}
          {isJoined ? (
            <View>
              {/* Daily Check-in Section */}
              {!userParticipation?.isCompleted && (
                <View style={styles.checkInSection}>
                  <Text style={[styles.checkInTitle, { color: colors.text }]}>
                    Today's Progress
                  </Text>
                  <Text style={[styles.checkInSubtitle, { color: colors.text }]}>
                    Did you complete today's challenge?
                  </Text>
                  
                  {todayProgress.hasProgress ? (
                    <View style={styles.completedSection}>
                      <FontAwesome 
                        name={todayProgress.completed ? "check-circle" : "times-circle"} 
                        size={24} 
                        color={todayProgress.completed ? "#27AE60" : "#E74C3C"} 
                      />
                      <Text style={[styles.completedText, { color: colors.text }]}>
                        {todayProgress.completed ? 'Completed today! Great job!' : 'Marked as not completed today'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.checkInButtons}>
                      <TouchableOpacity 
                        style={[styles.progressButton, styles.noButton]}
                        onPress={() => handleRecordProgress(false)}
                        disabled={isRecordingProgress}
                      >
                        <FontAwesome name="times" size={20} color="white" />
                        <Text style={styles.progressButtonText}>No</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.progressButton, styles.yesButton]}
                        onPress={() => handleRecordProgress(true)}
                        disabled={isRecordingProgress}
                      >
                        <FontAwesome name="check" size={20} color="white" />
                        <Text style={styles.progressButtonText}>Yes</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {isRecordingProgress && (
                    <ActivityIndicator size="small" color={colors.primary} style={styles.recordingIndicator} />
                  )}
                </View>
              )}
              
              {userParticipation?.isCompleted && (
                <View style={styles.completedChallengeSection}>
                  <FontAwesome name="trophy" size={32} color="#FFD700" />
                  <Text style={[styles.completedChallengeText, { color: colors.text }]}>
                    Challenge Completed! 🎉
                  </Text>
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => router.replace('/(tabs)')}
                  >
                    <Text style={styles.buttonText}>Browse New Challenges</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.joinButton, { backgroundColor: colors.primary }]}
              onPress={handleJoinChallenge}
              disabled={isJoining}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome name="trophy" size={20} color="white" style={styles.buttonIcon} />
              )}
              <Text style={styles.joinButtonText}>
                {isJoining ? 'Joining...' : 'Join Challenge'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Progress History (only if joined) */}
        {isJoined && userParticipation && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</Text>
            <ProgressHistoryView participation={userParticipation} />
          </View>
        )}
        
        {/* Challenge Details */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Challenge Details</Text>
          <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Duration</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {challengeTemplate.duration} days
              </Text>
            </View>
            
            <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Difficulty</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {challengeTemplate.difficulty.charAt(0).toUpperCase() + challengeTemplate.difficulty.slice(1)}
              </Text>
            </View>
            
            <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Daily Goal</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {challengeTemplate.dailyGoal.target} {challengeTemplate.dailyGoal.unit}
              </Text>
            </View>
            
            <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Category</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {challengeTemplate.category.charAt(0).toUpperCase() + challengeTemplate.category.slice(1)}
              </Text>
            </View>
            
            {challengeTemplate.tags && challengeTemplate.tags.length > 0 && (
              <>
                <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.text }]}>Tags</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {challengeTemplate.tags.join(', ')}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Simple Progress History Component
function ProgressHistoryView({ participation }: { participation: HabitParticipation }) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  // Generate array of dates from start to end
  const generateDateRange = () => {
    const dates = [];
    const start = participation.startDate.toDate();
    const end = participation.endDate.toDate();
    const current = new Date(start);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const progress = participation.dailyProgress[dateStr];
      const isPast = current < new Date();
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      dates.push({
        date: dateStr,
        dayNumber: dates.length + 1,
        completed: progress?.completed || false,
        hasProgress: !!progress,
        isPast,
        isToday
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const dateRange = generateDateRange();

  return (
    <View style={styles.progressHistoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.progressGrid}>
          {dateRange.map((day) => (
            <View key={day.date} style={styles.dayContainer}>
              <View style={[
                styles.dayCircle,
                {
                  backgroundColor: day.hasProgress 
                    ? (day.completed ? '#27AE60' : '#E74C3C')
                    : day.isPast 
                      ? '#BDC3C7' 
                      : colors.border,
                  borderColor: day.isToday ? colors.primary : 'transparent',
                  borderWidth: day.isToday ? 2 : 0
                }
              ]}>
                {day.hasProgress && (
                  <FontAwesome 
                    name={day.completed ? "check" : "times"} 
                    size={12} 
                    color="white" 
                  />
                )}
              </View>
              <Text style={[styles.dayLabel, { color: colors.text }]}>
                Day {day.dayNumber}
              </Text>
            </View>
          ))}
        </View>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
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
  challengeTitle: {
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
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
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
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonIcon: {
    marginRight: 10,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkInSection: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  checkInSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  checkInButtons: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  progressButton: {
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
  progressButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '500',
  },
  completedChallengeSection: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  completedChallengeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  recordingIndicator: {
    marginTop: 16,
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
  detailsCard: {
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailDivider: {
    height: 1,
  },
  progressHistoryContainer: {
    marginTop: 10,
  },
  progressGrid: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 8,
  },
  dayContainer: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
});