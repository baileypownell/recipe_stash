import React, { useState } from 'react'
import ImageSkeletonLoader from './ImageSkeletonLoader/ImageSkeletonLoader'
import Lightbox from 'react-image-lightbox'

interface Props {
  preSignedUrls: string[]
}

function LightboxComponent (props: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  const triggerLightbox = (i) => {
    setIsOpen(true)
    setPhotoIndex(i)
  }

  return (
        <>
            {
                props.preSignedUrls?.map((url: string, i: number) => (
                    <ImageSkeletonLoader openLightBox={() => triggerLightbox(i)} url={url} key={i}></ImageSkeletonLoader>
                ))
            }

            { isOpen && (
                <Lightbox
                    mainSrc={props.preSignedUrls[photoIndex]}
                    nextSrc={props.preSignedUrls[(photoIndex + 1) % props.preSignedUrls.length]}
                    prevSrc={props.preSignedUrls[(photoIndex + props.preSignedUrls.length - 1) % props.preSignedUrls.length]}
                    onCloseRequest={() => setIsOpen(false)}
                    onMovePrevRequest={() =>
                      setPhotoIndex((photoIndex + props.preSignedUrls.length - 1) % props.preSignedUrls.length)

                    }
                    onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % props.preSignedUrls.length)}/>
            ) }
        </>
  )
}

export default LightboxComponent
