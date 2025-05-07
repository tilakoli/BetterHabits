import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  colorScheme: ColorSchemeName;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorSchemeName) => void;
  isDarkMode: boolean;
};

export const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  toggleTheme: () => {},
  setColorScheme: () => {},
  isDarkMode: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(deviceColorScheme);

  // Load saved theme on startup
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('colorScheme');
        if (savedTheme) {
          setColorScheme(savedTheme as ColorSchemeName);
        }
      } catch (error) {
        console.error('Failed to load saved theme', error);
      }
    };
    loadSavedTheme();
  }, []);

  const toggleTheme = () => {
    const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newScheme);
    saveTheme(newScheme);
  };

  const saveTheme = async (newScheme: ColorSchemeName) => {
    try {
      await AsyncStorage.setItem('colorScheme', newScheme as string);
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        colorScheme, 
        toggleTheme, 
        setColorScheme: (scheme) => {
          setColorScheme(scheme);
          saveTheme(scheme);
        },
        isDarkMode: colorScheme === 'dark'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 