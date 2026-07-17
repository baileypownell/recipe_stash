import {
  Box,
  Button,
  Anchor,
  Divider,
  Stack,
  PasswordInput,
  TextInput,
  Transition,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import * as yup from 'yup';
import backgroundImage from '../images/ingredients.jpg';
import transparentLogo from '../images/white-text-transparent.svg';
import { isPasswordValid } from '../models/functions';
import AuthenticationService from '../services/auth-service';
import UserService, {
} from '../services/user-service';
import type {
  UserCreatedResponse,
  UserInputInterface,
} from '../services/user-service';

interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required.'),
  lastName: yup.string().required('Last name is required.'),
  email: yup
    .string()
    .email('Enter a valid email.')
    .required('Email is required.'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .test(
      'is-valid',
      'Password must contain at least one capital letter, one lower case letter, and one number.',
      (value) => isPasswordValid(value),
    )
    .required('Password is required.'),
  confirmPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .oneOf([yup.ref('password')], "Passwords don't match.")
    .required('Password confirmation is required.'),
});

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const showNotification = (message: string) => {
    notifications.show({ message });
  };

  const signup = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      const userInput: UserInputInterface = {
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        email: values.email,
      };
      const response: UserCreatedResponse = await UserService.createUser(
        userInput,
      );
      if (response.success) {
        AuthenticationService.setUserLoggedIn();
        navigate('/recipes');
      } else {
        setLoading(false);
        showNotification(response.message as string);
      }
    } catch (err: any) {
      setLoading(false);
      showNotification(err.response.data.error);
    }
  };

  const login = (): void => {
    void navigate('/login');
  };

  return (
    <Stack
      style={{
        minHeight: 'calc(100vh - 56px)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <Stack
        style={{
          minHeight: 'calc(100vh - 56px)',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          background: theme.other.app.gradients.pageOverlay,
        }}
      >
        <Transition mounted={true} transition="fade" duration={400}>
          {(styles) => (
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => signup(values)}
            validateOnMount
            render={(formik) => (
              <Form>
                <Box
                  style={{
                    ...styles,
                    backgroundColor: theme.other.app.palette.gray.main,
                    boxShadow: theme.other.app.shadows.overlay,
                    borderRadius: theme.radius.sm,
                    padding: '38px 40px 34px',
                    width: 'min(329px, calc(100vw - 44px))',
                  }}
                >
                  <Stack gap={10} style={{ marginBottom: 18 }}>
                    <Box
                      component="img"
                      src={transparentLogo}
                      alt="recipe stash"
                      style={{
                        width: 168,
                        maxWidth: '82%',
                        display: 'block',
                        marginBottom: theme.spacing.sm,
                      }}
                    />
                    <Title
                      order={4}
                      style={{
                        color: theme.white,
                      }}
                    >
                      Create Account
                    </Title>
                    <Text
                      size="sm"
                      style={{ color: theme.other.app.text.inverseMuted }}
                    >
                      Start your recipe box.
                    </Text>
                  </Stack>
                  <Stack
                    gap="sm"
                    pb="md"
                  >
                    <TextInput
                      name="firstName"
                      type="text"
                      variant="filled"
                      label="First Name"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.firstName && formik.errors.firstName
                      }
                    />
                    <TextInput
                      name="lastName"
                      type="text"
                      variant="filled"
                      label="Last Name"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.lastName && formik.errors.lastName
                      }
                    />
                    <TextInput
                      name="email"
                      type="email"
                      variant="filled"
                      label="Email"
                      value={formik.values.email}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      error={formik.touched.email && formik.errors.email}
                    />
                    <PasswordInput
                      name="password"
                      variant="filled"
                      label="Password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.password && formik.errors.password
                      }
                    />
                    <PasswordInput
                      name="confirmPassword"
                      variant="filled"
                      label="Confirm Password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                      }
                    />
                  </Stack>
                  <Button
                    disabled={!formik.isValid}
                    type="submit"
                    loading={loading}
                    variant="filled"
                    fullWidth
                    style={{
                      marginTop: 2,
                      fontWeight: 800,
                    }}
                  >
                    Create Account
                  </Button>

                  <Divider
                    style={{
                      marginTop: 28,
                      marginBottom: 22,
                    }}
                  />
                  <Text
                    size="sm"
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    Already have an account?{' '}
                    <Anchor onClick={login}>
                      Log in.
                    </Anchor>
                  </Text>
                </Box>
              </Form>
            )}
          ></Formik>
          )}
        </Transition>
      </Stack>
    </Stack>
  );
};

export default Signup;
