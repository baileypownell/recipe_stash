import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  useTheme,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

export const ImagePreview = ({
  item,
  control,
  index,
  onChange,
  remove,
  backgroundImageUrl,
}) => {
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
  return (
    <Controller
      key={item.id}
      name={`files.${index}`}
      control={control}
      render={() => {
        return (
          <Box
            sx={filePreviewStyles}
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
            }}
          >
            <Box sx={fileCoverStyles}>
              <FormControlLabel
                value="end"
                control={
                  <Checkbox
                    onChange={onChange}
                    checked={item.isDefault}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label="Use as tile background image"
                labelPlacement="end"
              />
              <IconButton
                color="info"
                onClick={() => remove(index)}
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
      }}
    />
  );
};
