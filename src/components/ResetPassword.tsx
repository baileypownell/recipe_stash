import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import * as yup from 'yup';
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
});

const ResetPassword = (props) => {
  const [invalidLink, setInvalidLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [email, setUserEmail] = useState(null);
  const navigate = useNavigate();
  const { token } = useParams();

  const verifyToken = async () => {
    try {
      const res = await AuthenticationService.verifyEmailResetToken(token);
      if (!res.data.success) {
        setInvalidLink(true);
      } else {
        setInvalidLink(false);
        setUserEmail(res.data.user_email);
      }
    } catch (err) {
      setInvalidLink(true);
      console.log(err);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const goHome = (): void => {
    navigate('/');
  };

  const openSnackBar = (message: string): void => {
    setSnackBarOpen(true);
    setSnackBarMessage(message);
  };

  const closeSnackBar = (): void => {
    setSnackBarOpen(false);
    setSnackBarMessage('');
  };

  const updatePassword = async (values) => {
    setLoading(true);
    try {
      await AuthenticationService.updatePassword(values.password, token, email);
      openSnackBar('Password updated! Redirecting...');
      setLoading(false);
      navigate('/recipes');
    } catch (err) {
      openSnackBar('There was an error.');
      setLoading(false);
    }
  };

  return invalidLink ? (
    <>
      <Box
        sx={{
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: '10vh',
        }}
      >
        <Typography marginBottom="15px" textAlign="center" variant="body1">
          The link is invalid or expired.
        </Typography>
        <Button
          variant="contained"
          onClick={goHome}
          color="secondary"
          type="submit"
        >
          Home
        </Button>
      </Box>
    </>
  ) : (
    <>
      <Box
        sx={{
          width: '80%',
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: '10vh',
        }}
      >
        <Formik
          initialValues={{
            password: '',
          }}
          validationSchema={validationSchema}
          validateOnMount
          onSubmit={(values) => updatePassword(values)}
          render={(formik) => (
            <Form>
              <Stack maxWidth="400px" margin="0 auto" spacing={2}>
                <TextField
                  variant="standard"
                  type="password"
                  name="password"
                  required
                  label="New Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                ></TextField>
                <LoadingButton
                  sx={{ margintop: '10px' }}
                  disabled={!formik.isValid}
                  variant="contained"
                  color="secondary"
                  type="submit"
                  loading={loading}
                >
                  Submit
                </LoadingButton>
              </Stack>
            </Form>
          )}
        ></Formik>
      </Box>

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
    </>
  );
};

export default ResetPassword;
