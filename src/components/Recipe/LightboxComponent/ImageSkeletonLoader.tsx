import { Box } from '@mui/material';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function ImageSkeletonLoader({ url, openLightBox }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return imageLoaded ? (
    <img
      onClick={() => openLightBox()}
      style={{ cursor: 'pointer' }}
      key={url}
      src={url}
    />
  ) : (
    <Box
      sx={{
        height: '300px',
        marginBottom: '10px',
      }}
    >
      <img
        src={url}
        style={{ display: 'none' }}
        onLoad={() => setImageLoaded(true)}
      />
      <Skeleton height="100%" />
    </Box>
  );
}

export default ImageSkeletonLoader;
