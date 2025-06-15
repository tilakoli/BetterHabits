import React, { useRef, useState } from "react";
import { LoginPayload, SignUpPayload } from "./types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  AuthError,
  signOut,
} from "firebase/auth";
import { auth, clearPersistedAuthState, usersRef } from '@/firebaseConfig'
import { useRouter } from "expo-router";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userData: any;
  fetchUserData: () => Promise<void>;
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
  const [userData, setUserData] = useState<any>(null);
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

  const fetchUserData = async () => {
    if (!user) {
      console.log("[Auth] No user logged in, skipping user data fetch");
      return;
    }
  
    try {
      console.log(`[Auth] Fetching user data for UID: ${user.uid}`);
      const userDoc = await getDoc(doc(usersRef, user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
      } else {
        console.log(`[Auth] No user data found for UID: ${user.uid}`);
        setUserData(null);
      }
    } catch (error) {
      console.error("[Auth] Error fetching user data:", error);
    }
  };
  // Handle auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted.current) return;

      if (isLoggingOut.current) {
        return;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user data when user is logged in
        const userDoc = await getDoc(doc(usersRef, firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUser(null);
        setUserData(null);
        if (authChecked.current) {
          await clearPersistedAuthState();
        }
      }

      authChecked.current = true;
      if (isMounted.current) {
        setIsLoading(false);
      }
    });

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        payload.email,
        payload.password
      );
      try {
        console.log("[Auth] Creating user document with UID:", userCredential.user.uid);
        await setDoc(doc(usersRef, userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: payload.email,
          username: payload.userName,
          createdAt: new Date().toISOString(),
        });
      } catch (firestoreError) {
        console.error("[Auth] Error saving user data to Firestore:", firestoreError);
        // If Firestore save fails, delete the auth user to keep data consistent
        await userCredential.user.delete();
        throw new Error("Failed to save user data. Please try again.");
      }
      setUser(userCredential.user);
      await fetchUserData();
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true };
    } catch (error) {
      let errorMessage = 'An error occurred during signup';

      if (error instanceof Error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already registered';
        } else if (authError.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters';
        } else if (authError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else {
          errorMessage = error.message || errorMessage;
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
    userData,
    fetchUserData,
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
