
import { Box, Button, Fade } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import mobileView from '../../images/mobile_dashboard.png'
import transparentLogo from '../../images/white-text-transparent.svg'
import './Home.scss'

const Home = (props: any) => {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setVisible(true), 500)
  }, [])
  
  return (
    <Box id="home">
      <Box id="picture">
        <Box className="flex">
          <img src={transparentLogo}/>
        </Box>
        <Fade in={visible}>
          <Box>
            <Box className="blurbs">
              <h4>All of your recipes.</h4>
              <h4>All in one place.</h4>
              <h4>And it's free.</h4>
            </Box>
            <Box id="phone-image">
              <img src={mobileView} alt="whisk" />
              <Button variant="contained" color="secondary" onClick={() => navigate('/recipes')}>
                Get Started <i className="fas fa-arrow-circle-right" style={{ marginLeft: '8px' }}></i>
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default Home