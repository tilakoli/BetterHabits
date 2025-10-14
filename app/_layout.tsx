import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router, useSegments, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/utils/components/useColorScheme";
import { ThemeProvider } from "@/utils/components/ThemeContext";
import { AuthContextProvider, useAuth } from "@/providers/AuthProvider/useAuth";
import Colors from "@/constants/Colors";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export {
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
      <AuthContextProvider>
         <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
        </GestureHandlerRootView>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isNavigating = useRef(false);
  const initialAuthCheck = useRef(true);
  const lastAuthState = useRef<{ isAuthenticated: boolean; path: string } | null>(null);
  const colorScheme = useColorScheme();

  // Hide header for auth screens
  const isAuthScreen = segments[0] === '(auth)' || 
                     segments[0] === 'signIn' || 
                     segments[0] === 'signUp';

  // Handle navigation based on auth state and current route
  useEffect(() => {
    const currentPath = segments.join('/');
    const currentAuthState = { isAuthenticated, path: currentPath };
    
    if (isLoading || isNavigating.current) {
      return;
    }

    const authStateChanged = !lastAuthState.current || 
      lastAuthState.current.isAuthenticated !== isAuthenticated ||
      lastAuthState.current.path !== currentPath;

    if (!authStateChanged) {
      return;
    }

    lastAuthState.current = currentAuthState;

    const inAuthGroup = segments[0] === 'signIn' || segments[0] === 'signUp';
    const inAppGroup = segments[0] === '(app)';

    const navigateTo = (path: string) => {
      isNavigating.current = true;
      router.replace(path);
      
      setTimeout(() => {
        isNavigating.current = false;
      }, 100);
    };

    if (initialAuthCheck.current) {
      initialAuthCheck.current = false;
      
      if (isAuthenticated) {
        if (inAuthGroup) {
          navigateTo('/(app)/(tabs)');
        }
      } else {
        if (inAppGroup) {
          navigateTo('/signIn');
        }
      }
      return;
    }

    if (isAuthenticated) {
      if (inAuthGroup) {
        navigateTo('/(app)/(tabs)');
      }
    } else {
      if (inAppGroup) {
        navigateTo('/signIn');
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading && initialAuthCheck.current) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{
        headerShown: !isAuthScreen,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
      }}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="signIn" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
