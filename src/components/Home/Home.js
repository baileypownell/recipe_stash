import React from 'react';
import mobileView from '../../images/mobile_dashboard_edited.png'
import { connect, compose } from 'react-redux';
import * as actions from '../../store/actionCreators';
import { withRouter } from 'react-router'

import './Home.scss';

class Home extends React.Component {

  state = {
    message: 'All of your recipes.',
    messageNum: 0,
  }

  start = () => {
    this.props.history.push('/dashboard')
  }

  componentDidMount() {
    let faded = document.querySelectorAll('.fade');

    let Appear = () => {
      for (let i = 0; i <faded.length; i++) {
      faded[i].classList.add('fade-in');
      }
    }
    setTimeout(Appear, 500);
}

  render() {
    return (
      <div id="home">
        <div id="picture">
          <div className="flex">
            <h1>Virtual Cookbook</h1>
          </div>
          <div className="blurbs">
            <h4 className="fade">All of your recipes.</h4>
            <h4 className="fade">All in one place.</h4>
            <h4 className="fade">And it's free.</h4>
          </div>
          <div id="skew">
            <img className="fade" src={mobileView} alt="whisk" />
            <button className="waves-effect waves-light btn fade" onClick={this.start}>Get Started</button>
          </div>
          </div>
     </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(actions.logout())
  }
}

export default withRouter(connect(null, mapDispatchToProps)(Home));
