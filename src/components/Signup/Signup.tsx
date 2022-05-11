import { Button, Snackbar, TextField } from '@material-ui/core'
import { useFormik } from 'formik'
import React, { useState, useEffect } from 'react'
import Fade from 'react-reveal/Fade'
import { RouteComponentProps } from 'react-router-dom'
import ClipLoader from 'react-spinners/ClipLoader'
import * as yup from 'yup'
import { isPasswordInvalid } from '../../models/functions'
import AuthenticationService from '../../services/auth-service'
import UserService, { UserCreatedResponse, UserInputInterface } from '../../services/user-service'
import './Signup.scss'

const validationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required'),
  lastName: yup
    .string()
    .required('Last name is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .oneOf([yup.ref('password')], 'Passwords don\'t match.')
    .required('Password confirmation is required')
})

const Signup = (props: RouteComponentProps) => {
  const [loading, setLoading] = useState(false)
  const [snackBarOpen, setSnackBarOpen] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState('')

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
        props.history.push('/recipes')
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

  const login = (): void => { props.history.push('/login') }

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: (values) => signup(values)
  })

  useEffect(() => {
    // console.log(formik)
  }, [formik])

  return (
    <div className="auth">
      <div className="gradient">
        <Fade top>
          <form onSubmit={formik.handleSubmit}>
            <h1>Signup</h1>
            <TextField
              id="firstName"
              type="text"
              label="First Name"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}/>
            <TextField
              id="lastName"
              type="text"
              label="Last Name"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}/>
            <TextField
              id="email"
              type="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}/>
            <TextField
              id="password"
              type="password"
              label="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}/>
            <TextField
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}/>
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
          </form>
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
