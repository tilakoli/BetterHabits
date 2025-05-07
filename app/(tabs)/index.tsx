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

export default function HomeScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);
  const [greeting, setGreeting] = useState(getGreeting());
  const [quote, setQuote] = useState(getRandomMotivationalQuote());
  const [streakCount, setStreakCount] = useState(5); // Mock streak count
  
  // Update greeting based on time of day
  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // Update every minute
    
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
    router.push('/(tabs)/challenges');
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{greeting}, Alex</Text>
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
          {habits.length > 0 ? (
            habits.map(habit => (
              <HabitCard 
                key={habit.id}
                habit={habit}
                onComplete={() => handleCompleteHabit(habit.id)}
              />
            ))
          ) : (
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
          )}
        </View>

        <TouchableOpacity 
          style={[styles.challengeButton, { backgroundColor: colors.primary }]}
          onPress={navigateToNewChallenge}
        >
          <FontAwesome name="trophy" size={18} color="white" style={styles.buttonIcon} />
          <Text style={styles.challengeButtonText}>Join New Challenge</Text>
        </TouchableOpacity>
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
});
