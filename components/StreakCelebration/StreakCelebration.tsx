import React, { useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';

interface StreakCelebrationProps {
  milestone: number;
  onDismiss: () => void;
}

 const StreakCelebration = ({ milestone, onDismiss }: StreakCelebrationProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <FontAwesome name="fire" size={24} color="#e74c3c" />
      <Text style={styles.text}>
        🎉 {milestone} Day Streak! Keep going!
      </Text>
    </Animated.View>
  );
}

export default StreakCelebration

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#2c3e50',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});