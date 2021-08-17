import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';

function ImageSkeletonLoader(props) {
    const [imageLoaded, setImageLoaded] = useState(false)

    return ( 
        imageLoaded ? 
            <img 
                key={props.url}
                className="materialboxed z-depth-2 faded"
                src={props.url}/>
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