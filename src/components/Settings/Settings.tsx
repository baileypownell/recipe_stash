import { Accordion, AccordionDetails, AccordionSummary, Button, Snackbar, TextField } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import React, { useState, useEffect } from 'react'
import Fade from 'react-reveal/Fade'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import AuthenticationService from '../../services/auth-service'
import UserService, { UpdateUserEmailPayload, UpdateUserNamePayload, UserData } from '../../services/user-service'
import DeleteModal from '../DeleteModal/DeleteModal'
import * as yup from 'yup'
import InnerNavigationBar from '../InnerNavigationBar/InnerNavigationBar'
import './Settings.scss'
import { isPasswordValid } from '../../models/functions'
import { Formik, Field } from 'formik'

interface Props extends RouteComponentProps {
  id: string
}

const validationSchema = yup.object({
  email: yup.object({
    email: yup
      .string()
      .email('Enter a valid email.'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .test(
        'is-valid',
        'Password must contain at least one capital letter, one lower case letter, and one number.',
        (value) => isPasswordValid(value)
      )
      .required('Password is required.')
  }),
  names: yup.object({
    firstName: yup
      .string()
      .required('First name is required.'),
    lastName: yup
      .string()
      .required('Last name is required.')
  })
})

const Settings = (props: Props) => {
  const [snackBarOpen, setSnackBarOpen] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [user, setUser] = useState(null)

  // const formik = useFormik({
  //   initialValues: {
  //     email: {
  //       email: '',
  //       password: ''
  //     },
  //     names: {
  //       firstName: '',
  //       lastName: ''
  //     }
  //   },
  //   validationSchema,
  //   onSubmit: () => null
  // })

  const openSnackBar = (message: string): void => {
    setSnackBarOpen(true)
    setSnackBarMessage(message)
  }

  const getUserData = async () => {
    try {
      const user: UserData = await UserService.getUser()
      setUser(user)
    } catch (err) {
      console.log(err)
    }
  }

  const logout = async () => {
    try {
      await AuthenticationService.logout()
      AuthenticationService.setUserLoggedOut()
      props.history.push('/')
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getUserData()
  }, [])

  const updateProfile = async () => {
    const { id } = props

    try {
      const payload: UpdateUserNamePayload = {
        firstName: formik.values.names.firstName,
        lastName: formik.values.names.lastName,
        id
      }
      await UserService.updateUser(payload)
      openSnackBar('Profile updated successfully.')
      getUserData()
    } catch (err) {
      AuthenticationService.setUserLoggedOut()
      props.history.push('/login')
    }
  }

  const updateEmail = async (values) => {
    console.log(values)
    try {
      const payload: UpdateUserEmailPayload = {
        newEmail: values.email.email,
        password: values.email.password
      }
      const res = await UserService.updateUser(payload)
      setSnackBarOpen(res.data.message)
      if (res.data.success) {
        getUserData()
      }
    } catch (err) {
      console.log(err)
      openSnackBar('There was an error.')
    }
  }

  const deleteAccount = async () => {
    try {
      await UserService.deleteUser()
      openSnackBar('Account deleted.')
      props.history.push('/')
    } catch (err) {
      console.log(err)
      openSnackBar('There was an error.')
    }
  }

  const updatePassword = async () => {
    try {
      const res = await AuthenticationService.getPasswordResetLink(user.email)
      setSnackBarOpen(res.data.message)
      if (res.data.success) {
        logout()
      }
    } catch (err) {
      console.log(err)
      openSnackBar('There was an error.')
    }
  }

  const openDeleteModal = (): void => {
    setDeleteModalOpen(true)
  }

  const closeSnackBar = (): void => {
    setSnackBarOpen(false)
    setSnackBarMessage('')
  }

  return (
    <Fade>
      <div>
        <InnerNavigationBar title={'Settings'} icon={'<i class="fas fa-cog"></i>'}></InnerNavigationBar>
        <div className="settings">
          <div id="profileParent">
            <div id="profile">
              <i className="fas fa-user-circle"></i><h3>{user?.firstName} {user?.lastName}</h3>
            </div>
          </div>
            <div id="table">
              <div className="row">
                <div>
                  <p>Email</p>
                  <h4>{user?.email}</h4>
                </div>
              </div>
            </div>
              <Formik
                initialValues={{
                  email: {
                    email: '',
                    password: ''
                  },
                  names: {
                    firstName: '',
                    lastName: ''
                  }
                }}
                validationSchema={validationSchema}
                onSubmit={values => {
                  // same shape as initial values
                  console.log(values)
                }}
                render={(formikBag) => (
                <>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <span className="accordion-summary"><i className="material-icons">email</i>Update Email</span>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Field
                      name="email.email"
                      render={({ field, form }) => (
                        <TextField
                          id="email"
                          name="email.email"
                          type="email"
                          label="New Email"
                          onChange={formikBag.handleChange}
                          onBlur={formikBag.handleBlur}
                          error={form.touched.email?.email && Boolean(form.errors.email?.email)}
                          helperText={form.touched.email?.email && form.errors.email?.email}>
                        </TextField>
                      )}
                      />
                      <Field
                      name="email.password"
                      render={({ field, form }) => (
                        <TextField
                          id="password"
                          type="password"
                          name="email.password"
                          label="Password"
                          onChange={formikBag.handleChange}
                          onBlur={formikBag.handleBlur}
                          error={form.touched.email?.password && Boolean(form.errors.email?.password)}
                          helperText={form.touched.email?.password && form.errors.email?.password}
                          >
                        </TextField>
                      )} />
                      <div style={{ marginTop: '20px' }}>
                        <Button color="secondary" onClick={() => updateEmail(formikBag.values)} variant="contained">Save</Button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <span className="accordion-summary"><i className="material-icons">person</i>Update Name</span>
                    </AccordionSummary>
                    <AccordionDetails>
                      {/* <TextField
                        id="firstName"
                        type="text"
                        label="New First Name"
                        value={formik.values.names.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.names?.firstName && Boolean(formik.errors.names?.firstName)}
                        helperText={formik.touched.names?.firstName && formik.errors.names?.firstName}>
                        </TextField>
                        <TextField
                          id="lastName"
                          type="text"
                          label="New Last Name"
                          value={formik.values.names.lastName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.names?.lastName && Boolean(formik.errors.names?.lastName)}
                          helperText={formik.touched.names?.lastName && formik.errors.names?.lastName}>
                        </TextField> */}
                        <div style={{ marginTop: '20px' }}>
                          <Button color="secondary" onClick={updateProfile} variant="contained">Save</Button>
                        </div>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <span className="accordion-summary"><i className="material-icons">security</i>Update Password</span>
                    </AccordionSummary>
                    <AccordionDetails>
                      <p>Click the button below to receive an email with a link to reset your password.</p>
                      <div>
                        <Button color="secondary" onClick={updatePassword} variant="contained">Send Email</Button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <span className="accordion-summary"><i className="material-icons">delete</i>Delete Account</span>
                    </AccordionSummary>
                    <AccordionDetails>
                      <p>If you are sure you want to delete your account, click the button below. This action
                        <span id="bold">cannot</span> be undone.</p>
                      <div>
                        <Button
                          color="secondary"
                          id="delete"
                          onClick={openDeleteModal}
                          variant="contained">Delete Account <i style={{ marginLeft: '8px' }} className="fas fa-exclamation-triangle"></i>
                        </Button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </>
                )}></Formik>
        </div>
      </div>

      <Snackbar
        open={snackBarOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        onClose={closeSnackBar}
        autoHideDuration={3000}
        message={snackBarMessage}
        key={'bottom' + 'center'}/>

      <DeleteModal
        open={deleteModalOpen}
        deleteFunction={deleteAccount}
        closeModal={() => setDeleteModalOpen(false)}>
      </DeleteModal>
    </Fade>
  )
}

export default withRouter(Settings)
