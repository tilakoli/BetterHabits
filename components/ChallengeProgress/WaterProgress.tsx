import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { HabitParticipation } from '@/types';

interface WaterProgressProps {
  participation: HabitParticipation;
}

export function WaterProgress({ participation }: WaterProgressProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  // Generate date range with water data
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
        glasses: progress?.data?.glasses || 0,
        ml: progress?.data?.ml || 0,
        isPast,
        isToday
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const dateRange = generateDateRange();
  const totalGlasses = dateRange.reduce((sum, day) => sum + day.glasses, 0);
  const totalLiters = Math.round((dateRange.reduce((sum, day) => sum + day.ml, 0) / 1000) * 10) / 10;
  const avgGlasses = dateRange.filter(d => d.hasProgress).length > 0
    ? Math.round(totalGlasses / dateRange.filter(d => d.hasProgress).length)
    : 0;

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <FontAwesome name="tint" size={20} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalLiters}L
          </Text>
          <Text style={styles.statLabel}>Total Water</Text>
        </View>
        
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      
        <View style={styles.statItem}>
          <FontAwesome name="line-chart" size={20} color={colors.accent} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {avgGlasses}
          </Text>
          <Text style={styles.statLabel}>Avg Glasses</Text>
        </View>
      </View>

      {/* Daily Progress */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.progressGrid}>
          {dateRange.map((day) => (
            <View key={day.date} style={styles.dayCard}>
              <View style={[
                styles.dayCircle,
                {
                  backgroundColor: day.hasProgress 
                    ? (day.completed ? '#3498db' : '#E74C3C')
                    : day.isPast 
                      ? '#BDC3C7' 
                      : colors.border,
                  borderColor: day.isToday ? colors.primary : 'transparent',
                  borderWidth: day.isToday ? 2 : 0
                }
              ]}>
                <FontAwesome 
                  name="tint" 
                  size={14} 
                  color="white" 
                />
              </View>
              
              {day.glasses > 0 && (
                <Text style={[styles.glassesText, { color: colors.text }]}>
                  {day.glasses} 💧
                </Text>
              )}
              
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
    gap: 16,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: '70%',
  },
  progressGrid: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 12,
  },
  dayCard: {
    alignItems: 'center',
    width: 70,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  glassesText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
});