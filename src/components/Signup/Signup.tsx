
import { Button, Fade, Snackbar, TextField } from '@mui/material'
import { Form, Formik } from 'formik'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import ClipLoader from 'react-spinners/ClipLoader'
import * as yup from 'yup'
import { isPasswordValid } from '../../models/functions'
import AuthenticationService from '../../services/auth-service'
import UserService, { UserCreatedResponse, UserInputInterface } from '../../services/user-service'
import './Signup.scss'

const validationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required.'),
  lastName: yup
    .string()
    .required('Last name is required.'),
  email: yup
    .string()
    .email('Enter a valid email.')
    .required('Email is required.'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .test('is-valid', 'Password must contain at least one capital letter, one lower case letter, and one number.', (value) => isPasswordValid(value))
    .required('Password is required.'),
  confirmPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .oneOf([yup.ref('password')], 'Passwords don\'t match.')
    .required('Password confirmation is required.')
})

const Signup = (props) => {
  const [loading, setLoading] = useState(false)
  const [snackBarOpen, setSnackBarOpen] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState('')
  const navigate = useNavigate()

  const openSnackBar = (message: string) => {
    setSnackBarMessage(message)
    setSnackBarOpen(true)
  }

  const signup = async (values) => {
    setLoading(true)
    try {
      const userInput: UserInputInterface = {
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        email: values.email
      }
      const user: UserCreatedResponse = await UserService.createUser(userInput)
      if (user.success) {
        AuthenticationService.setUserLoggedIn()
        navigate('/recipes')
      } else {
        setLoading(false)
        openSnackBar(user.message)
      }
    } catch (err) {
      setLoading(false)
      openSnackBar(err.response.data.error)
    }
  }

  const closeSnackBar = (): void => {
    setSnackBarMessage('')
    setSnackBarOpen(false)
  }

  const login = (): void => (navigate('/login'))

  return (
    <div className="auth">
      <div className="gradient">
        <Fade>
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: ''
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => signup(values)}
            render={formik => (
              <Form>
                <h1>Signup</h1>
                <TextField
                  name="firstName"
                  type="text"
                  required
                  label="First Name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName} />
                <TextField
                  name="lastName"
                  type="text"
                  required
                  label="Last Name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName} />
                <TextField
                  name="email"
                  type="email"
                  required
                  label="Email"
                  value={formik.values.email}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email} />
                <TextField
                  name="password"
                  type="password"
                  required
                  label="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password} />
                <TextField
                  name="confirmPassword"
                  type="password"
                  required
                  label="Confirm Password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword} />
                <p>Already have an account? <span className="link" onClick={login}>Log in.</span></p>
                <Button variant="contained" color="secondary" type="submit" disabled={!formik.isValid}>
                  {loading
                    ? <ClipLoader
                      css={'border-color: white;'}
                      size={30}
                      color={'white'}
                      loading={loading}
                    />
                    : 'Submit'}
                </Button>
              </Form>
            )}>
          </Formik>
        </Fade>
      </div>

      <Snackbar
        open={snackBarOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        onClose={closeSnackBar}
        autoHideDuration={4000}
        message={snackBarMessage}
        key={'bottom' + 'center'}
      />
    </div>
  )
}

export default Signup
