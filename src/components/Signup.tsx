import { LoadingButton } from '@mui/lab';
import {
  Box,
  Fade,
  Link,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import * as yup from 'yup';
import backgroundImage from '../images/ingredients.jpg';
import { isPasswordValid } from '../models/functions';
import AuthenticationService from '../services/auth-service';
import UserService, {
  UserCreatedResponse,
  UserInputInterface,
} from '../services/user-service';

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
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const openSnackBar = (message: string) => {
    setSnackBarMessage(message);
    setSnackBarOpen(true);
  };

  const signup = async (values) => {
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
        openSnackBar(response.message as string);
      }
    } catch (err: any) {
      setLoading(false);
      openSnackBar(err.response.data.error);
    }
  };

  const closeSnackBar = (): void => {
    setSnackBarMessage('');
    setSnackBarOpen(false);
  };

  const login = (): void => navigate('/login');

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        label: {
          color: theme.palette.primary.main,
        },
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        sx={{
          height: '100%',
          background:
            'linear-gradient(120deg, rgba(255, 68, 68, 0.826), rgba(221, 114, 68, 0.22))',
          width: '100%',
          color: 'white',
        }}
      >
        <Fade>
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
                  padding="40px"
                  borderRadius={1}
                  sx={{
                    backgroundColor: theme.palette.gray.main,
                    boxShadow: `0px 10px 30px ${theme.palette.gray.main}`,
                  }}
                >
                  <Typography variant="h4">Signup</Typography>
                  <Stack paddingTop={2} spacing={2} paddingBottom={2}>
                    <TextField
                      name="firstName"
                      type="text"
                      variant="filled"
                      label="First Name"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.firstName &&
                        Boolean(formik.errors.firstName)
                      }
                      helperText={
                        formik.touched.firstName && formik.errors.firstName
                      }
                    />
                    <TextField
                      name="lastName"
                      type="text"
                      variant="filled"
                      label="Last Name"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.lastName &&
                        Boolean(formik.errors.lastName)
                      }
                      helperText={
                        formik.touched.lastName && formik.errors.lastName
                      }
                    />
                    <TextField
                      name="email"
                      type="email"
                      variant="filled"
                      label="Email"
                      value={formik.values.email}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                      name="password"
                      type="password"
                      variant="filled"
                      label="Password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.password &&
                        Boolean(formik.errors.password)
                      }
                      helperText={
                        formik.touched.password && formik.errors.password
                      }
                    />
                    <TextField
                      name="confirmPassword"
                      type="password"
                      variant="filled"
                      label="Confirm Password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.confirmPassword &&
                        Boolean(formik.errors.confirmPassword)
                      }
                      helperText={
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                      }
                    />
                  </Stack>
                  <LoadingButton
                    disabled={!formik.isValid}
                    type="submit"
                    loading={loading}
                    variant="contained"
                  >
                    Create Account
                  </LoadingButton>

                  <Typography variant="body1" marginTop={3}>
                    Already have an account?{' '}
                    <Link style={{ cursor: 'pointer' }} onClick={login}>
                      Log in.
                    </Link>
                  </Typography>
                </Box>
              </Form>
            )}
          ></Formik>
        </Fade>
      </Stack>

      <Snackbar
        open={snackBarOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={closeSnackBar}
        autoHideDuration={4000}
        message={snackBarMessage}
        key={'bottom' + 'center'}
      />
    </Stack>
  );
};

export default Signup;
