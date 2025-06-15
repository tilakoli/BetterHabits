import React from 'react';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { View } from '../components/Themed';

// Generic type for form values
export interface FormValues {
  [key: string]: any;
}

// Props interface for the BaseForm component
interface BaseFormProps<T extends FormValues> {
  initialValues: T;
  validationSchema: Yup.ObjectSchema<T>;
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void | Promise<void>;
  children: (props: FormikProps<T>) => React.ReactNode;
}

export function BaseForm<T extends FormValues>({
  initialValues,
  validationSchema,
  onSubmit,
  children,
}: BaseFormProps<T>) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formikProps) => (
        <View>
          {children(formikProps)}
        </View>
      )}
    </Formik>
  );
}

// Example validation schema helper
export const createValidationSchema = <T extends FormValues>(
  schema: Yup.ObjectSchema<T>
) => schema; 