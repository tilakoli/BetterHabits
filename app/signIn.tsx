import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import { showAlert } from '@/components/CustomAlert';

export default function SignIn() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { signIn, isLoading, setIsLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDevLoading, setIsDevLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        title: 'Error',
        message: 'Please fill in all fields',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await signIn({ email, password });

      if (result.success) {
        console.log("[SignIn] Login successful, waiting for auth state update");
        // The auth state will be updated by the auth provider
        // and the navigation will be handled by RootLayoutNav
      } else {
        showAlert({
          title: 'Error',
          message: result.error || 'Failed to log in',
          type: 'error'
        });
      }
    } catch (error) {
      console.error("[SignIn] Login error:", error);
      showAlert({
        title: 'Error',
        message: 'An unexpected error occurred',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async () => {
    try {
      setIsDevLoading(true);
      const result = await signIn({
        email: 'tilak@gmail.com',
        password: 'pass1234!'
      });

      if (!result.success) {
        showAlert({
          title: 'Error',
          message: result.error || 'Failed to sign in',
          type: 'error'
        });
      }
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'An unexpected error occurred',
        type: 'error'
      });
    } finally {
      setIsDevLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push('/signUp');
  };

  const navigateToForgotPassword = () => {
    showAlert({
      title: 'Coming Soon',
      message: 'Password reset functionality will be available soon.',
      type: 'info'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
       
          <View style={styles.formContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
              Sign in to continue your journey
            </Text>
          </View>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <FontAwesome 
                name="envelope" 
                size={18} 
                color={colorScheme === 'dark' ? '#A0A0A0' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email Address"
                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <FontAwesome 
                name="lock" 
                size={18} 
                color={colorScheme === 'dark' ? '#A0A0A0' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <FontAwesome 
                  name={showPassword ? 'eye-slash' : 'eye'} 
                  size={18} 
                  color={colorScheme === 'dark' ? '#A0A0A0' : '#666'} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={navigateToForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                { 
                  backgroundColor: colors.primary,
                  opacity: (!email || !password || isLoading) ? 0.7 : 1,
                }
              ]}
              onPress={handleLogin}
              disabled={!email || !password || isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#333' : '#E0E0E0' }]} />
              <Text style={[styles.dividerText, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#333' : '#E0E0E0' }]} />
            </View>

            <TouchableOpacity
              style={[styles.devButton, { backgroundColor: colors.primary }]}
              onPress={handleDevLogin}
              disabled={isLoading || isDevLoading}
            >
              <Text style={styles.devButtonText}>
                {isDevLoading ? 'Signing in...' : 'Use Test Account'}
              </Text>
            </TouchableOpacity>

            
            <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={[styles.socialButton, {
                    backgroundColor: colors.card,
                    borderColor: colorScheme === 'dark' ? '#444' : '#E0E0E0',
                    borderWidth: 1,
                  }]}
                >
                  <FontAwesome name="google" size={18} color="#DB4437" />
                  <Text style={[styles.socialButtonText, { color: colors.text, marginLeft: 8 }]}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialButton, {
                    backgroundColor: colors.card,
                    borderColor: colorScheme === 'dark' ? '#444' : '#E0E0E0',
                    borderWidth: 1,
                    marginTop: 12,
                  }]}
                >
                  <FontAwesome
                    name="apple"
                    size={18}
                    color={colorScheme === 'dark' ? '#FFF' : '#000'}
                  />
                  <Text style={[styles.socialButtonText, { color: colors.text, marginLeft: 8 }]}>
                    Continue with Apple
                  </Text>
                </TouchableOpacity>

              </View>
            <View>
            <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
              Don't have an account?{' '}
              <Text 
                style={[styles.signUpText, { color: colors.primary }]}
                onPress={navigateToSignUp}
              >
                Sign Up
              </Text>
            </Text>
          </View>
          </View>

        
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    flex: 1,
    height: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 12,
  },
  devButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  devButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  socialButtonsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  loginText: {
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  signUpText: {
    fontWeight: '600',
  },
});