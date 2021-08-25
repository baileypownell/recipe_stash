import React from 'react'
import { withRouter } from 'react-router-dom'
import M from 'materialize-css'
import './Settings.scss'
import DeleteModal from '../DeleteModal/DeleteModal'
import Fade from 'react-reveal/Fade'
import AuthenticationService from '../../services/auth-service'
import UserService, { UpdateUserNamePayload, UpdateUserEmailPayload, UserData } from '../../services/user-service'
import { Button } from '@material-ui/core'

let modalInstance

type State = {
  password: string
  firstName: string
  firstNameReceived: string
  lastName: string
  lastNameReceived: string
  new_email: string
  emailReceived: string
  email: string
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
    email: ''
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
        M.toast({ html: 'There was an error.' })
      } else {
        M.toast({ html: 'Check your email for a link to reset your password.' })
      }
    } catch (err) {
      M.toast({ html: 'Password could not be reset.' })
    }
  }

  componentDidMount () {
    const elems = document.querySelectorAll('.collapsible')
    M.Collapsible.init(elems, {})
    const modal = document.querySelector('.modal')
    modalInstance = modal
    M.Modal.init(modal, {})
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
      M.toast({ html: 'Profile updated successfully.' })
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
      M.toast({ html: res.data.message })
      if (res.data.success) {
        this.updateView()
      }
    } catch (err) {
      console.log(err)
      M.toast({ html: 'Passwords do not match.' })
    }
  }

  deleteAccount = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      await UserService.deleteUser()
      M.toast({ html: 'Account deleted.' })
      this.props.history.push('/')
    } catch (err) {
      console.log(err)
      M.toast({ html: 'There was an error.' })
    }
  }

  updatePassword = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      const res = await AuthenticationService.getPasswordResetLink(this.state.email)
      M.toast({ html: res.data.message })
      if (res.data.success) {
        // log out
        this.logout()
      }
    } catch (err) {
      console.log(err)
      M.toast({ html: 'There was an error.' })
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
      M.updateTextFields()
    } catch (err) {
      console.log(err)
      this.props.history.push('/login')
    }
  }

  openDeleteModal = () => {
    const modal = M.Modal.getInstance(modalInstance)
    modal.open()
  }

  render () {
    return (
      <Fade>
        <div>
          <h1 className="title">Settings<i className="fas fa-cog"></i></h1>
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
            <ul className="collapsible">
              <li>
                <div className="collapsible-header"><i className="material-icons">email</i>Update Email</div>
                <div className="collapsible-body">
                  <div className="input-field ">
                      <input id="new_email" type="email" onChange={this.updateInput} value={this.state.new_email}></input>
                      <label htmlFor="email">New Email</label>
                  </div>
                  <div className="input-field">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={this.state.password} onChange={this.updateInput} ></input>
                  </div>
                  <Button color="secondary" onClick={this.updateEmail} variant="contained">Save</Button>
                  </div>
              </li>
              <li>
                <div className="collapsible-header"><i className="material-icons">person</i>Update Name</div>
                <div className="collapsible-body">
                    <div className="input-field ">
                        <input id="firstName" type="text" value={this.state.firstName} onChange={this.updateInput}></input>
                        <label htmlFor="firstName" >New First Name</label>
                    </div>
                    <div className="input-field ">
                        <input id="lastName" type="text" value={this.state.lastName} onChange={this.updateInput}></input>
                        <label htmlFor="lastName">New Last Name</label>
                    </div>
                    <Button color="secondary" onClick={this.updateProfile} variant="contained">Save</Button>
                </div>
              </li>
              <li>
                  <div className="collapsible-header"><i className="material-icons">security</i>Update Password</div>
                  <div className="collapsible-body">
                  <p>Click the button below to receive an email with a link to reset your password.</p>
                  <Button color="secondary" onClick={this.updatePassword} variant="contained">Send Email</Button>
                </div>
              </li>
              <li>
                <div className="collapsible-header"><i className="material-icons">delete</i>Delete Account</div>
                <div className="collapsible-body">
                <p>If you are sure you want to delete your account, click the button below. This action <span id="bold">cannot</span> be undone.</p>
                    <Button
                      color="secondary"
                      onClick={this.openDeleteModal}
                      variant="contained">Delete Account <i className="fas fa-exclamation-triangle"></i>
                    </Button>
                  </div>
              </li>
            </ul>
          </div>

          {/* delete confirmation modal */}
          <div id="confirmation-modal" className="modal">
              <DeleteModal deleteFunction={this.deleteAccount}></DeleteModal>
          </div>
        </div>
      </Fade>
    )
  }
}

export default withRouter(Settings)
