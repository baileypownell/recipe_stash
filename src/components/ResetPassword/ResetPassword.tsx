import { Button, TextField, Snackbar } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import ClipLoader from 'react-spinners/ClipLoader';
import * as yup from 'yup';
import { isPasswordValid } from '../../models/functions';
import AuthenticationService from '../../services/auth-service';
import './ResetPassword.scss';

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

  const verifyToken = async () => {
    const token = props.match.params.token;
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
      const reset_password_token = props.match.params.token;
      await AuthenticationService.updatePassword(
        values.password,
        reset_password_token,
        email,
      );
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
      <div className="invalid-link">
        <h3>The link is invalid or expired.</h3>
        <Button
          variant="contained"
          onClick={goHome}
          color="secondary"
          type="submit"
        >
          Home
        </Button>
      </div>
    </>
  ) : (
    <>
      <div className="resetPassword">
        <Formik
          initialValues={{
            password: '',
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => updatePassword(values)}
          render={(formik) => (
            <Form>
              <TextField
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
              <Button
                disabled={!formik.isValid}
                variant="contained"
                color="secondary"
                type="submit"
              >
                {loading ? (
                  <ClipLoader
                    css={'border-color: white;'}
                    size={30}
                    color={'#689943'}
                    loading={loading}
                  />
                ) : (
                  'Submit'
                )}
              </Button>
            </Form>
          )}
        ></Formik>
      </div>

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
