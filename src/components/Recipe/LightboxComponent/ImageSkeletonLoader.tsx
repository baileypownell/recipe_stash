import { Box, Skeleton } from '@mantine/core';
import { useState } from 'react';

interface ImageSkeletonLoaderProps {
  url: string;
  openLightBox: () => void;
}

function ImageSkeletonLoader({
  url,
  openLightBox,
}: ImageSkeletonLoaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return imageLoaded ? (
    <img
      onClick={() => openLightBox()}
      style={{
        width: '100%',
        aspectRatio: '4 / 3',
        objectFit: 'cover',
        borderRadius: 6,
        display: 'block',
        cursor: 'pointer',
      }}
      key={url}
      src={url}
      alt={url}
    />
  ) : (
    <Box style={{ width: '100%' }}>
      <img
        src={url}
        style={{ display: 'none' }}
        onLoad={() => setImageLoaded(true)}
        alt={url}
      />
      <Skeleton height="100%" style={{ aspectRatio: '4 / 3', display: 'block' }} />
    </Box>
  );
}

export default ImageSkeletonLoader;
