import {
  Box,
  Button,
  Loader,
  Stack,
  PasswordInput,
  Text,
  Title,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import * as yup from 'yup';
import backgroundImage from '../images/ingredients.jpg';
import transparentLogo from '../images/white-text-transparent.svg';
import { isPasswordValid } from '../models/functions';
import AuthenticationService from '../services/auth-service';

const validationSchema = yup.object({
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
    .oneOf([yup.ref('password')], "Passwords don't match.")
    .required('Password confirmation is required.'),
});

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [invalidLink, setInvalidLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setUserEmail] = useState('');
  const navigate = useNavigate();
  const { token } = useParams();
  const theme = useMantineTheme();

  const verifyToken = async () => {
    if (!token) {
      setInvalidLink(true);
      setVerifyingToken(false);
      return;
    }

    try {
      const res = await AuthenticationService.verifyEmailResetToken(
        token,
      );
      if (!res.data.success) {
        setInvalidLink(true);
      } else {
        setInvalidLink(false);
        setUserEmail(res.data.user_email);
      }
    } catch (err) {
      setInvalidLink(true);
      console.log(err);
    } finally {
      setVerifyingToken(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, [token]);

  const goHome = (): void => {
    navigate('/');
  };

  const goLogin = (): void => {
    navigate('/login');
  };

  const showNotification = (message: string, color?: string): void => {
    notifications.show({ message, color });
  };

  const updatePassword = async (values: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      await AuthenticationService.updatePassword(
        values.password,
        token as string,
        email,
      );
      showNotification('Password updated.', 'green');
      setLoading(false);
      navigate('/recipes');
    } catch (err) {
      showNotification('There was an error.', 'red');
      setLoading(false);
    }
  };

  const title = invalidLink ? 'Link Expired' : 'Reset Password';
  const description = invalidLink
    ? 'Request a new reset link to regain access to your recipe box.'
    : 'Choose a new password for your recipe box.';

  return (
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
        <Transition mounted transition="fade" duration={400}>
          {(styles) => (
            <Box
              style={{
                ...styles,
                backgroundColor: theme.other.app.palette.gray.main,
                boxShadow: theme.other.app.shadows.overlay,
                borderRadius: theme.radius.sm,
                padding: theme.spacing.md,
                width: 'min(360px, calc(100vw - 44px))',
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
                <Title order={4} style={{ color: theme.white, lineHeight: 1.1 }}>
                  {title}
                </Title>
                <Text
                  size="sm"
                  style={{ color: theme.other.app.text.inverseMuted }}
                >
                  {description}
                </Text>
              </Stack>

              {verifyingToken ? (
                <Stack gap="md" style={{ alignItems: 'center', padding: 18 }}>
                  <Loader color="orange" />
                  <Text
                    size="sm"
                    style={{
                      color: theme.other.app.text.inverseMuted,
                      textAlign: 'center',
                    }}
                  >
                    Checking your reset link.
                  </Text>
                </Stack>
              ) : invalidLink ? (
                <Stack gap="md">
                  <Text
                    size="sm"
                    style={{ color: theme.other.app.text.inverseMuted }}
                  >
                    This password reset link is invalid or has expired.
                  </Text>
                  <Button variant="filled" onClick={goHome} fullWidth>
                    Go Home
                  </Button>
                  <Button variant="subtle" onClick={goLogin} fullWidth>
                    Back to Login
                  </Button>
                </Stack>
              ) : (
                <Formik
                  initialValues={{
                    password: '',
                    confirmPassword: '',
                  }}
                  validationSchema={validationSchema}
                  validateOnMount
                  onSubmit={(values) => updatePassword(values)}
                  render={(formik) => (
                    <Form>
                      <Stack gap="md">
                        <PasswordInput
                          name="password"
                          required
                          variant="filled"
                          label="New Password"
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.password && formik.errors.password
                          }
                        />
                        <PasswordInput
                          name="confirmPassword"
                          required
                          variant="filled"
                          label="Confirm New Password"
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.confirmPassword &&
                            formik.errors.confirmPassword
                          }
                        />
                        <Text
                          size="xs"
                          style={{ color: theme.other.app.text.inverseMuted }}
                        >
                          Use at least 8 characters with uppercase, lowercase,
                          and a number.
                        </Text>
                        <Button
                          disabled={!formik.isValid}
                          variant="filled"
                          type="submit"
                          loading={loading}
                          fullWidth
                          style={{ fontWeight: 800 }}
                        >
                          Update Password
                        </Button>
                      </Stack>
                    </Form>
                  )}
                ></Formik>
              )}
            </Box>
          )}
        </Transition>
      </Stack>
    </Stack>
  );
};

export default ResetPassword;
