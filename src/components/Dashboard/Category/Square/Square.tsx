import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import './Square.scss'

interface Props {
  key: string
  rawTitle: string
  awsUrl: string
  recipeId: string
}

const Square = (props: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [skeletonWidth, setSkeletonWidth] = useState(120)
  const [skeletonHeight, setSkeletonHeight] = useState(120)
  const navigate = useNavigate()

  const viewRecipe = () => {
    navigate(`/recipes/${props.recipeId}`)
  }

  const handleWindowSizeChange = () => {
    let skeletonHeight, skeletonWidth
    if (window.innerWidth >= 600) {
      skeletonHeight = 100
      skeletonWidth = 175
    } else {
      skeletonHeight = 120
      skeletonWidth = 120
    }
    setSkeletonWidth(skeletonWidth)
    setSkeletonHeight(skeletonHeight)
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange)
    handleWindowSizeChange()

    return window.removeEventListener('resize', handleWindowSizeChange)
  }, [])

  // a <Square/> should not render until the background image (if there is one) is fully loaded
  // this means we need to technically render an <img/> so that we can react with the onLoad listener & then render the div
  const { rawTitle, awsUrl } = props
  return (
    <>
    { awsUrl
      ? <>
        { imageLoaded
          ? <Box
              style={{ backgroundImage: `url(${awsUrl})` }}
              id={'default-tile-image'}
              className={'recipe-card red-background'}
              onClick={viewRecipe}>
            <h4>{rawTitle}</h4>
          </Box>
          : <>
              <img
                src={awsUrl}
                style={{ display: 'none' }}
                onLoad={() => setImageLoaded(true)}
                />
              <Skeleton width={skeletonWidth} height={skeletonHeight} className="skeleton" />
            </>
        }
      </>
      : <Box
          boxShadow={3}
          className="recipe-card"
          onClick={viewRecipe}>
          <Typography variant="body1">{rawTitle}</Typography>
        </Box>
      }
    </>
  )
}

export default Square
