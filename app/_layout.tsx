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

import { useColorScheme } from "@/components/useColorScheme";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuthContextProvider, useAuth } from "@/providers/AuthProvider/useAuth";

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
        <RootLayoutNav />
      </AuthContextProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [lastAuthState, setLastAuthState] = useState(isAuthenticated);
  const currentPath = segments.join('/');
  const isNavigating = useRef(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    console.log("[RootLayoutNav] Current state:", {
      currentPath,
      isAuthenticated,
      isLoading,
      lastAuthState,
      segments,
      isNavigating: isNavigating.current,
      hasInitialized: hasInitialized.current
    });

    // Don't do anything while loading or if we're already navigating
    if (isLoading || isNavigating.current) {
      console.log("[RootLayoutNav] Skipping navigation - loading or already navigating");
      return;
    }

    // Check if we're in the auth group
    const inAppGroup = segments[0] === "(app)";
    const isAuthScreen = segments[0] === "signIn" || segments[0] === "signUp";

    console.log("[RootLayoutNav] Navigation check:", {
      inAppGroup,
      isAuthScreen,
      shouldRedirectToHome: isAuthenticated && isAuthScreen,
      shouldRedirectToSignIn: !isAuthenticated && inAppGroup
    });

    // If auth state changed, update last known state
    if (isAuthenticated !== lastAuthState) {
      console.log("[RootLayoutNav] Auth state changed, updating last known state");
      setLastAuthState(isAuthenticated);
    }

    // Only handle navigation if we've initialized
    if (hasInitialized.current) {
      // Handle navigation based on auth state
      if (isAuthenticated) {
        // If authenticated and on auth screen, redirect to home
        if (isAuthScreen) {
          console.log("[RootLayoutNav] Authenticated user on auth screen, redirecting to home");
          isNavigating.current = true;
          router.replace("/(app)/(tabs)");
          return;
        }
      } else {
        // If not authenticated and in app group, redirect to sign in
        if (inAppGroup) {
          console.log("[RootLayoutNav] Unauthenticated user in app group, redirecting to sign in");
          isNavigating.current = true;
          router.replace("/signIn");
          return;
        }
      }
    } else {
      hasInitialized.current = true;
    }

    console.log("[RootLayoutNav] No redirect needed");
  }, [isAuthenticated, isLoading, segments, lastAuthState]);

  // Reset navigation flag when segments change
  useEffect(() => {
    isNavigating.current = false;
  }, [segments]);

  // Show nothing while loading
  if (isLoading) {
    console.log("[RootLayoutNav] Loading state, showing nothing");
    return null;
  }

  return <Stack />;
}
