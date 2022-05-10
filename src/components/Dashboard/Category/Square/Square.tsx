import React, { useState, useEffect } from 'react'
import Skeleton from 'react-loading-skeleton'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import './Square.scss'

interface Props extends RouteComponentProps {
  key: string
  rawTitle: string
  awsUrl: string
  recipeId: string
}

const Square = (props: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [skeletonWidth, setSkeletonWidth] = useState(120)
  const [skeletonHeight, setSkeletonHeight] = useState(120)

  const viewRecipe = () => {
    props.history.push(`/recipes/${props.recipeId}`)
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
  const { key, rawTitle, awsUrl } = props
  return (
    <>
    { awsUrl
      ? <>
        { imageLoaded
          ? <div
              style={{ backgroundImage: `url(${awsUrl})` }}
              id={'default-tile-image'}
              className={'recipe-card red-background'}
              key={key}
              onClick={viewRecipe}>
            <h4>{rawTitle}</h4>
          </div>
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
      : <div
          className={'recipe-card'}
          key={key}
          onClick={viewRecipe}>
          <h4>{rawTitle}</h4>
        </div>
      }
    </>
  )
}

export default withRouter(Square)
