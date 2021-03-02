import React from 'react'
import mobileView from '../../images/mobile_dashboard_edited.png'
import { withRouter } from 'react-router'
import './Home.scss';
const appear = require('../../models/functions')

class Home extends React.Component {

  start = () => {
    this.props.history.push('/dashboard')
  }

  componentDidMount() {
    let faded = document.querySelectorAll('.fade');
    setTimeout(appear(faded, 'fade-in'), 500);
  }

  render() {
    return (
      <>
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
      </>  
    )
  }
}

export default withRouter(Home);
