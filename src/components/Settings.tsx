import { AccountCircleRoundedIcon } from '@icons';
import { DeleteRoundedIcon } from '@icons';
import { EmailRoundedIcon } from '@icons';
import { PersonRoundedIcon } from '@icons';
import { SecurityRoundedIcon } from '@icons';
import {
  Box,
  Button,
  Divider,
  Stack,
  PasswordInput,
  TextInput,
  Transition,
  Text,
  Title,
  Group,
  Skeleton,
  useMantineTheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
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
  const theme = useMantineTheme();
  const mantineTheme = useMantineTheme();

  return (
    <Box
      style={{
        ...theme.other.app.surfaces.quiet,
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          padding: mantineTheme.spacing.md,
          borderBottom: `1px solid ${theme.other.app.borders.faint}`,
        }}
      >
        <Group align="flex-start" gap="md">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              display: 'grid',
              placeItems: 'center',
              color: danger
                ? theme.other.app.palette.error.dark
                : theme.other.app.palette.info.contrastText,
              backgroundColor: danger
                ? 'rgba(221, 114, 68, 0.08)'
                : theme.other.app.surfaces.primaryTint.backgroundColor,
              flex: '0 0 auto',
            }}
          >
            {icon}
          </Box>
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text
              fw={800}
              style={{ color: theme.other.app.palette.info.contrastText }}
            >
              {title}
            </Text>
            {description ? (
              <Text
                size="sm"
                style={{
                  marginTop: 4,
                }}
              >
                {description}
              </Text>
            ) : null}
          </Stack>
        </Group>
      </Box>
      <Box
        style={{
          padding: mantineTheme.spacing.md,
          ...theme.other.app.surfaces.inset,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const SettingsSkeletonSection = ({ lines = 2 }: { lines?: number }) => {
  const theme = useMantineTheme();
  const mantineTheme = useMantineTheme();

  return (
    <Box
      style={{
        ...theme.other.app.surfaces.quiet,
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          padding: mantineTheme.spacing.md,
          borderBottom: `1px solid ${theme.other.app.borders.faint}`,
        }}
      >
        <Group align="flex-start" gap="md">
          <Skeleton width={32} height={32} radius={4} />
          <Stack gap={8} style={{ minWidth: 0, flex: 1 }}>
            <Skeleton width={140} height={18} />
            <Skeleton width="62%" height={14} />
          </Stack>
        </Group>
      </Box>
      <Box
        style={{
          padding: mantineTheme.spacing.md,
          ...theme.other.app.surfaces.inset,
        }}
      >
        <Stack gap="md" style={{ maxWidth: 520 }}>
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton key={index} height={36} radius={4} />
          ))}
          <Skeleton width={88} height={36} radius={4} />
        </Stack>
      </Box>
    </Box>
  );
};

const SettingsSkeleton = ({ isWide }: { isWide: boolean }) => {
  const theme = useMantineTheme();
  const mantineTheme = useMantineTheme();

  return (
    <Transition mounted transition="fade" duration={400}>
      {(styles) => (
        <Box
          style={{
            ...styles,
            minHeight: 'calc(100vh - 56px)',
            ...theme.other.app.surfaces.page,
            padding: isWide ? '48px 24px' : '24px 16px',
          }}
        >
          <Box style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: isWide
                  ? 'minmax(220px, 280px) minmax(0, 720px)'
                  : '1fr',
                justifyContent: isWide ? 'center' : undefined,
                gap: isWide
                  ? `calc(${mantineTheme.spacing.xl} * 1.6)`
                  : `calc(${mantineTheme.spacing.xl} * 1.2)`,
                alignItems: 'start',
              }}
            >
              <Box
                style={{
                  minWidth: 0,
                  position: isWide ? 'sticky' : undefined,
                  top: isWide
                    ? `calc(56px + ${mantineTheme.spacing.xl})`
                    : undefined,
                }}
              >
                <Stack
                  gap="md"
                  style={{
                    ...theme.other.app.surfaces.quiet,
                    padding: isWide
                      ? `calc(${mantineTheme.spacing.xl} * 0.9)`
                      : mantineTheme.spacing.md,
                    alignItems: isWide ? 'flex-start' : undefined,
                  }}
                >
                  <Skeleton width={72} height={72} radius={4} />
                  <Stack gap={8} style={{ minWidth: 0, width: '100%' }}>
                    <Skeleton width={96} height={14} />
                    <Skeleton width="72%" height={20} />
                    <Skeleton width="92%" height={16} />
                  </Stack>
                </Stack>
              </Box>
              <Box style={{ minWidth: 0 }}>
                <Stack gap={8} mb="md">
                  <Skeleton width={150} height={36} />
                  <Skeleton width="58%" height={16} />
                </Stack>
                <Stack gap="md" style={{ width: '100%' }}>
                  <SettingsSkeletonSection />
                  <SettingsSkeletonSection />
                  <SettingsSkeletonSection lines={0} />
                  <SettingsSkeletonSection lines={1} />
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Transition>
  );
};

const Settings = (props: Props) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [user, setUser] = useState<UserData>();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const mantineTheme = useMantineTheme();
  const [isWide, setIsWide] = useState(window.innerWidth >= 992);

  const showNotification = (message: string): void => {
    notifications.show({ message });
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

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 992);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateNames = async (values: SettingsFormValues) => {
    if (!values.names.firstName && !values.names.lastName) {
      showNotification('Must enter either first name or last name.');
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
      showNotification('Profile updated successfully.');
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
        showNotification(res.data.message);
        getUserData();
      } else {
        showNotification('Invalid email.');
      }
    } catch (err) {
      console.log(err);
      showNotification('There was an error.');
    }
  };

  const deleteAccount = async () => {
    try {
      await UserService.deleteUser();
      showNotification('Account deleted.');
      logout();
    } catch (err) {
      console.log(err);
      showNotification('There was an error.');
    }
  };

  const updatePassword = async () => {
    try {
      const res = await AuthenticationService.getPasswordResetLink(
        (user as UserData).email,
      );
      showNotification(res.data.message);
      if (res.data.success) {
        logout();
      }
    } catch (err) {
      console.log(err);
      showNotification('There was an error.');
    }
  };

  const openDeleteModal = (): void => {
    setDeleteModalOpen(true);
  };

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;

  if (!user) {
    return <SettingsSkeleton isWide={isWide} />;
  }

  return (
    <Transition mounted transition="fade" duration={400}>
      {(styles) => (
        <>
          <Box
            style={{
              ...styles,
              ...theme.other.app.surfaces.page,
              padding: isWide ? '48px 24px' : '24px 16px',
            }}
          >
            <Box style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: isWide
                    ? 'minmax(220px, 280px) minmax(0, 720px)'
                    : '1fr',
                  justifyContent: isWide ? 'center' : undefined,
                  gap: isWide
                    ? `calc(${mantineTheme.spacing.xl} * 1.6)`
                    : `calc(${mantineTheme.spacing.xl} * 1.2)`,
                  alignItems: 'start',
                  paddingBottom: mantineTheme.spacing.xl,
                }}
              >
                <Box
                  style={{
                    minWidth: 0,
                    position: isWide ? 'sticky' : undefined,
                    top: isWide
                      ? `calc(56px + ${mantineTheme.spacing.xl})`
                      : undefined,
                  }}
                >
                  <Stack
                    gap="md"
                    style={{
                      ...theme.other.app.surfaces.quiet,
                      padding: isWide
                        ? `calc(${mantineTheme.spacing.xl} * 0.9)`
                        : mantineTheme.spacing.md,
                      alignItems: isWide ? 'flex-start' : undefined,
                    }}
                  >
                    <Box
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 4,
                        display: 'grid',
                        placeItems: 'center',
                        color: theme.other.app.palette.primary.dark,
                        backgroundColor:
                          theme.other.app.surfaces.primaryTint.backgroundColor,
                        flex: '0 0 auto',
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        lineHeight: 1,
                      }}
                    >
                      {initials || <AccountCircleRoundedIcon fontSize={36} />}
                    </Box>
                    <Stack gap={4} style={{ minWidth: 0 }}>
                      <Text
                        size="xs"
                        fw={800}
                        style={{
                          letterSpacing: 0,
                          textTransform: 'uppercase',
                        }}
                      >
                        Signed in as
                      </Text>
                      <Title
                        order={6}
                        style={{ fontWeight: 800, lineHeight: 1.2 }}
                      >
                        {user?.firstName} {user?.lastName}
                      </Title>
                      <Text
                        size="sm"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user?.email}
                      </Text>
                    </Stack>
                  </Stack>
                </Box>
                <Box style={{ minWidth: 0 }}>
                  <Stack gap={4} mb="md">
                    <Title
                      order={2}
                      style={{
                        color: theme.other.app.palette.info.contrastText,
                        fontWeight: 850,
                      }}
                    >
                      Settings
                    </Title>
                    <Text size="sm">
                      Manage your account details, sign-in email, and account
                      safety.
                    </Text>
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
                      <Stack gap="md" style={{ width: '100%' }}>
                        <SettingsSection
                          icon={<EmailRoundedIcon fontSize="small" />}
                          title="Update Email"
                          description="Change the email address used to sign in."
                        >
                          <Stack gap="md" style={{ maxWidth: 520 }}>
                            <Field
                              name="email.email"
                              render={() => (
                                <TextInput
                                  id="email"
                                  name="email.email"
                                  type="email"
                                  label="New Email"
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={
                                    formik.touched.email?.email &&
                                    formik.errors.email?.email
                                  }
                                />
                              )}
                            />
                            <Field
                              name="email.password"
                              render={() => (
                                <PasswordInput
                                  id="password"
                                  name="email.password"
                                  label="Password"
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={
                                    formik.touched.email?.password &&
                                    formik.errors.email?.password
                                  }
                                />
                              )}
                            />
                            <Group justify="flex-start">
                              <Button
                                color="dark"
                                onClick={() => updateEmail(formik.values)}
                                variant="filled"
                              >
                                Save
                              </Button>
                            </Group>
                          </Stack>
                        </SettingsSection>
                        <SettingsSection
                          icon={<PersonRoundedIcon fontSize="small" />}
                          title="Update Name"
                          description="Update the name displayed on your account."
                        >
                          <Stack gap="md" style={{ maxWidth: 520 }}>
                            <Field
                              name="names.firstName"
                              render={() => (
                                <TextInput
                                  name="names.firstName"
                                  label="New First Name"
                                  type="text"
                                  id="firstName"
                                  value={formik.values.names.firstName}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={
                                    formik.touched.names?.firstName &&
                                    formik.errors.names?.firstName
                                  }
                                />
                              )}
                            />
                            <Field
                              name="names.lastName"
                              render={() => (
                                <TextInput
                                  name="names.lastName"
                                  label="New Last Name"
                                  id="lastName"
                                  type="text"
                                  value={formik.values.names.lastName}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={
                                    formik.touched.names?.lastName &&
                                    formik.errors.names?.lastName
                                  }
                                />
                              )}
                            />
                            <Group justify="flex-start">
                              <Button
                                color="dark"
                                onClick={() => updateNames(formik.values)}
                                variant="filled"
                              >
                                Save
                              </Button>
                            </Group>
                          </Stack>
                        </SettingsSection>
                        <SettingsSection
                          icon={<SecurityRoundedIcon fontSize="small" />}
                          title="Update Password"
                          description="Send a password reset link to your current email."
                        >
                          <Group justify="flex-start">
                            <Button
                              color="dark"
                              onClick={updatePassword}
                              variant="filled"
                            >
                              Send Email
                            </Button>
                          </Group>
                        </SettingsSection>
                        <SettingsSection
                          icon={<DeleteRoundedIcon fontSize="small" />}
                          title="Danger Zone"
                          description="Permanently delete your account and recipes."
                          danger
                        >
                          <Stack gap="md" style={{ maxWidth: 520 }}>
                            <Text size="sm">This action cannot be undone.</Text>
                            <Divider />
                            <Group justify="flex-start">
                              <Button
                                color="red"
                                onClick={openDeleteModal}
                                variant="filled"
                                leftSection={<DeleteRoundedIcon />}
                              >
                                Delete Account
                              </Button>
                            </Group>
                          </Stack>
                        </SettingsSection>
                      </Stack>
                    )}
                  ></Formik>
                </Box>
              </Box>
            </Box>
          </Box>

          <DeleteModal
            isOpen={deleteModalOpen}
            deleteFunction={deleteAccount}
            closeModal={() => setDeleteModalOpen(false)}
          />
        </>
      )}
    </Transition>
  );
};

export default Settings;
