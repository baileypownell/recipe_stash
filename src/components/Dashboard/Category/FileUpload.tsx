import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import {
  Box,
  Button,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { NewFile } from '../../../models/images';
import { FileUploadPreview } from './FileUploadPreview';
const { v4: uuidv4 } = require('uuid');

interface FileUploadProps {
  passDefaultTileImage: (key: string | null) => void;
  preExistingImageUrls?: string[];
  defaultTileImageUUID?: string;
  passFiles: (files: (File | NewFile)[]) => void;
  passFilesToDelete?: (files: string[]) => void;
}

const FileUpload = ({
  passDefaultTileImage,
  preExistingImageUrls,
  defaultTileImageUUID,
  passFiles,
  passFilesToDelete,
}: FileUploadProps) => {
  const [files, setFiles] = useState<NewFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [defaultTileImageKey, setDefaultTileImageKey] = useState<string | null>(
    null,
  );
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const input = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (defaultTileImageUUID) {
      setDefaultTileImageKey(defaultTileImageUUID);
    }
  }, []);

  const openFileFinder = () => input.current.click();

  const openSnackBar = (message: string) => {
    setSnackBarOpen(true);
    setSnackBarMessage(message);
  };

  const closeSnackBar = () => {
    setSnackBarOpen(false);
    setSnackBarMessage('');
  };

  const processfiles = (newFiles: File[] | FileList) => {
    const filesToProcess = Array.from(newFiles).slice(0, 5 - files.length);
    const maxReached = !!(
      files.length + (preExistingImageUrls?.length || 0) >=
      5
    );
    if (maxReached) {
      openSnackBar('Only 5 images allowed per recipe.');
      return;
    }
    const processedFiles = filesToProcess.map((file) => ({
      file: file,
      id: uuidv4(),
    }));
    setFiles([...files, ...processedFiles]);
  };

  const handleDrop = (e): void => {
    e.preventDefault();
    e.stopPropagation();
    const fileList: FileList = e.dataTransfer.files;
    if (!fileList.length) {
      return;
    }
    processfiles(fileList);
  };

  const handleUpload = (e): void => processfiles(e.target.files);

  const removeNewFile = (fileId: string): void => {
    setFiles(files.filter((file) => file.id !== fileId));
  };

  const handleFileDeletion = (fileUrl: string) => {
    const imageKey = fileUrl.split('amazonaws.com/')[1].split('?')[0];
    const isDefaultTileImage = imageKey === defaultTileImageKey;
    if (isDefaultTileImage) {
      setDefaultTileImageKey(null);
    }
    setFilesToDelete([...filesToDelete, fileUrl]);
  };

  useEffect(() => {
    passFiles(files);
  }, [files]);

  useEffect(() => {
    passDefaultTileImage(defaultTileImageKey);
  }, [defaultTileImageKey]);

  useEffect(() => {
    passFilesToDelete?.(filesToDelete);
  }, [filesToDelete]);

  const limitReached = !!(
    files.length + (preExistingImageUrls?.length || 0) >=
    5
  );
  return (
    <Box padding="20px 0">
      <Box
        sx={{
          border: `2px dashed  ${theme.palette.boxShadow.main}`,
          cursor: 'pointer',
          position: 'relative',
          input: {
            display: 'block',
            width: '100%',
            opacity: 0,
            position: 'absolute',
            minHeight: '275px',
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDrop}
      >
        <input
          ref={input}
          type="file"
          disabled={limitReached}
          onChange={handleUpload}
          multiple
        ></input>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '25px',
            svg: {
              fontSize: '100px',
              marginTop: '15px',
            },
          }}
        >
          <Typography variant="overline">Drag & drop an image</Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={openFileFinder}
            disabled={limitReached}
            sx={{
              margin: 1,
            }}
          >
            Choose a file
          </Button>
          <Typography>(Limit 5)</Typography>
          <UploadFileRoundedIcon />
        </Box>
      </Box>
      <Stack padding="15px 0" direction="row" flexWrap="wrap">
        {files?.map((file) => (
          <FileUploadPreview
            key={file.id}
            fileIdentifier={file}
            defaultTileImageKey={defaultTileImageKey}
            removeFile={removeNewFile}
            setDefaultTileImage={(fileId) => setDefaultTileImageKey(fileId)}
          />
        ))}
        {preExistingImageUrls
          ?.filter((existingImage) => !filesToDelete.includes(existingImage))
          .map((url) => (
            <FileUploadPreview
              key={url}
              fileIdentifier={url}
              defaultTileImageKey={defaultTileImageKey}
              removeFile={handleFileDeletion}
              setDefaultTileImage={(fileId) => setDefaultTileImageKey(fileId)}
            />
          ))}
      </Stack>

      <Snackbar
        open={snackBarOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={closeSnackBar}
        autoHideDuration={4000}
        message={snackBarMessage}
        key={'bottom' + 'center'}
      />
    </Box>
  );
};

export default FileUpload;
