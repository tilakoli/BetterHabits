import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import { Button } from '@/components';
import showAlert from '@/components/CustomAlert/CustomAlert';
import { BaseForm } from '@/utils/forms/BaseForm';
import { createRegistrationSchema } from '@/utils/forms/validationSchemas';
import { FormikHelpers } from 'formik';
import InputField from '@/components/InputField/InputField';

interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp = () => {
  const colorScheme = useColorScheme() || 'light';
  const themeColors = Colors[colorScheme as keyof typeof Colors];
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const initialValues: SignUpFormValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const handleSignUp = async (values: SignUpFormValues, formikHelpers: FormikHelpers<SignUpFormValues>) => {
    if (!termsAccepted) {
      showAlert({
        title: 'Error',
        message: 'Please accept the terms and conditions',
        type: 'error'
      });
      return;
    }

    try {
      const result = await signUp({ 
        email: values.email, 
        password: values.password, 
        userName: values.name 
      });

      if (!result.success) {
        showAlert({
          title: 'Error',
          message: result.error || 'Failed to sign up',
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

  const navigateToSignIn = () => {
    router.push('/signIn');
  };

  const toggleTermsAccepted = () => {
    setTermsAccepted(!termsAccepted);
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
            <Text style={[styles.title, { color: themeColors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
              Sign up to get started
            </Text>
          </View>

          <BaseForm
            initialValues={initialValues}
            validationSchema={createRegistrationSchema()}
            onSubmit={handleSignUp}
          >
            {(formikProps) => (
              <View style={styles.formContainer}>
                <InputField
                  label="Full Name"
                  placeholder="Enter your full name"
                  leftIcon={{ name: 'user' }}
                  value={formikProps.values.name}
                  onChangeText={formikProps.handleChange('name')}
                  onBlur={formikProps.handleBlur('name')}
                  error={formikProps.errors.name}
                  touched={formikProps.touched.name}
                  autoCapitalize="words"
                />

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
                  autoCorrect={false}
                />

                <InputField
                  label="Password"
                  placeholder="Create a password"
                  leftIcon={{ name: 'lock' }}
                  secureTextEntry
                  value={formikProps.values.password}
                  onChangeText={formikProps.handleChange('password')}
                  onBlur={formikProps.handleBlur('password')}
                  error={formikProps.errors.password}
                  touched={formikProps.touched.password}
                />

                <InputField
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  leftIcon={{ name: 'lock' }}
                  secureTextEntry
                  value={formikProps.values.confirmPassword}
                  onChangeText={formikProps.handleChange('confirmPassword')}
                  onBlur={formikProps.handleBlur('confirmPassword')}
                  error={formikProps.errors.confirmPassword}
                  touched={formikProps.touched.confirmPassword}
                  onSubmitEditing={() => formikProps.handleSubmit()}
                />

                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    onPress={toggleTermsAccepted}
                    style={[
                      styles.checkbox,
                      termsAccepted && styles.checkboxChecked,
                      { borderColor: colorScheme === 'dark' ? '#555' : '#999' }
                    ]}
                  >
                    {termsAccepted && (
                      <FontAwesome name="check" size={12} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <Text style={[styles.termsText, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
                    I agree to the{' '}
                    <Text style={[styles.termsLink, { color: themeColors.primary }]} onPress={() => {
                      showAlert({
                        title: 'Terms of Service',
                        message: 'Our terms of service will be available soon.',
                        type: 'info'
                      });
                    }}>Terms of Service</Text> and{' '}
                    <Text style={[styles.termsLink, { color: themeColors.primary }]} onPress={() => {
                      showAlert({
                        title: 'Privacy Policy',
                        message: 'Our privacy policy will be available soon.',
                        type: 'info'
                      });
                    }}>Privacy Policy</Text>
                  </Text>
                </View>

                <Button
                  title="Create Account"
                  onPress={() => formikProps.handleSubmit()}
                  loading={isLoading}
                  fullWidth
                  style={[
                    styles.signUpButton,
                    { 
                      backgroundColor: themeColors.primary,
                      opacity: (formikProps.isValid && termsAccepted) ? 1 : 0.7,
                    }
                  ] as any}
                  textStyle={styles.signUpButtonText}
                  disabled={!formikProps.isValid || !termsAccepted || isLoading}
                />

                <View style={styles.footerContainer}>
                  <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
                    Already have an account?{' '}
                    <Text 
                      style={[styles.signInText, { color: themeColors.primary }]}
                      onPress={navigateToSignIn}
                    >
                      Sign In
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
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  signUpButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  signInText: {
    fontWeight: '600',
  },
});

export default SignUp;