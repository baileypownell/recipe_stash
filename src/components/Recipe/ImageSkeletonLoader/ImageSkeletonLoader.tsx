import React, { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'

function ImageSkeletonLoader(props) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [ imageOpen, setImageOpen] = useState(false)

    const images = [
        props.url,
      ];

    return ( imageLoaded ?
        <> {
            imageOpen ? 
            <>
            <Lightbox
                mainSrc={images[0]}
                onCloseRequest={() => setImageOpen(false)}
            />
            <img 
                onClick={() => setImageOpen(true)}
                className="z-depth-3"
                style={{'cursor': 'pointer'}}
                key={props.url}
                src={props.url}/>
            </> :  
            <img 
                onClick={() => setImageOpen(true)}
                className="z-depth-3"
                style={{'cursor': 'pointer'}}
                key={props.url}
                src={props.url}/>
        }
        </>
        : <>
            <img
                src={props.url}
                style={{ display: `none`}}
                onLoad={() => setImageLoaded(true)}
                />
            <Skeleton width={200} height={200} className="recipe-image-skeleton" />
        </> 
    )
}

export default ImageSkeletonLoader;