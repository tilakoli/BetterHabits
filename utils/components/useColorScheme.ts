import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export function useColorScheme() {
  const { colorScheme } = useContext(ThemeContext);
  return colorScheme;
}
