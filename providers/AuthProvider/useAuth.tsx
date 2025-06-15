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
import { useRouter } from "expo-router";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
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
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const isMounted = useRef(true);
  const isLoggingOut = useRef(false);
  const authChecked = useRef(false);
  const router = useRouter();

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted.current) return;
      
      if (isLoggingOut.current) {
        return;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        // Only clear persisted state if we've already checked auth at least once
        if (authChecked.current) {
          await clearPersistedAuthState();
        }
      }
      
      authChecked.current = true;
      if (isMounted.current) {
        setIsLoading(false);
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }: LoginPayload) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true };
    } catch (error: any) {
      console.error("[AuthProvider] Sign in error:", error);
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const logout = async () => {
    console.log("[AuthProvider] Starting logout process");
    if (isLoggingOut.current) {
      console.log("[AuthProvider] Logout already in progress, ignoring");
      return;
    }
    
    isLoggingOut.current = true;
    setIsLoading(true);
    
    try {
      console.log("[AuthProvider] Signing out from Firebase");
      // First sign out from Firebase
      await signOut(auth);
      
      console.log("[AuthProvider] Clearing local state");
      // Clear local state
      setUser(null);
      
      console.log("[AuthProvider] Clearing persisted auth state");
      // Clear persisted auth state
      await clearPersistedAuthState();
      
      console.log("[AuthProvider] Logout successful, navigating to sign in");
      
      // Navigate to sign in after logout
      router.replace('/signIn');
      
      console.log("[AuthProvider] Logout process completed");
    } catch (error) {
      console.error("[AuthProvider] Logout error:", error);
      // Even if there's an error, ensure we're logged out
      setUser(null);
      await clearPersistedAuthState();
      router.replace('/signIn');
      throw error;
    } finally {
      if (isMounted.current) {
        isLoggingOut.current = false;
        setIsLoading(false);
      }
    }
  };

  const signUp = async (payload: SignUpPayload) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      
      // Update the local state with the new user
      setUser(userCredential.user);
      
      // Wait a moment to ensure the auth state is fully updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("[AuthProvider] Sign up successful");
      return { success: true };
    } catch (error) {
      console.error("[AuthProvider] Sign up error:", error);
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
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setIsLoading,
    signIn,
    logout,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
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
