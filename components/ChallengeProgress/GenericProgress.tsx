import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { HabitParticipation } from '@/types';

interface GenericProgressProps {
  participation: HabitParticipation;
}

export function GenericProgress({ participation }: GenericProgressProps) {
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
    <View style={styles.container}>
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