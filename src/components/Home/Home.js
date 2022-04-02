import React from 'react'
import mobileView from '../../images/mobile_dashboard.png'
import transparentLogo from '../../images/white-text-transparent.svg'
import { withRouter } from 'react-router'
import './Home.scss'
import Fade from 'react-reveal/Fade'
import { Button } from '@material-ui/core'

class Home extends React.Component {
  start = () => {
    this.props.history.push('/recipes')
  }

  componentDidMount () { }

  render () {
    return (
      <>
         <div id="home">
            <div id="picture">
              <div className="flex">
                <img src={transparentLogo}/>
              </div>
              <Fade top>
                <div className="blurbs">
                  <h4>All of your recipes.</h4>
                  <h4>All in one place.</h4>
                  <h4>And it's free.</h4>
                </div>
              </Fade>
              <Fade bottom>
                <div id="phone-image">
                  <img src={mobileView} alt="whisk" />
                  <Button variant="contained" color="secondary" onClick={this.start}>
                    Get Started <i className="fas fa-arrow-circle-right" style={{ marginLeft: '8px' }}></i>
                  </Button>
                </div>
              </Fade>
              </div>
          </div>
      </>
    )
  }
}

export default withRouter(Home)
