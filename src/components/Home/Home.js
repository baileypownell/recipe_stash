import React from 'react'
import mobileView from '../../images/mobile_dashboard_edited.png'
import transparentLogo from '../../images/white-text-transparent.svg'
import { withRouter } from 'react-router'
import './Home.scss';
import { appear } from '../../models/functions'
import Fade from 'react-reveal/Fade'
import { Button } from '@material-ui/core'

class Home extends React.Component {

  start = () => {
    this.props.history.push('/recipes')
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
                <img src={transparentLogo}/>
              </div>
              <Fade top>
                <div className="blurbs">
                  <h4 className="fade">All of your recipes.</h4>
                  <h4 className="fade">All in one place.</h4>
                  <h4 className="fade">And it's free.</h4>
                </div>
              </Fade>
              <Fade bottom>
                <div id="skew">
                  <img className="fade" src={mobileView} alt="whisk" />
                  <Button variant="outlined" onClick={this.start}>Get Started <i class="fas fa-arrow-circle-right"></i></Button>
                </div>
              </Fade>
              </div>
          </div>
      </>  
    )
  }
}

export default withRouter(Home);
