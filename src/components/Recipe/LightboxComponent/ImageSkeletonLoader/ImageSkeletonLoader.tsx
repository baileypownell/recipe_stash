import React, { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-image-lightbox/style.css'

function ImageSkeletonLoader (props: { url: string, openLightBox: Function }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (imageLoaded
    ? <img
        onClick={() => props.openLightBox()}
        style={{ cursor: 'pointer' }}
        key={props.url}
        src={props.url}/>
    : <>
        <img
            src={props.url}
            style={{ display: 'none' }}
            onLoad={() => setImageLoaded(true)}
            />
        <Skeleton width={200} height={200} className="recipe-image-skeleton" />
      </>
  )
}

export default ImageSkeletonLoader
