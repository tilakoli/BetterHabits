import React, { useState } from 'react';
import { StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import { showAlert } from '@/components/CustomAlert';
import Button from '@/components/Button';

const SignIn = () => {
  const colorScheme = useColorScheme() || 'light';
  const themeColors = Colors[colorScheme as keyof typeof Colors];
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      const result = await signIn({ email, password });

      if (!result.success) {
        showAlert({
          title: 'Error',
          message: result.error || 'Failed to log in',
          type: 'error'
        });
      }
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'An unexpected error occurred',
        type: 'error'
      });
    }
  };

  const handleDevLogin = async () => {
    try {
      const result = await signIn({
        email: 'tilak@gmail.com',
        password: 'pass1234!'
      });

      if (!result.success) {
        showAlert({
          title: 'Error',
          message: result.error || 'Failed to log in with test account',
          type: 'error'
        });
      }
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'An unexpected error occurred',
        type: 'error'
      });
    }
  };

  const navigateToForgotPassword = () => {
    showAlert({
      title: 'Coming Soon',
      message: 'Password reset functionality will be available soon.',
      type: 'info'
    });
  };

  const navigateToSignUp = () => {
    router.push('/signUp');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
              Sign in to continue your journey
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <FontAwesome 
                name="envelope" 
                size={18} 
                color={colorScheme === 'dark' ? '#A0A0A0' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Email Address"
                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <FontAwesome 
                name="lock" 
                size={18} 
                color={colorScheme === 'dark' ? '#A0A0A0' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
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
              <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={[styles.loginButton, { 
                backgroundColor: themeColors.primary,
                opacity: (!email || !password || isLoading) ? 0.7 : 1,
              }]}
              textStyle={styles.loginButtonText}
              disabled={!email || !password || isLoading}
            />

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#333' : '#E0E0E0' }]} />
              <Text style={[styles.dividerText, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#333' : '#E0E0E0' }]} />
            </View>

            <Button
              title="Use Test Account"
              onPress={handleDevLogin}
              variant="outline"
              style={[styles.socialButton, {
                backgroundColor: themeColors.card,
                borderColor: colorScheme === 'dark' ? '#444' : '#E0E0E0',
              }]}
              textStyle={[styles.socialButtonText, { color: themeColors.text }]}
              leftIcon={
                <FontAwesome 
                  name="user" 
                  size={18} 
                  color={themeColors.primary} 
                  style={{ marginRight: 8 }} 
                />
              }
            />

            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
                Don't have an account?{' '}
                <Text 
                  style={[styles.signUpText, { color: themeColors.primary }]}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
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
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
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
    marginBottom: 16,
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
    marginHorizontal: 12,
  },
  socialButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: 24,
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

export default SignIn;