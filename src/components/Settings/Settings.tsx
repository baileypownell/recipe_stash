import { Accordion, AccordionDetails, AccordionSummary, Button, Snackbar, TextField } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import React from 'react'
import Fade from 'react-reveal/Fade'
import { withRouter } from 'react-router-dom'
import AuthenticationService from '../../services/auth-service'
import UserService, { UpdateUserEmailPayload, UpdateUserNamePayload, UserData } from '../../services/user-service'
import DeleteModal from '../DeleteModal/DeleteModal'
import InnerNavigationBar from '../InnerNavigationBar/InnerNavigationBar'
import './Settings.scss'

type State = {
  password: string
  firstName: string
  firstNameReceived: string
  lastName: string
  lastNameReceived: string
  new_email: string
  emailReceived: string
  email: string
  snackBarOpen: boolean
  snackBarMessage: string
  deleteModalOpen: boolean
}

class Settings extends React.Component<any, State> {
  state = {
    password: '',
    firstName: '',
    firstNameReceived: '',
    lastName: '',
    lastNameReceived: '',
    new_email: '',
    emailReceived: '',
    email: '',
    snackBarOpen: false,
    snackBarMessage: '',
    deleteModalOpen: false
  }

  logout = async () => {
    try {
      await AuthenticationService.logout()
      AuthenticationService.setUserLoggedOut()
      this.props.history.push('/')
    } catch (err) {
      console.log(err)
    }
  }

  resetPassword = async () => {
    try {
      const res = await AuthenticationService.getPasswordResetLink(this.state.email)
      if (!res.data.success) {
        this.openSnackBar('There was an error.')
      } else {
        this.openSnackBar('Check your email for a link to reset your password.')
      }
    } catch (err) {
      this.openSnackBar('Password could not be reset.')
    }
  }

  componentDidMount () {
    this.updateView()
  }

  updateInput = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      [e.currentTarget.id]: e.currentTarget.value
    } as any)
  }

  updateProfile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { firstName, lastName } = this.state
    const { id } = this.props
    e.preventDefault()
    try {
      const payload: UpdateUserNamePayload = {
        firstName: firstName,
        lastName: lastName,
        id
      }
      await UserService.updateUser(payload)
      this.openSnackBar('Profile updated successfully.')
      this.updateView()
    } catch (err) {
      AuthenticationService.setUserLoggedOut()
      this.props.history.push('/login')
    }
  }

  updateEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      const payload: UpdateUserEmailPayload = {
        newEmail: this.state.new_email,
        password: this.state.password
      }
      const res = await UserService.updateUser(payload)
      this.openSnackBar(res.data.message)
      if (res.data.success) {
        this.updateView()
      }
    } catch (err) {
      console.log(err)
      this.openSnackBar('Passwords do not match.')
    }
  }

  deleteAccount = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      await UserService.deleteUser()
      this.openSnackBar('Account deleted.')
      this.props.history.push('/')
    } catch (err) {
      console.log(err)
      this.openSnackBar('There was an error.')
    }
  }

  updatePassword = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      const res = await AuthenticationService.getPasswordResetLink(this.state.email)
      this.openSnackBar(res.data.message)
      if (res.data.success) {
        this.logout()
      }
    } catch (err) {
      console.log(err)
      this.openSnackBar('There was an error.')
    }
  }

  updateView = async () => {
    try {
      const user: UserData = await UserService.getUser()
      this.setState({
        firstName: user.firstName,
        firstNameReceived: user.firstName,
        lastName: user.lastName,
        lastNameReceived: user.lastName,
        email: user.email,
        emailReceived: user.email
      })
    } catch (err) {
      console.log(err)
      this.props.history.push('/login')
    }
  }

  openDeleteModal = () => {
    this.setState({ deleteModalOpen: true })
  }

  openSnackBar (message: string) {
    this.setState({
      snackBarOpen: true,
      snackBarMessage: message
    })
  }

  closeSnackBar = () => {
    this.setState({
      snackBarOpen: false,
      snackBarMessage: ''
    })
  }

  render () {
    const { snackBarMessage, snackBarOpen, deleteModalOpen } = this.state
    return (
      <Fade>
        <div>
          <InnerNavigationBar title={'Settings'} icon={'<i class="fas fa-cog"></i>'}></InnerNavigationBar>
          <div className="settings">
            <div id="profileParent">
              <div id="profile">
                <i className="fas fa-user-circle"></i><h3>{this.state.firstNameReceived} {this.state.lastNameReceived}</h3>
              </div>
            </div>
            <div id="table">
              <div className="row">
                <div>
                  <p>Email</p>
                  <h4>{this.state.emailReceived}</h4>
                </div>
              </div>
            </div>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span className="accordion-summary"><i className="material-icons">email</i>Update Email</span>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  id="new_email"
                  type="email"
                  label="New Email"
                  onChange={this.updateInput}
                  value={this.state.new_email}>
                </TextField>
                <TextField
                  id="password"
                  type="password"
                  label="Password"
                  value={this.state.password}
                  onChange={this.updateInput} >
                </TextField>
                <div style={{ marginTop: '20px' }}>
                  <Button color="secondary" onClick={this.updateEmail} variant="contained">Save</Button>
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span className="accordion-summary"><i className="material-icons">person</i>Update Name</span>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  id="firstName"
                  type="text"
                  label="New First Name"
                  value={this.state.firstName}
                  onChange={this.updateInput}>
                  </TextField>
                  <TextField
                    id="lastName"
                    type="text"
                    label="New Last Name"
                    value={this.state.lastName}
                    onChange={this.updateInput}>
                  </TextField>
                  <div style={{ marginTop: '20px' }}>
                    <Button color="secondary" onClick={this.updateProfile} variant="contained">Save</Button>
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
                  <Button color="secondary" onClick={this.updatePassword} variant="contained">Send Email</Button>
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
                    onClick={this.openDeleteModal}
                    variant="contained">Delete Account <i style={{ marginLeft: '8px' }} className="fas fa-exclamation-triangle"></i>
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>

        <Snackbar
          open={snackBarOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          onClose={this.closeSnackBar}
          autoHideDuration={3000}
          message={snackBarMessage}
          key={'bottom' + 'center'}
        />

      <DeleteModal
        open={deleteModalOpen}
        deleteFunction={this.deleteAccount}
        closeModal={() => this.setState({ deleteModalOpen: false })}>
      </DeleteModal>
      </Fade>
    )
  }
}

export default withRouter(Settings)
