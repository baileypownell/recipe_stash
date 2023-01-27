import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  useTheme,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { NewFile } from '../../../models/images';

interface FileUploadPreviewProps {
  defaultTileImageKey: string;
  fileIdentifier: NewFile | string;
  setDefaultTileImage: (fileId: string | null) => void;
  removeFile: (fileId: string) => void;
}

export const FileUploadPreview = ({
  defaultTileImageKey,
  fileIdentifier,
  setDefaultTileImage,
  removeFile,
}: FileUploadPreviewProps) => {
  const theme = useTheme();
  const filePreviewStyles = {
    boxShadow: `5px 1px 30px ${theme.palette.boxShadow.main}`,
    flexGrow: 1,
    position: 'relative',
    height: '200px',
    minWidth: '200px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    borderRadius: '5px',
    margin: '5px',
  };
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

  const determineCheckedState = (url: string): boolean => {
    const key = url.split('amazonaws.com/')[1].split('?')[0];
    return key === defaultTileImageKey;
  };

  if (typeof fileIdentifier === 'string') {
    return (
      <Box
        key={fileIdentifier}
        sx={filePreviewStyles}
        style={{
          backgroundImage: `url(${fileIdentifier})`,
        }}
      >
        <Box sx={fileCoverStyles}>
          <FormControlLabel
            value="end"
            control={
              <Checkbox
                checked={determineCheckedState(fileIdentifier)}
                id={fileIdentifier}
                onChange={(e) =>
                  setDefaultTileImage(
                    e.target.checked
                      ? fileIdentifier.split('amazonaws.com/')[1].split('?')[0]
                      : null,
                  )
                }
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            }
            label="Use as tile background image"
            labelPlacement="end"
          />
          <IconButton
            color="info"
            onClick={(e) => removeFile(fileIdentifier)}
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
    );
  } else {
    return (
      <Box
        key={fileIdentifier.id}
        sx={filePreviewStyles}
        style={{
          backgroundImage: `url(${URL.createObjectURL(fileIdentifier.file)})`,
        }}
      >
        <Box sx={fileCoverStyles}>
          <FormControlLabel
            value="end"
            control={
              <Checkbox
                checked={fileIdentifier.id === defaultTileImageKey}
                id={fileIdentifier.id}
                onChange={(e) =>
                  setDefaultTileImage(
                    e.target.checked ? fileIdentifier.id : null,
                  )
                }
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            }
            label="Use as tile background image"
            labelPlacement="end"
          />
          <IconButton
            color="info"
            onClick={(e) => removeFile(fileIdentifier.id)}
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
    );
  }
};
