import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import {
  Box,
  Button,
  Divider,
  Fade,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Field, Formik } from 'formik';
import type { FormikProps } from 'formik';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { isPasswordValid } from '../models/functions';
import AuthenticationService from '../services/auth-service';
import UserService from '../services/user-service';
import type {
  UpdateUserEmailPayload,
  UpdateUserNamePayload,
  UserData,
} from '../services/user-service';
import DeleteModal from './DeleteModal';

interface Props {
  id?: string;
}

interface SettingsFormValues {
  email: {
    email: string;
    password: string;
  };
  names: {
    firstName: string;
    lastName: string;
  };
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

const SettingsSection = ({
  icon,
  title,
  description,
  danger = false,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  danger?: boolean;
  children: ReactNode;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...theme.surfaces.quiet,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          padding: 2,
          borderBottom: `1px solid ${alpha(theme.palette.gray.main, 0.08)}`,
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              color: danger ? theme.palette.error.dark : theme.palette.primary.dark,
              backgroundColor: alpha(
                danger ? theme.palette.error.main : theme.palette.primary.main,
                0.08,
              ),
            }}
          >
            {icon}
          </Box>
          <Stack sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: theme.palette.gray.main,
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            {description ? (
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.gray.main, 0.72),
                  marginTop: 0.5,
                }}
              >
                {description}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Box>
      <Box
        sx={{
          padding: 2,
          backgroundColor: alpha(theme.palette.gray.main, 0.015),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const Settings = (props: Props) => {
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [user, setUser] = useState<UserData>();
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

  const updateNames = async (values: SettingsFormValues) => {
    if (!values.names.firstName && !values.names.lastName) {
      openSnackBar('Must enter either first name or last name.');
      return;
    }
    const { id } = props;

    try {
      const payload: UpdateUserNamePayload = {
        firstName: values.names.firstName || (user as UserData).firstName,
        lastName: values.names.lastName || (user as UserData).lastName,
        id: id as string,
      };
      await UserService.updateUser(payload);
      openSnackBar('Profile updated successfully.');
      getUserData();
    } catch (err) {
      console.log(err);
    }
  };

  const updateEmail = async (values: SettingsFormValues) => {
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
      const res = await AuthenticationService.getPasswordResetLink(
        (user as UserData).email,
      );
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
        <Box
          sx={{
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: alpha(theme.palette.gray.main, 0.015),
            padding: {
              xs: '24px 16px',
              md: '48px 24px',
            },
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                gap: 2,
                padding: 2,
                marginBottom: 2,
                ...theme.surfaces.quiet,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  color: theme.palette.primary.dark,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <AccountCircleRoundedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Stack sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(theme.palette.gray.main, 0.72),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email}
                </Typography>
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
              onSubmit={() => void 0}
              render={(formik: FormikProps<SettingsFormValues>) => (
                <Stack spacing={2}>
                  <SettingsSection
                    icon={<EmailRoundedIcon fontSize="small" />}
                    title="Update Email"
                    description="Change the email address used to sign in."
                  >
                    <Stack spacing={2}>
                      <Field
                        name="email.email"
                        render={() => (
                          <TextField
                            id="email"
                            name="email.email"
                            type="email"
                            label="New Email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.email?.email &&
                              Boolean(formik.errors.email?.email)
                            }
                            helperText={
                              formik.touched.email?.email &&
                              formik.errors.email?.email
                            }
                          ></TextField>
                        )}
                      />
                      <Field
                        name="email.password"
                        render={() => (
                          <TextField
                            id="password"
                            type="password"
                            name="email.password"
                            label="Password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.email?.password &&
                              Boolean(formik.errors.email?.password)
                            }
                            helperText={
                              formik.touched.email?.password &&
                              formik.errors.email?.password
                            }
                          ></TextField>
                        )}
                      />
                      <Box>
                        <Button
                          color="secondary"
                          onClick={() => updateEmail(formik.values)}
                          variant="contained"
                        >
                          Save
                        </Button>
                      </Box>
                    </Stack>
                  </SettingsSection>
                  <SettingsSection
                    icon={<PersonRoundedIcon fontSize="small" />}
                    title="Update Name"
                    description="Update the name displayed on your account."
                  >
                    <Stack spacing={2}>
                      <Field
                        name="names.firstName"
                        render={() => (
                          <TextField
                            name="names.firstName"
                            label="New First Name"
                            type="text"
                            id="firstName"
                            value={formik.values.names.firstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.names?.firstName &&
                              Boolean(formik.errors.names?.firstName)
                            }
                            helperText={
                              formik.touched.names?.firstName &&
                              formik.errors.names?.firstName
                            }
                          ></TextField>
                        )}
                      />
                      <Field
                        name="names.lastName"
                        render={() => (
                          <TextField
                            name="names.lastName"
                            label="New Last Name"
                            id="lastName"
                            type="text"
                            value={formik.values.names.lastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.names?.lastName &&
                              Boolean(formik.errors.names?.lastName)
                            }
                            helperText={
                              formik.touched.names?.lastName &&
                              formik.errors.names?.lastName
                            }
                          ></TextField>
                        )}
                      />
                      <Box>
                        <Button
                          color="secondary"
                          onClick={() => updateNames(formik.values)}
                          variant="contained"
                        >
                          Save
                        </Button>
                      </Box>
                    </Stack>
                  </SettingsSection>
                  <SettingsSection
                    icon={<SecurityRoundedIcon fontSize="small" />}
                    title="Update Password"
                    description="Send a password reset link to your current email."
                  >
                    <Box>
                      <Button
                        color="secondary"
                        onClick={updatePassword}
                        variant="contained"
                      >
                        Send Email
                      </Button>
                    </Box>
                  </SettingsSection>
                  <SettingsSection
                    icon={<DeleteRoundedIcon fontSize="small" />}
                    title="Danger Zone"
                    description="Permanently delete your account and recipes."
                    danger
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        paddingBottom: 2,
                        color: alpha(theme.palette.gray.main, 0.76),
                      }}
                    >
                      This action cannot be undone.
                    </Typography>
                    <Divider sx={{ marginBottom: 2 }} />
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
                  </SettingsSection>
                </Stack>
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
