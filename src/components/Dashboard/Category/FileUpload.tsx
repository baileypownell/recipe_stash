import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
const { v4: uuidv4 } = require('uuid');

const fileCoverStyles = {
  position: 'absolute',
  backgroundColor: 'rgba(331, 68, 68, 0.2)',
  color: 'white',
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
  padding: '5px',
  transition: 'backgroundColor 0.4s',
  borderRadius: '5px',
};

const filePreviewStyles = {
  boxShadow: '5px 1px 30px #868686',
  flexGrow: 1,
  position: 'relative',
  height: '200px',
  minWidth: '200px',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  borderRadius: '5px',
  margin: '5px',
  flexGrow: 1,
  // [theme.breakpoints.up('lg')]: {
  //   width: '300px';
  // }
};

class FileUpload extends React.Component {
  state = {
    files: [],
    preExistingImageUrls: null,
    filesToDelete: [],
    defaultTileImageKey: null,
    defaultRemoved: false,
    snackBarOpen: false,
    snackBarMessage: '',
  };

  componentDidMount() {
    this.props.preExistingImageUrls?.subscribe((preExistingImageUrls) => {
      this.setState({
        preExistingImageUrls: preExistingImageUrls,
      });
    });

    if (this.props.defaultTileImageUUID) {
      this.setState(
        {
          defaultTileImageKey: this.props.defaultTileImageUUID,
        },
        () => this.props.passDefaultTileImage(this.state.defaultTileImageKey),
      );
    }
  }

  componentDidUpdate(prevProps) {
    // if going from true to false,
    // then clear the files and defaultTileImageKey state
    if (prevProps.open === true && this.props.open === false) {
      this.setState(
        {
          files: [],
          defaultTileImageKey: null,
        },
        () => {
          this.props.passFiles(this.state.files);
          this.props.passDefaultTileImage(this.state.defaultTileImageKey);
        },
      );
    }
  }

  openFileFinder = () => this.input.click();

  processFile(file) {
    const currentFiles = this.state.files;
    if (
      this.state.files.length +
        (this.state.preExistingImageUrls?.length || 0) ===
      5
    ) {
      this.openSnackBar('Only 5 images allowed per recipe.');
      return;
    }
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      currentFiles.push({
        file: file,
        id: uuidv4(),
      });
      this.setState(
        {
          files: currentFiles,
        },
        () => this.props.passFiles(this.state.files),
      );
    }
  }

  openSnackBar(message: string) {
    this.setState({
      snackBarOpen: true,
      snackBarMessage: message,
    });
  }

  closeSnackBar = () => {
    this.setState({
      snackBarOpen: false,
      snackBarMessage: '',
    });
  };

  handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.items.length >= 1) {
      Array.from(e.dataTransfer.files).forEach((file) =>
        this.processFile(file),
      );
    }
  };

  handleUpload = (e) => {
    Array.from(e.target.files).forEach((file) => this.processFile(file));
  };

  removeFile(fileId) {
    const updatedFileList = [];
    this.state.files.forEach((file) => {
      if (file.id !== fileId) {
        updatedFileList.push(file);
      }
    });
    this.setState(
      {
        files: updatedFileList,
      },
      () => {
        this.props.passFiles(this.state.files);
      },
    );
  }

  stageAWSFileDeletion(url) {
    const updatedFiles = this.state.preExistingImageUrls.filter(
      (u) => u !== url,
    );
    const filesToDelete = this.state.filesToDelete;
    filesToDelete.push(url);
    // compare the key from the url to props.defaultTileImageKey
    // if they are the same, then you need to set the state to null and update the parent
    const imageKey = url.split('amazonaws.com/')[1].split('?')[0];
    const isDefaultTileImage = imageKey === this.props.defaultTileImageUUID;
    if (isDefaultTileImage) {
      this.setState(
        {
          defaultTileImageKey: null,
          defaultRemoved: true,
        },
        () => this.props.passDefaultTileImage(this.state.defaultTileImageKey),
      );
    }
    this.setState(
      {
        preExistingImageUrls: updatedFiles,
        filesToDelete: filesToDelete,
      },
      () => {
        this.props.passFilesToDelete(filesToDelete);
      },
    );
  }

  setDefaultTileImage = (e) => {
    // get S3 key from id
    const imageKey = e.target.id.split('amazonaws.com/')[1].split('?')[0];
    if (imageKey === this.state.defaultTileImageKey) {
      this.setState(
        {
          defaultTileImageKey: null,
        },
        () => {
          this.props.passDefaultTileImage(this.state.defaultTileImageKey);
        },
      );
    } else if (imageKey === this.props.defaultTileImageUUID) {
      if (!this.state.defaultRemoved) {
        this.setState(
          {
            defaultTileImageKey: null,
            defaultRemoved: true,
          },
          () => this.props.passDefaultTileImage(this.state.defaultTileImageKey),
        );
      } else {
        this.setState(
          {
            defaultTileImageKey: imageKey,
          },
          () => this.props.passDefaultTileImage(this.state.defaultTileImageKey),
        );
      }
    } else {
      this.setState(
        {
          defaultTileImageKey: imageKey,
          defaultRemoved: true,
        },
        () => this.props.passDefaultTileImage(this.state.defaultTileImageKey),
      );
    }
  };

  setDefaultTileImageNew = (file) => {
    if (file.name === this.state.defaultTileImageKey?.fileName) {
      this.setState(
        {
          defaultTileImageKey: null,
        },
        () => this.props.passDefaultTileImage(this.state.defaultTileImageKey),
      );
    } else {
      this.setState(
        {
          defaultTileImageKey: { newFile: true, fileName: file.name },
          defaultRemoved: true,
        },
        () => this.props.passDefaultTileImage(this.state.defaultTileImageKey),
      );
    }
  };

  determineIfChecked = (url) => {
    // compare key in url to the present key
    const key = url.split('amazonaws.com/')[1].split('?')[0];
    if (
      key === this.state.defaultTileImageKey ||
      (key === this.props.defaultTileImageUUID && !this.state.defaultRemoved)
    ) {
      return true;
    } else {
      return false;
    }
  };

  determineIfCheckedNew = (file) => {
    // compare file name to the present key
    if (file.name === this.state.defaultTileImageKey?.fileName) {
      return true;
    } else {
      return false;
    }
  };

  input = React.createRef();

  render() {
    const { preExistingImageUrls, files, snackBarMessage, snackBarOpen } =
      this.state;
    const limitReached =
      files.length + (preExistingImageUrls?.length || 0) === 5;
    return (
      <Box padding="20px 0">
        <Box
          sx={{
            border: '2px dashed #dbdbdb',
            cursor: 'pointer',
            position: 'relative',
            input: {
              minHeight: '300px',
              display: 'block',
              width: '100%',
              opacity: 0,
              position: 'absolute',
              minHeight: '275px',
            },
          }}
          onDrop={this.handleDrop}
          onDragOver={this.handleDrop}
        >
          <input
            ref={(i) => (this.input = i)}
            type="file"
            id="input"
            disabled={limitReached}
            onChange={this.handleUpload}
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
              onClick={this.openFileFinder}
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
          {Array.from(files)?.map((file, index) => (
            <Box
              key={file.id}
              sx={filePreviewStyles}
              style={{
                backgroundImage: `url(${URL.createObjectURL(file.file)})`,
              }}
            >
              <Box sx={fileCoverStyles}>
                <FormControlLabel
                  value="end"
                  control={
                    <Checkbox
                      checked={this.determineIfCheckedNew(file.file)}
                      id={file.id}
                      onChange={(e) => this.setDefaultTileImageNew(file.file)}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  }
                  label="Use as tile background image"
                  labelPlacement="end"
                />
                <IconButton
                  color="info"
                  onClick={(e) => this.removeFile(file.id)}
                  sx={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                  }}
                >
                  <DeleteRoundedIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
          {preExistingImageUrls?.map((url, index) => (
            <Box
              sx={filePreviewStyles}
              key={index}
              style={{ backgroundImage: `url(${url})` }}
            >
              <Box sx={fileCoverStyles}>
                <FormControlLabel
                  value="end"
                  control={
                    <Checkbox
                      checked={this.determineIfChecked(url)}
                      id={url}
                      onChange={(e) => this.setDefaultTileImage(e)}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  }
                  label="Use as tile background image"
                  labelPlacement="end"
                />
                <IconButton
                  color="info"
                  onClick={(e) => this.stageAWSFileDeletion(url)}
                  sx={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                  }}
                >
                  <DeleteRoundedIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>

        <Snackbar
          open={snackBarOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          onClose={this.closeSnackBar}
          autoHideDuration={4000}
          message={snackBarMessage}
          key={'bottom' + 'center'}
        />
      </Box>
    );
  }
}

export default FileUpload;
