import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/utils/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';

interface MotivationalGreetingProps {
  username: string;
}

const MOTIVATIONAL_GREETINGS = [
  "You got this",
  "Make it happen",
  "Let's go",
  "Stay strong",
  "Keep pushing",
  "Build your future",
  "One step at a time",
  "Progress over perfection",
  "Today is your day",
  "You're unstoppable",
  "Crush your goals",
  "Own today",
  "You've got the power",
  "We believe in you",
  "You're doing great",
  "Keep going",
  "You're on fire",
  "Never give up",
  "Believe in yourself",
  "Chase your dreams",
];

const getRandomGreeting = () => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_GREETINGS.length);
  return MOTIVATIONAL_GREETINGS[randomIndex];
};

const MotivationalGreeting: React.FC<MotivationalGreetingProps> = ({ username }) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [greeting, setGreeting] = useState(getRandomGreeting());

  // Optional: Change greeting periodically (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getRandomGreeting());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.greeting, { color: colors.text }]}>
        {greeting}
      </Text>
      <Text style={[styles.username, { color: colors.text }]}>
         {/* // colors.primary */}
         {username}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap:4,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MotivationalGreeting;