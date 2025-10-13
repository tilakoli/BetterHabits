import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { HabitParticipation } from '@/types';

interface ReadingProgressProps {
  participation: HabitParticipation;
}

export function ReadingProgress({ participation }: ReadingProgressProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  // Get all reading entries
  const getReadingEntries = () => {
    const entries = Object.entries(participation.dailyProgress || {})
      .filter(([_, progress]: [string, any]) => progress.completed && progress.data?.pagesRead)
      .map(([date, progress]: [string, any]) => ({
        date,
        pagesRead: progress.data.pagesRead,
        reflection: progress.data.reflection,
        bookName: progress.data.bookName,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

    return entries;
  };

  const entries = getReadingEntries();
  const totalPages = entries.reduce((sum, entry) => sum + entry.pagesRead, 0);
  const avgPages = entries.length > 0 ? Math.round(totalPages / entries.length) : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <FontAwesome name="book" size={20} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalPages}
          </Text>
          <Text style={styles.statLabel}>Total Pages</Text>
        </View>
        
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        
        <View style={styles.statItem}>
          <FontAwesome name="line-chart" size={20} color={colors.accent} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {avgPages}
          </Text>
          <Text style={styles.statLabel}>Avg/Day</Text>
        </View>
      </View>

      {/* Reading Entries */}
      <ScrollView style={styles.entriesList} showsVerticalScrollIndicator={false}>
        {entries.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No reading entries yet. Start tracking today!
          </Text>
        ) : (
          entries.map((entry) => (
            <View key={entry.date} style={[styles.entryCard, { backgroundColor: colors.card }]}>
              <View style={styles.entryHeader}>
                <Text style={[styles.entryDate, { color: colors.text }]}>
                  {formatDate(entry.date)}
                </Text>
                <View style={styles.pagesTag}>
                  <FontAwesome name="file-text-o" size={12} color={colors.primary} />
                  <Text style={[styles.pagesText, { color: colors.primary }]}>
                    {entry.pagesRead} pages
                  </Text>
                </View>
              </View>

              {entry.bookName && (
                <Text style={[styles.bookName, { color: colors.text }]}>
                  📖 {entry.bookName}
                </Text>
              )}

              {entry.reflection && (
                <Text style={[styles.reflection, { color: colors.text }]}>
                  {entry.reflection}
                </Text>
              )}
            </View>
          ))
        )}
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
  entriesList: {
    maxHeight: 400,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
    fontStyle: 'italic',
  },
  entryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  pagesTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  pagesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookName: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  reflection: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
});