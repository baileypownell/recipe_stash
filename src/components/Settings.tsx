import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Fade,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Field, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { isPasswordValid } from '../models/functions';
import AuthenticationService from '../services/auth-service';
import UserService, {
  UpdateUserEmailPayload,
  UpdateUserNamePayload,
  UserData,
} from '../services/user-service';
import DeleteModal from './DeleteModal';

interface Props {
  id?: string;
}

const validationSchema = yup.object({
  email: yup.object({
    email: yup
      .string()
      .required('Email is required.')
      .email('Enter a valid email.'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .test(
        'is-valid',
        'Password must contain at least one capital letter, one lower case letter, and one number.',
        (value) => isPasswordValid(value),
      )
      .required('Password is required.'),
  }),
  names: yup.object({
    firstName: yup.string(),
    lastName: yup.string(),
  }),
});

const Settings = (props: Props) => {
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const openSnackBar = (message: string): void => {
    setSnackBarOpen(true);
    setSnackBarMessage(message);
  };

  const getUserData = async () => {
    try {
      const user: UserData = await UserService.getUser();
      setUser(user);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = async () => {
    try {
      await AuthenticationService.logout();
      AuthenticationService.setUserLoggedOut();
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const updateNames = async (values) => {
    if (!values.names.firstName && !values.names.lastName) {
      openSnackBar('Must enter either first name or last name.');
      return;
    }
    const { id } = props;

    try {
      const payload: UpdateUserNamePayload = {
        firstName: values.names.firstName || user.firstName,
        lastName: values.names.lastName || user.lastName,
        id,
      };
      await UserService.updateUser(payload);
      openSnackBar('Profile updated successfully.');
      getUserData();
    } catch (err) {
      console.log(err);
    }
  };

  const updateEmail = async (values) => {
    try {
      const payload: UpdateUserEmailPayload = {
        newEmail: values.email.email,
        password: values.email.password,
      };
      const res = await UserService.updateUser(payload);
      if (res.data.success) {
        openSnackBar(res.data.message);
        getUserData();
      } else {
        openSnackBar('Invalid email.');
      }
    } catch (err) {
      console.log(err);
      openSnackBar('There was an error.');
    }
  };

  const deleteAccount = async () => {
    try {
      await UserService.deleteUser();
      openSnackBar('Account deleted.');
      logout();
    } catch (err) {
      console.log(err);
      openSnackBar('There was an error.');
    }
  };

  const updatePassword = async () => {
    try {
      const res = await AuthenticationService.getPasswordResetLink(user.email);
      setSnackBarOpen(res.data.message);
      if (res.data.success) {
        logout();
      }
    } catch (err) {
      console.log(err);
      openSnackBar('There was an error.');
    }
  };

  const openDeleteModal = (): void => {
    setDeleteModalOpen(true);
  };

  const closeSnackBar = (): void => {
    setSnackBarOpen(false);
    setSnackBarMessage('');
  };

  if (!user) {
    return null;
  }

  return (
    <Fade>
      <>
        <Box>
          <Box
            width="90%"
            sx={{
              [theme.breakpoints.up('md')]: {
                width: '50%',
              },
              [theme.breakpoints.up('lg')]: {
                width: '35%',
              },
            }}
            margin={`0 auto`}
            padding="4vh 0"
          >
            <Stack direction="row" paddingBottom="10px">
              <AccountCircleRoundedIcon
                sx={{
                  fontSize: '60px',
                  paddingRight: '15px',
                }}
              />
              <Stack>
                <Typography variant="h6">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2">{user?.email}</Typography>
              </Stack>
            </Stack>
            <Formik
              initialValues={{
                email: {
                  email: '',
                  password: '',
                },
                names: {
                  firstName: user?.firstName,
                  lastName: user?.lastName,
                },
              }}
              validationSchema={validationSchema}
              onSubmit={null}
              render={(formik) => (
                <>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center">
                        <EmailRoundedIcon />
                        <Typography marginLeft={1}>Update Email</Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack marginBottom={2} spacing={2}>
                        <Field
                          name="email.email"
                          render={({ field, form }) => (
                            <TextField
                              id="email"
                              variant="standard"
                              name="email.email"
                              type="email"
                              label="New Email"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                form.touched.email?.email &&
                                Boolean(form.errors.email?.email)
                              }
                              helperText={
                                form.touched.email?.email &&
                                form.errors.email?.email
                              }
                            ></TextField>
                          )}
                        />
                        <Field
                          name="email.password"
                          render={({ field, form }) => (
                            <TextField
                              id="password"
                              variant="standard"
                              type="password"
                              name="email.password"
                              label="Password"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                form.touched.email?.password &&
                                Boolean(form.errors.email?.password)
                              }
                              helperText={
                                form.touched.email?.password &&
                                form.errors.email?.password
                              }
                            ></TextField>
                          )}
                        />
                      </Stack>
                      <Button
                        color="secondary"
                        onClick={() => updateEmail(formik.values)}
                        variant="contained"
                      >
                        Save
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center">
                        <PersonRoundedIcon />
                        <Typography marginLeft={1}>Update Name</Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack marginBottom={2} spacing={2}>
                        <Field
                          name="names.firstName"
                          render={({ field, form }) => (
                            <TextField
                              variant="standard"
                              name="names.firstName"
                              label="New First Name"
                              type="text"
                              id="firstName"
                              value={formik.values.names.firstName}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                form.touched.names?.firstName &&
                                Boolean(form.errors.names?.firstName)
                              }
                              helperText={
                                form.touched.names?.firstName &&
                                form.errors.names?.firstName
                              }
                            ></TextField>
                          )}
                        />
                        <Field
                          name="names.lastName"
                          render={({ field, form }) => (
                            <TextField
                              variant="standard"
                              name="names.lastName"
                              label="New Last Name"
                              id="lastName"
                              type="text"
                              value={formik.values.names.lastName}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                form.touched.names?.lastName &&
                                Boolean(form.errors.names?.lastName)
                              }
                              helperText={
                                form.touched.names?.lastName &&
                                form.errors.names?.lastName
                              }
                            ></TextField>
                          )}
                        />
                      </Stack>
                      <Button
                        color="secondary"
                        onClick={() => updateNames(formik.values)}
                        variant="contained"
                      >
                        Save
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center">
                        <SecurityRoundedIcon />
                        <Typography marginLeft={1}>Update Password</Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1" paddingBottom={1}>
                        Click the button below to receive an email with a link
                        to reset your password.
                      </Typography>
                      <Box>
                        <Button
                          color="secondary"
                          onClick={updatePassword}
                          variant="contained"
                        >
                          Send Email
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center">
                        <DeleteRoundedIcon />
                        <Typography marginLeft={1}>Delete Account</Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1" paddingBottom={1}>
                        If you are sure you want to delete your account, click
                        the button below. This action
                        <span
                          style={{
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            marginLeft: '2px',
                          }}
                        >
                          cannot
                        </span>{' '}
                        be undone.
                      </Typography>
                      <Box>
                        <Button
                          color="primary"
                          onClick={openDeleteModal}
                          variant="contained"
                          startIcon={<DeleteRoundedIcon />}
                        >
                          Delete Account
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </>
              )}
            ></Formik>
          </Box>
        </Box>

        <Snackbar
          open={snackBarOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          onClose={closeSnackBar}
          autoHideDuration={3000}
          message={snackBarMessage}
          key={'bottom' + 'center'}
        />

        <DeleteModal
          isOpen={deleteModalOpen}
          deleteFunction={deleteAccount}
          closeModal={() => setDeleteModalOpen(false)}
        />
      </>
    </Fade>
  );
};

export default Settings;
