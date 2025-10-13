import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { HabitParticipation } from '@/types';

interface MeditationProgressProps {
  participation: HabitParticipation;
}

export function MeditationProgress({ participation }: MeditationProgressProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  // Get all meditation entries
  const getMeditationEntries = () => {
    const entries = Object.entries(participation.dailyProgress || {})
      .filter(([_, progress]: [string, any]) => progress.completed && progress.data?.minutes)
      .map(([date, progress]: [string, any]) => ({
        date,
        minutes: progress.data.minutes,
        notes: progress.data.notes,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return entries;
  };

  const entries = getMeditationEntries();
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  const avgMinutes = entries.length > 0 ? Math.round(totalMinutes / entries.length) : 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <FontAwesome name="clock-o" size={20} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalHours}h {remainingMinutes}m
          </Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        
        <View style={styles.statItem}>
          <FontAwesome name="line-chart" size={20} color={colors.accent} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {avgMinutes}
          </Text>
          <Text style={styles.statLabel}>Avg Minutes</Text>
        </View>
      </View>

      {/* Daily Progress */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.progressGrid}>
          {entries.map((entry) => (
            <View key={entry.date} style={[styles.dayCard, { backgroundColor: colors.card }]}>
              <View style={styles.minutesBadge}>
                <FontAwesome name="clock-o" size={14} color={colors.primary} />
                <Text style={[styles.minutesText, { color: colors.primary }]}>
                  {entry.minutes}m
                </Text>
              </View>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(entry.date)}
              </Text>
              {entry.notes && (
                <Text style={[styles.notesPreview, { color: colors.text }]} numberOfLines={2}>
                  {entry.notes}
                </Text>
              )}
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
    padding: 12,
    borderRadius: 12,
    width: 140,
    gap: 8,
  },
  minutesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  minutesText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  notesPreview: {
    fontSize: 11,
    fontStyle: 'italic',
    opacity: 0.6,
  },
});