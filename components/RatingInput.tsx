import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

interface RatingInputProps {
  maxRating?: number;
  initialRating?: number;
  size?: number;
  showEmoji?: boolean;
  onRatingChange?: (rating: number) => void;
}

const RatingInput: React.FC<RatingInputProps> = ({
  maxRating = 5,
  initialRating = 0,
  size = 30,
  showEmoji = true,
  onRatingChange,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const [rating, setRating] = useState<number>(initialRating);
  
  const getEmoji = (currentRating: number) => {
    if (maxRating === 5) {
      switch (currentRating) {
        case 1: return { icon: 'frown-o', text: 'Poor' };
        case 2: return { icon: 'meh-o', text: 'Fair' };
        case 3: return { icon: 'smile-o', text: 'Good' };
        case 4: return { icon: 'smile-o', text: 'Great' };
        case 5: return { icon: 'star', text: 'Excellent' };
        default: return { icon: '', text: 'Rate your experience' };
      }
    } else {
      return { icon: '', text: `Rating: ${currentRating}/${maxRating}` };
    }
  };
  
  const handleRating = (value: number) => {
    setRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    }
  };
  
  const emoji = getEmoji(rating);
  
  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }, (_, index) => {
          const ratingValue = index + 1;
          const filled = ratingValue <= rating;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleRating(ratingValue)}
              style={styles.starButton}
            >
              <FontAwesome
                name={filled ? 'star' : 'star-o'}
                size={size}
                color={filled ? colors.accent : '#CCCCCC'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      
      {showEmoji && rating > 0 && (
        <View style={styles.emojiContainer}>
          {emoji.icon ? (
            <FontAwesome
              name={emoji.icon as any}
              size={size}
              color={colors.accent}
              style={styles.emojiIcon}
            />
          ) : null}
          <Text style={[styles.emojiText, { color: colors.text }]}>
            {emoji.text}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 5,
  },
  emojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emojiIcon: {
    marginRight: 8,
  },
  emojiText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RatingInput; 