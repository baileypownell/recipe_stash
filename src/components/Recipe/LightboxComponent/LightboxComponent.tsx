import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, Button, IconButton } from '@mui/material';
import { useState } from 'react';
import Lightbox, { ImagesListType } from 'react-spring-lightbox';
import ImageSkeletonLoader from './ImageSkeletonLoader';

interface Props {
  preSignedUrls: string[] | null;
}

const LightboxComponent = ({ preSignedUrls }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const gotoPrevious = () =>
    currentImageIndex > 0 && setCurrentImageIndex(currentImageIndex - 1);

  const gotoNext = () =>
    currentImageIndex + 1 < images?.length &&
    setCurrentImageIndex(currentImageIndex + 1);

  const images: ImagesListType = preSignedUrls
    ? preSignedUrls.map((url) => ({
        src: url,
        loading: 'lazy',
        alt: 'Alt text',
      }))
    : [];

  const triggerLightbox = (photoIndex: number): void => {
    setIsOpen(true);
    setCurrentImageIndex(photoIndex);
  };

  const onClose = (): void => {
    setIsOpen(false);
    setTimeout(() => setCurrentImageIndex(0), 500);
  };

  return (
    <>
      {preSignedUrls?.map((url: string, i: number) => (
        <ImageSkeletonLoader
          openLightBox={() => triggerLightbox(i)}
          url={url}
          key={url}
        ></ImageSkeletonLoader>
      ))}

      <Lightbox
        isOpen={isOpen}
        onPrev={gotoPrevious}
        onNext={gotoNext}
        images={images}
        currentIndex={currentImageIndex}
        onClose={onClose}
        renderHeader={() => (
          <Box padding={1} textAlign="right" marginTop="64px">
            <IconButton color="info" onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        )}
        renderPrevButton={() => (
          <Button
            color="info"
            // disabled={!canPrev}
            onClick={gotoPrevious}
          >
            <ArrowBackIosNewRoundedIcon />
          </Button>
        )}
        renderNextButton={() => (
          <Button
            color="info"
            // disabled={!canNext}
            onClick={gotoNext}
          >
            <ArrowForwardIosRoundedIcon />
          </Button>
        )}
        style={{ background: `rgba(29,29,29, 0.95` }}
      />
    </>
  );
};

export default LightboxComponent;
