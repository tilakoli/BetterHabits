import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { HabitCard, StreakCounter, ChallengeCard } from '@/components';
import { getGreeting } from '@/utils/dateUtils';
import { getRandomMotivationalQuote } from '@/utils/habitUtils';
import { completeHabitForToday } from '@/utils/habitUtils';
import { Habit, HabitTemplate, HabitParticipation } from '@/types';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import { habitService } from '@/services/habitService';

export default function HomeScreen() {
  const { user, userData } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<HabitParticipation | null>(null);
  const [challengeTemplate, setChallengeTemplate] = useState<HabitTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState(getGreeting());
  const [quote, setQuote] = useState(getRandomMotivationalQuote());
  const [streakCount, setStreakCount] = useState(5); // Mock streak count
  const Quotations = [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "The best way to predict the future is to invent it.",
  ]
  
  // Load active challenge data
  const loadActiveChallenge = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const challenge = await habitService.getUserActiveChallenge(user.uid);
      setActiveChallenge(challenge);
      
      if (challenge) {
        const template = await habitService.getHabitById(challenge.habitId);
        setChallengeTemplate(template);
      }
    } catch (error) {
      console.error('Error loading active challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveChallenge();
  }, [user]);

  // Refresh when screen comes into focus (e.g., after giving up a challenge)
  useFocusEffect(
    React.useCallback(() => {
      loadActiveChallenge();
    }, [user])
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(getGreeting());
       for (let i = 0;  i < Quotations.length; i ++) {
        setQuote(Quotations[i]);
       }
    }, 4000); 
    
    return () => clearInterval(timer);
  }, []);
  
  const handleCompleteHabit = (habitId: string) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => 
        habit.id === habitId ? completeHabitForToday(habit) : habit
      )
    );
  };
  
  const navigateToNewChallenge = () => {
    router.push('/(app)/(tabs)/challenges');
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.background  }]}>
           <View> <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
            <Text style={[styles.userName, { color: colors.primary }]}>
            {userData?.username || 'User'}
          </Text></View>

          <View style={styles.headerRight}>
            <StreakCounter 
              count={streakCount}
              size="small"
              showLabel={true}
            />
          </View>

          
        </View>
        
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>"{quote}"</Text>
        </View>
        
        <View style={styles.habitsList}>
          {habits.length > 0 && 
            habits.map(habit => (
              <HabitCard 
                key={habit.id}
                habit={habit}
                onComplete={() => handleCompleteHabit(habit.id)}
              />
            ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
          </View>
        ) : activeChallenge && challengeTemplate ? (
          <View style={styles.activeChallengeContainer}>
            <ChallengeCard
              challenge={challengeTemplate}
              onPress={() => router.push(`/habit/${challengeTemplate.id}`)}
              isJoined={true}
            />
          </View>
        ) : (
          <View style={styles.challengeButtonContainer}>
            <TouchableOpacity 
              style={[styles.challengeButton, { backgroundColor: colors.primary }]}
              onPress={navigateToNewChallenge}
            >
              <FontAwesome name="trophy" size={18} color="white" style={styles.buttonIcon} />
              <Text style={styles.challengeButtonText}>Join New Challenge</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 30,
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  habitsList: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quoteContainer: {
    paddingHorizontal: 20,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'left',
    color: '#666',
    lineHeight: 24,
  },
  challengeButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    // backgroundColor: 'red',
    flex: 1,
    justifyContent: 'center',
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonIcon: {
    marginRight: 10,
  },
  challengeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
  },
  activeChallengeContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});
