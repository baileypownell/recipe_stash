import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';

function ImageSkeletonLoader(props) {
    const [imageLoaded, setImageLoaded] = useState(false)

    useEffect(() => {
        const images = document.querySelectorAll('.materialboxed')
        M.Materialbox.init(images, {})
    })

    return ( 
        imageLoaded ? 
            <div>
                <img 
                key={props.url}
                className="materialboxed z-depth-2 faded"
                src={props.url}/>
            </div>
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