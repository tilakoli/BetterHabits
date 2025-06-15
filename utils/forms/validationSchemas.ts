import * as Yup from 'yup';

export const emailSchema = Yup.string()
  .email('Invalid email address')
  .required('Email is required');

export const passwordSchema = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .required('Password is required');

export const nameSchema = Yup.string()
  .min(2, 'Name must be at least 2 characters')
  .required('Name is required');

export const createLoginSchema = () =>
  Yup.object().shape({
    email: emailSchema,
    password: passwordSchema,
  });

export const createRegistrationSchema = () =>
  Yup.object().shape({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  }); 