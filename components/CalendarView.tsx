import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

interface CalendarViewProps {
  completionHistory: Record<string, boolean>;
  month?: Date;
  onDatePress?: (date: Date) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView: React.FC<CalendarViewProps> = ({
  completionHistory,
  month: initialMonth,
  onDatePress,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const [currentMonth, setCurrentMonth] = useState<Date>(
    initialMonth || new Date()
  );
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0-6)
    const startOffset = firstDay.getDay();
    // Total number of days in month
    const daysInMonth = lastDay.getDate();
    
    // Previous month days to display
    const prevMonthDays = Array.from({ length: startOffset }, (_, i) => {
      const day = new Date(year, month, -startOffset + i + 1);
      return {
        date: day,
        isCurrentMonth: false,
        isToday: isToday(day),
        isCompleted: isDateCompleted(day),
      };
    });
    
    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = new Date(year, month, i + 1);
      return {
        date: day,
        isCurrentMonth: true,
        isToday: isToday(day),
        isCompleted: isDateCompleted(day),
      };
    });
    
    // Calculate how many days from next month to include to complete grid
    const remainingDays = (7 - (prevMonthDays.length + currentMonthDays.length) % 7) % 7;
    
    // Next month days to display
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
      const day = new Date(year, month + 1, i + 1);
      return {
        date: day,
        isCurrentMonth: false,
        isToday: isToday(day),
        isCompleted: isDateCompleted(day),
      };
    });
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const isDateCompleted = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return !!completionHistory[dateStr];
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const handleDatePress = (date: Date) => {
    if (onDatePress) {
      onDatePress(date);
    }
  };
  
  const days = getDaysInMonth(currentMonth);
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: colors.card }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <FontAwesome name="chevron-left" size={16} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth}>
          <FontAwesome name="chevron-right" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.daysOfWeek}>
        {DAYS_OF_WEEK.map(day => (
          <Text key={day} style={[styles.dayOfWeekText, { color: colors.text }]}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.daysGrid}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day.isToday && [styles.today, { borderColor: colors.primary }],
              !day.isCurrentMonth && styles.otherMonth,
              day.isCompleted && { backgroundColor: `${colors.secondary}50` },
            ]}
            onPress={() => handleDatePress(day.date)}
            disabled={!day.isCurrentMonth}
          >
            <Text
              style={[
                styles.dayText,
                !day.isCurrentMonth && [styles.otherMonthText, { color: colorScheme === 'dark' ? '#666' : '#bbb' }],
                day.isToday && [styles.todayText, { color: colors.primary }],
                day.isCurrentMonth && { color: colors.text },
              ]}
            >
              {day.date.getDate()}
            </Text>
            
            {day.isCompleted && (
              <View style={[styles.completedDot, { backgroundColor: colors.secondary }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '500',
    width: 32,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderRadius: 16,
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  otherMonth: {
    // Styling for days in prev/next month
  },
  otherMonthText: {
    opacity: 0.6,
  },
  today: {
    borderWidth: 1,
  },
  todayText: {
    fontWeight: 'bold',
  },
  completedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
});

export default CalendarView; 