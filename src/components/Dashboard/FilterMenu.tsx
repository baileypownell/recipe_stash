import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

export const FilterMenu = ({
  numberOfSelectedFilters,
  filters,
  categories,
  appliedFilt,
  appliedCat,
  filter,
  filterByCategory,
  clearFilters,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        sx={{
          backgroundColor: 'white',
          color: theme.palette.gray.main,
          '&:hover': {
            backgroundColor: 'white',
          },
        }}
        aria-controls="menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Stack direction="row" alignItems="center">
          <Typography variant="body2" sx={{ marginRight: '5px' }}>
            Filter
          </Typography>
          {numberOfSelectedFilters > 0 ? (
            <Typography variant="body2">({numberOfSelectedFilters})</Typography>
          ) : (
            <FilterListRoundedIcon />
          )}
        </Stack>
      </Button>
      <Menu
        id="menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Stack direction="column" alignItems="center" paddingBottom={1}>
          <Stack direction="row" spacing={2} minWidth="200px">
            <Box>
              <Stack
                padding="10px"
                direction="row"
                justifyContent="space-between"
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', padding: '0!important' }}
                >
                  Features
                </Typography>
                <FilterListRoundedIcon />
              </Stack>
              <Divider />
              {filters.map((item, index) => {
                return (
                  <MenuItem
                    key={index}
                    sx={{
                      paddingRight: 0,
                    }}
                    onClick={() => filter(item.key)}
                  >
                    <Stack
                      justifyContent="space-between"
                      alignItems="center"
                      direction="row"
                      width="100%"
                    >
                      {item.name}
                      <Checkbox
                        checked={appliedFilt[item.key]}
                        id={item.key}
                        color="orange"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
                    </Stack>
                  </MenuItem>
                );
              })}
            </Box>

            <Box>
              <Stack
                padding="10px"
                direction="row"
                justifyContent="space-between"
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', padding: '0!important' }}
                >
                  Categories
                </Typography>
                <FilterListRoundedIcon />
              </Stack>
              <Divider />
              {categories.map((item, index) => {
                return (
                  <MenuItem
                    key={index}
                    sx={{
                      paddingRight: 0,
                    }}
                    onClick={() => filterByCategory(item.key)}
                  >
                    <Stack
                      justifyContent="space-between"
                      alignItems="center"
                      direction="row"
                      width="100%"
                    >
                      {item.name}
                      <Checkbox
                        checked={appliedCat[item.key]}
                        id={item.key}
                        color="orange"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
                    </Stack>
                  </MenuItem>
                );
              })}
            </Box>
          </Stack>

          <Button
            sx={{
              svg: {
                color: theme.palette.primary.main,
              },
            }}
            onClick={clearFilters}
            size="small"
            variant="outlined"
            startIcon={<ClearIcon />}
          >
            Clear All
          </Button>
        </Stack>
      </Menu>
    </>
  );
};

export default FilterMenu;
