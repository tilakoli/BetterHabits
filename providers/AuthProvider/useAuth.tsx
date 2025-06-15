import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef } from "react";
import { LoginPayload, SignUpPayload } from "./types";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  User, 
  AuthError, 
  signOut,
  getAuth
} from "firebase/auth";
import { auth, clearPersistedAuthState } from '@/firebaseConfig'
import { router } from "expo-router";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<{ success: boolean; error?: string }>;
  signUp: (payload: SignUpPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// @ts-ignore
export const AuthContext = React.createContext<AuthContextType>();

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  console.log("[AuthProvider] MOUNTED");
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const isInitializing = useRef(true);
  const isLoggingOut = useRef(false);
  const hasInitialized = useRef(false);

  // Log Firebase auth configuration on mount
  useEffect(() => {
    const auth = getAuth();
    console.log("[AuthProvider] Firebase Auth Configuration:", {
      currentUser: auth.currentUser ? "exists" : "null",
      app: auth.app.name,
      config: auth.app.options
    });
  }, []);

  useEffect(() => {
    console.log("[AuthProvider] Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[AuthProvider] Auth state changed:", { 
        user: user ? "exists" : "null",
        uid: user?.uid,
        email: user?.email,
        isAnonymous: user?.isAnonymous,
        metadata: user?.metadata,
        isInitializing: isInitializing.current,
        isLoggingOut: isLoggingOut.current,
        hasInitialized: hasInitialized.current
      });
      
      setIsLoading(true);

      // If we're logging out, don't restore the auth state
      if (isLoggingOut.current) {
        console.log("[AuthProvider] Logging out, ignoring auth state change");
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // If we're initializing and there's no user, clear any persisted state
      if (isInitializing.current && !user) {
        console.log("[AuthProvider] Initializing with no user, clearing persisted state");
        await clearPersistedAuthState();
      }

      // Only update state if we're not initializing or if we've already initialized once
      if (!isInitializing.current || hasInitialized.current) {
        if (user) {
          console.log("[AuthProvider] User authenticated, setting state");
          setIsAuthenticated(true);
          setUser(user);
        } else {
          console.log("[AuthProvider] No user, clearing auth state");
          setIsAuthenticated(false);
          setUser(null);
        }
      }

      isInitializing.current = false;
      hasInitialized.current = true;
      setIsLoading(false);
    });

    return () => {
      console.log("[AuthProvider] Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }: LoginPayload): Promise<{ success: boolean; error?: string }> => {
    console.log("[AuthProvider] Attempting sign in");
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("[AuthProvider] Sign in successful");
      
      // Update auth state immediately
      setIsAuthenticated(true);
      setUser(userCredential.user);
      
      return { success: true };
    } catch (error) {
      console.log("[AuthProvider] Sign in error:", error);
      let errorMessage = 'Failed to log in. Please try again.';
      
      if (error instanceof Error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
          errorMessage = 'Invalid email or password';
        } else if (authError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (authError.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later';
        }
      }
      
      // Ensure auth state is cleared on error
      setIsAuthenticated(false);
      setUser(null);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async ({
    email,
    password,
    userName,
  }: SignUpPayload): Promise<{ success: boolean; error?: string }> => {
    console.log("[AuthProvider] Attempting sign up");
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("[AuthProvider] Sign up successful, signing out");
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.log("[AuthProvider] Sign up error:", error);
      let errorMessage = 'An error occurred during signup';
      
      if (error instanceof Error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already registered';
        } else if (authError.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters';
        } else if (authError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        }
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log("[AuthProvider] Starting logout process");
    try {
      setIsLoading(true);
      isLoggingOut.current = true;
      
      // Log current auth state before logout
      const currentUser = auth.currentUser;
      console.log("[AuthProvider] Pre-logout state:", {
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          isAnonymous: currentUser.isAnonymous
        } : "null",
        isAuthenticated,
        user: user ? {
          uid: user.uid,
          email: user.email
        } : "null"
      });

      // First, clear local state to prevent unwanted redirects
      setIsAuthenticated(false);
      setUser(null);

      // Then sign out from Firebase
      console.log("[AuthProvider] Calling Firebase signOut");
      await signOut(auth);
      console.log("[AuthProvider] Firebase sign out successful");
      
      // Clear persisted auth state
      console.log("[AuthProvider] Clearing persisted auth state");
      await clearPersistedAuthState();
      console.log("[AuthProvider] Persisted auth state cleared");
      
      // Clear any remaining AsyncStorage items
      await AsyncStorage.removeItem("isLoggedIn");
      console.log("[AuthProvider] AsyncStorage cleared");
      
      // Final auth state check
      const finalUser = auth.currentUser;
      console.log("[AuthProvider] Final auth state:", {
        currentUser: finalUser ? "exists" : "null",
        isAuthenticated: false,
        user: null
      });
      
      // Navigate to sign in
      console.log("[AuthProvider] Navigating to sign in");
      router.replace('/signIn');
    } catch (error) {
      console.error("[AuthProvider] Logout error:", error);
      // Even if there's an error, ensure we're logged out
      setIsAuthenticated(false);
      setUser(null);
      router.replace('/signIn');
    } finally {
      setIsLoading(false);
      isLoggingOut.current = false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        signIn,
        logout,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined || !context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
