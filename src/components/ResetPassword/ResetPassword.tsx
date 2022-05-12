import { Button, Snackbar, TextField, Divider } from '@material-ui/core'
import { useFormik } from 'formik'
import React, { useState, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import * as yup from 'yup'
import ClipLoader from 'react-spinners/ClipLoader'
import AuthenticationService from '../../services/auth-service'
import './ResetPassword.scss'
import { isPasswordValid } from '../../models/functions'

const validationSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .test('is-valid', 'Password must contain at least one capital letter, one lower case letter, and one number.', (value) => isPasswordValid(value))
    .required('Password is required.')
})

const ResetPassword = (props: RouteComponentProps) => {
  const [invalidLink, setInvalidLink] = useState(false)
  const [loading, setLoading] = useState(false)
  const [snackBarOpen, setSnackBarOpen] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState('')
  const [email, setUserEmail] = useState(null)

  const verifyToken = async () => {
    const token = props.match.params.token
    try {
      const res = await AuthenticationService.verifyEmailResetToken(token)
      if (!res.data.success) {
        setInvalidLink(true)
      } else {
        setInvalidLink(false)
        setUserEmail(res.data.user_email)
      }
    } catch (err) {
      setInvalidLink(true)
      console.log(err)
    }
  }

  useEffect(() => {
    verifyToken()
  }, [])

  const goHome = (): void => {
    props.history.push('/')
  }

  const openSnackBar = (message: string): void => {
    setSnackBarOpen(true)
    setSnackBarMessage(message)
  }

  const closeSnackBar = (): void => {
    setSnackBarOpen(false)
    setSnackBarMessage('')
  }

  const updatePassword = async (values) => {
    setLoading(true)
    try {
      const reset_password_token = props.match.params.token
      await AuthenticationService.updatePassword(values.password, reset_password_token, email)
      openSnackBar('Password updated! Redirecting...')
      setLoading(false)
      props.history.push('/recipes')
    } catch (err) {
      openSnackBar('There was an error.')
      setLoading(false)
    }
  }

  const formik = useFormik({
    initialValues: {
      password: ''
    },
    validationSchema,
    onSubmit: (values) => updatePassword(values)
  })

  return (
    invalidLink
      ? <>
          <div className="invalid-link">
            <h3>The link is invalid or expired.</h3>
            <button className="waves-effect waves-light btn" onClick={goHome}>Home</button>
          </div>
        </>
      : <>
          <div className="resetPassword">
            <form onSubmit={formik.handleSubmit}>
              <TextField
                id="password"
                type="password"
                required
                label="New Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}/>
              <Button
                disabled={!formik.isValid}
                variant="contained"
                color="secondary"
                type="submit">
                { loading
                  ? <ClipLoader
                    css={'border-color: white;'}
                    size={30}
                    color={'#689943'}
                    loading={loading}
                  />
                  : 'Submit' }
              </Button>
            </form>
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
            key={'bottom' + 'center'}/>
          </>
  )
}

export default withRouter(ResetPassword)
