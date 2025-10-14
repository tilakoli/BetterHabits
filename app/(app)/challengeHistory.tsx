import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import { HabitParticipation } from '@/types';
import {HistoryCard} from '@/components';

type FilterType = 'all' | 'completed' | 'givenUp';

export default function ChallengeHistoryScreen() {
  const { userData } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [filter, setFilter] = useState<FilterType>('all');
  const [historyData, setHistoryData] = useState<HabitParticipation[]>([]);

  useEffect(() => {
    loadHistory();
  }, [userData, filter]);

  const loadHistory = () => {
    if (!userData?.habits) return;

    const allChallenges = Object.entries(userData.habits)
      .map(([id, participation]) => ({ ...participation, id }))
      .filter(p => !p.isActive); // Only show inactive challenges

    let filtered = allChallenges;

    if (filter === 'completed') {
      filtered = allChallenges.filter(p => p.isCompleted);
    } else if (filter === 'givenUp') {
      filtered = allChallenges.filter(p => !p.isCompleted);
    }

    // Sort by most recent
    filtered.sort((a, b) => {
      const dateA = a.completedDate || a.lastUpdated;
      const dateB = b.completedDate || b.lastUpdated;
      return dateB.toMillis() - dateA.toMillis();
    });

    setHistoryData(filtered);
  };

  const renderFilter = (type: FilterType, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { backgroundColor: filter === type ? colors.primary : colors.card },
      ]}
      onPress={() => setFilter(type)}
    >
      <FontAwesome
        name={icon}
        size={14}
        color={filter === type ? 'white' : colors.text}
      />
      <Text
        style={[
          styles.filterText,
          { color: filter === type ? 'white' : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="history" size={48} color={colors.text} style={{ opacity: 0.3 }} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No challenge history yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.text }]}>
        Complete or give up on challenges to see them here
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        {renderFilter('all', 'All', 'list')}
        {renderFilter('completed', 'Completed', 'check-circle')}
        {renderFilter('givenUp', 'Given Up', 'times-circle')}
      </View>

      {/* History List */}
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <HistoryCard
            participation={item}
            onPress={() => router.push(`/history/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});