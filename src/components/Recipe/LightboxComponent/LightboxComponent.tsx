import { ArrowBackIosNewRoundedIcon } from '@icons';
import { ArrowForwardIosRoundedIcon } from '@icons';
import { CloseRoundedIcon } from '@icons';
import { Box, Button, ActionIcon, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import Lightbox from 'react-spring-lightbox';
import type { ImagesListType } from 'react-spring-lightbox';
import ImageSkeletonLoader from './ImageSkeletonLoader';

interface Props {
  preSignedUrls: string[] | null;
}

const LightboxComponent = ({ preSignedUrls }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const theme = useMantineTheme();

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
          <Box>
            <ActionIcon color="gray" onClick={onClose}>
              <CloseRoundedIcon />
            </ActionIcon>
          </Box>
        )}
        renderPrevButton={() => (
          <Button color="gray" onClick={gotoPrevious}>
            <ArrowBackIosNewRoundedIcon />
          </Button>
        )}
        renderNextButton={() => (
          <Button color="gray" onClick={gotoNext}>
            <ArrowForwardIosRoundedIcon />
          </Button>
        )}
        style={theme.other.app.overlays.lightbox}
      />
      <style>{`
        .lightbox-image-stage {
          width: 100% !important;
          display: flex !important;
          justify-content: space-between !important;
        }
      `}</style>
    </>
  );
};

export default LightboxComponent;
