import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider } from '@/components/ThemeContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  
  // Mock auth state (in a real app, this would come from a context/auth provider)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Check for authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, you'd check a token or user session
        // For demo, just check if we've "logged in" before
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        setIsAuthenticated(loggedIn === 'true');
      } catch (e) {
        console.error('Error checking auth status', e);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isCheckingAuth) {
    return null; // or a loading spinner
  }
  
  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/[id]" options={{ 
          headerShown: true,
          title: 'Habit Details',
          headerBackTitle: 'Back',
        }} />
        <Stack.Screen name="habit-creation" options={{ 
          headerShown: true,
          title: 'Create Habit',
        }} />
        <Stack.Screen name="habit-edit/[id]" options={{ 
          headerShown: true,
          title: 'Edit Habit',
        }} />
        <Stack.Screen name="activity-logging" options={{ 
          headerShown: true,
          title: 'Complete Activity',
          headerBackVisible: false,
        }} />
        <Stack.Screen name="challenge/[id]" options={{ 
          headerShown: true,
          title: 'Challenge Details',
        }} />
      </Stack>
      
      {/* Only redirect to login if not authenticated */}
      {!isAuthenticated && <Redirect href="/(auth)/login" />}
    </NavigationThemeProvider>
  );
}
