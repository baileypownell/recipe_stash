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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import * as yup from 'yup';
import backgroundImage from '../images/ingredients.jpg';
import transparentLogo from '../images/white-text-transparent.svg';
import AuthenticationService from '../services/auth-service';

declare global {
  interface Window {
    google: any;
  }
}

interface FormInputs {
  email: string;
  password: string;
}

interface GoogleCredentialResponse {
  credential: string;
}

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email.')
    .required('Email is required.'),
  password: yup.string().required('Password is required.'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState(false);
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const showNotification = (message: string): void => {
    notifications.show({ message });
  };

  const sendPasswordResetLink = async (email: string): Promise<void> => {
    try {
      const res = await AuthenticationService.getPasswordResetLink(email);
      res.data.success
        ? showNotification(
            'Check the provided email for a link to reset your password.',
          )
        : showNotification('There was an error.');
    } catch (err) {
      console.log(err);
      showNotification('There was an error.');
    }
  };

  const authenticateWithGoogle = async (response: GoogleCredentialResponse) => {
    try {
      const res = await AuthenticationService.signInWithGoogle(
        response.credential,
      );
      if (res.data.success) {
        AuthenticationService.setUserLoggedIn();
        navigate('/recipes');
      } else {
        showNotification(res.data.message);
        setSignInError(true);
      }
    } catch (err: any) {
      console.log(err);
      showNotification(err.data ? err.data.message : 'Could not authenticate.');
      setSignInError(true);
    }
  };

  const signin = async (data: FormInputs) => {
    setLoading(true);
    try {
      const res = await AuthenticationService.signIn(data.password, data.email);
      if (res.data?.success) {
        AuthenticationService.setUserLoggedIn();
        navigate('/recipes');
      } else {
        setLoading(false);
        setSignInError(true);
        showNotification(res.data.message);
      }
    } catch (err: any) {
      console.log(err);
      showNotification(err.response.data?.error || 'There was an error.');
      setSignInError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: `${process.env.GOOGLE_LOGIN_CLIENT_ID}`,
      callback: authenticateWithGoogle,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('google-button-anchor'),
      { theme: 'outline', size: 'large' },
    );
    window.google.accounts.id.prompt();
  }, []);

  return (
    <>
      <Stack
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: `${theme.other.app.gradients.pageOverlay}, url(${backgroundImage})`,
        }}
      >
        <Stack
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.white,
            padding: theme.spacing.md,
          }}
        >
          <Transition mounted={true} transition="fade" duration={400}>
            {(styles) => (
              <Formik
                initialValues={{
                  email: '',
                  password: '',
                }}
                validationSchema={validationSchema}
                validateOnMount
                onSubmit={(values) => signin(values)}
                render={(formik) => (
                  <Form>
                    <Box
                      style={{
                        ...styles,
                        backgroundColor: theme.other.app.palette.gray.main,
                        boxShadow: theme.other.app.shadows.overlay,
                        borderRadius: theme.radius.sm,
                        padding: theme.spacing.md,
                        width: 'min(315px, calc(100vw - 44px))',
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
                            lineHeight: 1.1,
                          }}
                        >
                          Welcome Back
                        </Title>
                        <Text
                          size="sm"
                          style={{ color: theme.other.app.text.inverseMuted }}
                        >
                          Sign in to your recipe box.
                        </Text>
                      </Stack>
                      <Stack gap="sm" pb="md">
                        <TextInput
                          label="Email"
                          variant="filled"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          error={formik.touched.email && formik.errors.email}
                          onBlur={formik.handleBlur}
                          type="email"
                          name="email"
                        />
                        <PasswordInput
                          value={formik.values.password}
                          variant="filled"
                          onChange={formik.handleChange}
                          error={
                            formik.touched.password && formik.errors.password
                          }
                          onBlur={formik.handleBlur}
                          label="Password"
                          name="password"
                        />
                      </Stack>
                      <Stack gap="md">
                        <Button
                          disabled={!formik.isValid}
                          type="submit"
                          loading={loading}
                          variant="filled"
                          fullWidth
                          style={{
                            fontWeight: 800,
                          }}
                        >
                          Login
                        </Button>

                        <Stack
                          style={{
                            marginTop: 8,
                            marginBottom: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <div id="google-button-anchor"></div>
                        </Stack>

                        {signInError ? (
                          <Button
                            variant="filled"
                            onClick={() =>
                              sendPasswordResetLink(formik.values.email)
                            }
                            color="red"
                            disabled={
                              formik.touched.email &&
                              Boolean(formik.errors.email)
                            }
                          >
                            Reset Password
                          </Button>
                        ) : null}
                      </Stack>
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
                        Don't have an account?{' '}
                        <Anchor onClick={() => navigate('/signup')}>
                          Sign up.
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
    </>
  );
};
export default Login;
