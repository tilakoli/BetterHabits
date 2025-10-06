import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import { Button } from '@/components';
import showAlert from '@/components/CustomAlert/CustomAlert';
import { BaseForm } from '@/utils/forms/BaseForm';
import { createLoginSchema } from '@/utils/forms/validationSchemas';
import { FormikHelpers } from 'formik';
import InputField from '@/components/InputField/InputField';

interface SignInFormValues {
  email: string;
  password: string;
}

const SignIn = () => {
  const colorScheme = useColorScheme() || 'light';
  const themeColors = Colors[colorScheme as keyof typeof Colors];
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const initialValues: SignInFormValues = {
    email: '',
    password: '',
  };

  const handleLogin = async (values: SignInFormValues, formikHelpers: FormikHelpers<SignInFormValues>) => {
    try {
      const result = await signIn({ email: values.email, password: values.password });

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
        email: 'test@gmail.com',
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
            <Text style={[styles.title, { color: themeColors.text }]}>Better Habits</Text>
            <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
              Sign in to continue your journey
            </Text>
          </View>

          <BaseForm
            initialValues={initialValues}
            validationSchema={createLoginSchema()}
            onSubmit={handleLogin}
          >
            {(formikProps) => (
              <View style={styles.formContainer}>
                <InputField
                  label="Email Address"
                  placeholder="Enter your email"
                  leftIcon={{ name: 'envelope' }}
                  value={formikProps.values.email}
                  onChangeText={formikProps.handleChange('email')}
                  onBlur={formikProps.handleBlur('email')}
                  error={formikProps.errors.email}
                  touched={formikProps.touched.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <InputField
                  label="Password"
                  placeholder="Enter your password"
                  leftIcon={{ name: 'lock' }}
                  secureTextEntry
                  value={formikProps.values.password}
                  onChangeText={formikProps.handleChange('password')}
                  onBlur={formikProps.handleBlur('password')}
                  error={formikProps.errors.password}
                  touched={formikProps.touched.password}
                />

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
                  onPress={() => formikProps.handleSubmit()}
                  loading={isLoading}
                  fullWidth
                  style={[
                    styles.loginButton,
                    { 
                      backgroundColor: themeColors.primary,
                      opacity: (!formikProps.isValid || isLoading) ? 0.7 : 1,
                    }
                  ] as any}
                  textStyle={styles.loginButtonText}
                  disabled={!formikProps.isValid || isLoading}
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
                  style={[
                    styles.socialButton,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: colorScheme === 'dark' ? '#444' : '#E0E0E0',
                    }
                  ] as any}
                  textStyle={[
                    styles.socialButtonText,
                    { color: themeColors.text }
                  ] as any}
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
            )}
          </BaseForm>
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
    justifyContent: 'center',
    minHeight: '100%',
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