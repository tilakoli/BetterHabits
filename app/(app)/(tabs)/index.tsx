import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import HabitCard from '@/components/HabitCard';
import StreakCounter from '@/components/StreakCounter';
import { getGreeting } from '@/utils/dateUtils';
import { getRandomMotivationalQuote } from '@/utils/habitUtils';
import { sampleHabits } from '@/constants/SampleData';
import { completeHabitForToday } from '@/utils/habitUtils';
import { Habit } from '@/types';
import { useAuth } from '@/providers/AuthProvider/useAuth';

export default function HomeScreen() {
  const { user, userData } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);
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
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
            <Text style={[styles.userName, { color: colors.primary }]}>
            {userData?.username || 'User'}
          </Text>
          </View>
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
          {/* ) : (
            <View style={styles.emptyStateContainer}>
              <FontAwesome name="calendar-plus-o" size={60} color={colors.primary} />
              <Text style={styles.emptyStateText}>
                You don't have any active habits
              </Text>
              <TouchableOpacity 
                style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/habit/[id]' as any)}
              >
                <Text style={styles.emptyStateButtonText}>Create Your First Habit</Text>
              </TouchableOpacity>
            </View>
          )} */}
        </View>

        <View style={styles.challengeButtonContainer}>
        <TouchableOpacity 
          style={[styles.challengeButton, { backgroundColor: colors.primary }]}
          onPress={navigateToNewChallenge}
        >
          <FontAwesome name="trophy" size={18} color="white" style={styles.buttonIcon} />
          <Text style={styles.challengeButtonText}>Join New Challenge</Text>
        </TouchableOpacity>
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
    paddingBottom: 30,
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
    marginBottom: 16,
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
});
