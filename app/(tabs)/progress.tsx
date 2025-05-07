import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, View, TransparentView } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import ProgressCircle from '@/components/ProgressCircle';
import CalendarView from '@/components/CalendarView';
import { sampleHabits } from '@/constants/SampleData';

type TimeRange = 'week' | 'month' | 'year';

const PERIODS = ['Week', 'Month', 'Year'];
const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('week');
  
  const habits = sampleHabits;
  
  // Create a mock completion history for the calendar demo
  const createMockCompletionHistory = () => {
    const completionHistory: Record<string, boolean> = {};
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Mark random days as completed in the current month
    for (let i = 1; i <= today.getDate(); i++) {
      // 70% chance of completing a habit on a given day
      if (Math.random() > 0.3) {
        const date = new Date(currentYear, currentMonth, i);
        const dateStr = date.toISOString().split('T')[0];
        completionHistory[dateStr] = true;
      }
    }
    
    return completionHistory;
  };
  
  const mockCompletionHistory = createMockCompletionHistory();
  
  // Calculate completion rate based on the completed days in the time range
  const calculateCompletionRate = (timeRange: TimeRange) => {
    return 87; // Mock percentage
  };
  
  const getBestStreak = () => {
    return 12; // Mock streak
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timeRangeButtons}>
          <TouchableOpacity
            style={[
              styles.timeButton,
              selectedTimeRange === 'week' && [
                styles.activeTimeButton,
                { backgroundColor: colors.primary }
              ],
            ]}
            onPress={() => setSelectedTimeRange('week')}
          >
            <Text
              style={[
                styles.timeButtonText,
                selectedTimeRange === 'week' && styles.activeTimeButtonText,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeButton,
              selectedTimeRange === 'month' && [
                styles.activeTimeButton,
                { backgroundColor: colors.primary }
              ],
            ]}
            onPress={() => setSelectedTimeRange('month')}
          >
            <Text
              style={[
                styles.timeButtonText,
                selectedTimeRange === 'month' && styles.activeTimeButtonText,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeButton,
              selectedTimeRange === 'year' && [
                styles.activeTimeButton,
                { backgroundColor: colors.primary }
              ],
            ]}
            onPress={() => setSelectedTimeRange('year')}
          >
            <Text
              style={[
                styles.timeButtonText,
                selectedTimeRange === 'year' && styles.activeTimeButtonText,
              ]}
            >
              Year
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={styles.statLabel}>Total Habits</Text>
            <Text style={styles.statValue}>{habits.length}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={styles.statLabel}>Completion Rate</Text>
            <Text style={styles.statValue}>{calculateCompletionRate(selectedTimeRange)}%</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={styles.statLabel}>Best Streak</Text>
            <Text style={styles.statValue}>{getBestStreak()} days</Text>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Completion Overview</Text>
          
          <View style={[styles.completionCard, { backgroundColor: colors.card }]}>
            <ProgressCircle 
              percentage={calculateCompletionRate(selectedTimeRange)} 
              size={120}
              strokeWidth={12}
              color={colors.secondary}
              showPercentage={true}
            />
            
            <TransparentView style={styles.completionTextContainer}>
              <Text style={styles.completionTitle}>Great job!</Text>
              <Text style={styles.completionDescription}>
                You've completed {calculateCompletionRate(selectedTimeRange)}% of your habit goals for this {selectedTimeRange}.
              </Text>
            </TransparentView>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Monthly Calendar</Text>
          <CalendarView completionHistory={mockCompletionHistory} />
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Habit Comparison</Text>
          
          <TransparentView style={[
            styles.habitComparisonPlaceholder, 
            { borderColor: colorScheme === 'dark' ? '#444' : '#DDD' }
          ]}>
            <FontAwesome name="bar-chart" size={40} color={colorScheme === 'dark' ? '#444' : '#DDD'} />
            <Text style={[styles.placeholderText, { color: colorScheme === 'dark' ? '#999' : '#999' }]}>
              Coming Soon
            </Text>
          </TransparentView>
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
    padding: 16,
    paddingBottom: 40,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTimeButton: {
    backgroundColor: '#2D5BFF',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTimeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  completionCard: {
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  completionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  habitComparisonPlaceholder: {
    borderRadius: 12,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DDD',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
}); 