import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { HabitParticipation } from '@/types';

interface HistoryCardProps {
  participation: HabitParticipation;
  onPress: () => void;
}

const HistoryCard = ({ participation, onPress }: HistoryCardProps) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const formatDateRange = () => {
    const start = participation.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = participation.endDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const getStatusBadge = () => {
    if (participation.isCompleted) {
      return { text: 'Completed', color: '#27AE60', icon: 'check-circle' };
    }
    if (!participation.isActive) {
      return { text: 'Given Up', color: '#E74C3C', icon: 'times-circle' };
    }
    return { text: 'Active', color: colors.primary, icon: 'clock-o' };
  };

  const status = getStatusBadge();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
        <FontAwesome name={status.icon} size={12} color="white" />
        <Text style={styles.statusText}>{status.text}</Text>
      </View>

      {/* Challenge Name */}
      <Text style={[styles.title, { color: colors.text }]}>
        {participation.habitName}
      </Text>

      {/* Date Range */}
      <Text style={[styles.dateRange, { color: colors.text }]}>
        {formatDateRange()}
      </Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <FontAwesome name="percent" size={14} color={colors.accent} />
          <Text style={[styles.statText, { color: colors.text }]}>
            {participation.completionRate}% Complete
          </Text>
        </View>

        <View style={styles.statItem}>
          <FontAwesome name="fire" size={14} color="#e74c3c" />
          <Text style={[styles.statText, { color: colors.text }]}>
            {participation.longestStreak} Day Streak
          </Text>
        </View>
      </View>

      {/* Days Completed */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${participation.completionRate}%`,
              backgroundColor: status.color 
            }
          ]} 
        />
      </View>
      <Text style={[styles.daysText, { color: colors.text }]}>
        {participation.totalCompletedDays} / {participation.totalDays} days
      </Text>
    </TouchableOpacity>
  );
}

export default HistoryCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    paddingRight: 80,
  },
  dateRange: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  daysText: {
    fontSize: 12,
    opacity: 0.6,
  },
});