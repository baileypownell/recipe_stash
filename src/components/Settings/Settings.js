import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
import { withRouter } from "react-router-dom";
import './Settings.scss';

class Settings extends React.Component {

  logout = () => {
    this.props.logout();
    this.props.history.push('/home')
  }
  render() {
    return (
      <>
        <h1 className="Title">Settings<i className="fas fa-cog"></i></h1>
        <button onClick={this.logout}>Log out</button>
      </>
    )
  }
}



const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(actions.logout())
  }
}


export default withRouter(connect(null, mapDispatchToProps)(Settings));
