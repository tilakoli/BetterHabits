import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View, Card, TransparentView } from '@/components/Themed';
import ProgressCircle from './ProgressCircle';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Habit } from '@/types';

interface HabitCardProps {
  habit: Habit;
  onComplete?: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete }) => {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const progress = (habit.progress.daysCompleted / habit.duration) * 100;
  
  const handlePress = () => {
    router.push(`/habit/${habit.id}`);
  };
  
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Card style={styles.container}>
        <TransparentView style={styles.content}>
          <Text style={styles.title}>{habit.name}</Text>
          <Text style={[styles.category, { color: colorScheme === 'dark' ? '#AAA' : '#666' }]}>
            {habit.category}
          </Text>
          <TransparentView style={styles.stats}>
            <Text style={[styles.statText, { color: colorScheme === 'dark' ? '#DDD' : '#555' }]}>
              <FontAwesome name="calendar-check-o" size={14} color={colors.text} /> {habit.progress.daysCompleted} / {habit.duration} days
            </Text>
            <Text style={[styles.statText, { color: colorScheme === 'dark' ? '#DDD' : '#555' }]}>
              <FontAwesome name="fire" size={14} color={colors.accent} /> {habit.progress.currentStreak} day streak
            </Text>
          </TransparentView>
        </TransparentView>
        <TransparentView style={styles.rightContent}>
          <ProgressCircle 
            percentage={progress} 
            size={70} 
            color={colors.secondary}
            backgroundColor={colorScheme === 'dark' ? '#333' : undefined}
            textColor={colorScheme === 'dark' ? '#FFF' : '#000'}
          />
          <TouchableOpacity 
            style={[styles.completeButton, { backgroundColor: colors.secondary }]}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        </TransparentView>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  stats: {
    flexDirection: 'column',
    gap: 4,
  },
  statText: {
    fontSize: 14,
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default HabitCard; 