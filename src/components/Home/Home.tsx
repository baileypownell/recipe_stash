import { Button } from '@material-ui/core'
import React from 'react'
import Fade from 'react-reveal/Fade'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router-dom'
import mobileView from '../../images/mobile_dashboard.png'
import transparentLogo from '../../images/white-text-transparent.svg'
import './Home.scss'

const Home = (props: RouteComponentProps) => {
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
                <Button variant="contained" color="secondary" onClick={() => props.history.push('/recipes')}>
                  Get Started <i className="fas fa-arrow-circle-right" style={{ marginLeft: '8px' }}></i>
                </Button>
              </div>
            </Fade>
            </div>
        </div>
    </>
  )
}

export default withRouter(Home)
