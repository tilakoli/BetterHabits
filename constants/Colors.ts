const tintColorLight = '#2D5BFF'; // Primary blue
const tintColorDark = '#2D5BFF';

export default {
  light: {
    text: '#212529',
    background: '#F8F9FA',
    card: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: '#2D5BFF',
    secondary: '#4CD964',
    accent: '#FF9500',
    border: '#EEE',
  },
  dark: {
    text: '#F8F9FA',
    background: '#121212', // Darker background
    card: '#1E1E1E',     // Slightly lighter than background
    tint: tintColorDark,
    tabIconDefault: '#666',
    tabIconSelected: tintColorDark,
    primary: '#4D7FFF', // Slightly brighter in dark mode
    secondary: '#4CD964',
    accent: '#FF9500',
    border: '#333',
  },
};
