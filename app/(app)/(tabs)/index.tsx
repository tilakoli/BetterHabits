import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { Text, View } from "@/utils/components/Themed";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/utils/components/useColorScheme";
import { HabitCard, StreakCounter, ChallengeCard, DailyQuote, MotivationalGreeting } from "@/components";
import { completeHabitForToday } from "@/utils/habitUtils";
import { Challenge, HabitTemplate, HabitParticipation } from "@/types";
import { useAuth } from "@/providers/AuthProvider/useAuth";
import { habitService } from "@/services/habitService";

export default function HomeScreen() {
  const { user, userData } = useAuth();
  const colorScheme = useColorScheme() || "light";
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [habits, setHabits] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] =
    useState<HabitParticipation | null>(null);
  const [challengeTemplate, setChallengeTemplate] =
    useState<HabitTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streakCount, setStreakCount] = useState(5);

  // Load active challenge data
  const loadActiveChallenge = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const challenge = await habitService.getUserActiveChallenge(user.uid);
      setActiveChallenge(challenge);

      if (challenge) {
        const template = await habitService.getHabitById(challenge.habitId);
        setChallengeTemplate(template);
      }
    } catch (error) {
      console.error("Error loading active challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActiveChallenge();
    setRefreshing(false);
  };

  useEffect(() => {
    loadActiveChallenge();
  }, [user]);

  const handleCompleteHabit = (habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId ? completeHabitForToday(habit) : habit
      )
    );
  };

  const navigateToNewChallenge = () => {
    router.push("/(app)/(tabs)/challenges");
  };

  const renderHeader = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        
        <MotivationalGreeting username={userData.username} />

        <View style={[styles.streakBadge, { backgroundColor: `${colors.primary}15` }]}>
          <FontAwesome name="fire" size={16} color={colors.primary} />
          <Text style={[styles.streakText, { color: colors.primary }]}>
            {streakCount}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border || '#E5E5E5' }]} />

      <View style={[{backgroundColor: colors.background}]}>
        <DailyQuote />
      </View>
    </>
  );

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      );
    }

    if (activeChallenge && challengeTemplate) {
      return (
        <View style={styles.activeChallengeContainer}>
          <ChallengeCard
            challenge={challengeTemplate}
            onPress={() => router.push(`/habit/${challengeTemplate.id}`)}
            isJoined={true}
          />
        </View>
      );
    }

    return (
      <View style={styles.challengeButtonContainer}>
        <TouchableOpacity
          style={[
            styles.challengeButton,
            { 
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
          onPress={navigateToNewChallenge}
          activeOpacity={0.8}
        >
          <View style={styles.buttonIconWrapper}>
            <FontAwesome
              name="trophy"
              size={20}
              color="white"
            />
          </View>
          <Text style={styles.challengeButtonText}>Start Your First Challenge</Text>
          <FontAwesome name="arrow-right" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHabitItem = ({ item }: { item: Challenge }) => (
    <HabitCard
      habit={item}
      onComplete={() => handleCompleteHabit(item.id)}
    />
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={habits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakText: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    opacity: 0.3,
  },

  challengeButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    flex: 1,
    justifyContent: "center",
    minHeight: 200,
  },
  challengeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  challengeButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 17,
    flex: 1,
    letterSpacing: 0.2,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.6,
  },
  activeChallengeContainer: {
    paddingHorizontal: 22,
    paddingTop: 20,
  },
});