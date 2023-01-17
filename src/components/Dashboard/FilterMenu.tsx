import {
  Box,
  Button,
  Checkbox,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';

export default function FilterMenu(props: {
  numberOfSelectedFilters: number;
  filters: any[];
  categories: any[];
  appliedFilt: any;
  appliedCat: any;
  filter: Function;
  filterByCategory: Function;
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

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
          color: '#353531',
          '&:hover': {
            backgroundColor: 'white',
          },
        }}
        aria-controls="menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Stack direction="row" alignItems="center">
          <Typography variant="body2" sx={{ marginRight: '20px' }}>
            Filter
          </Typography>
          {props.numberOfSelectedFilters > 0 ? (
            <Typography variant="body2">
              ({props.numberOfSelectedFilters})
            </Typography>
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
            {props.filters.map((item, index) => {
              return (
                <MenuItem
                  key={index}
                  sx={{
                    paddingRight: 0,
                  }}
                  onClick={() => props.filter(item.key)}
                >
                  <Stack
                    justifyContent="space-between"
                    alignItems="center"
                    direction="row"
                    width="100%"
                  >
                    {item.name}
                    <Checkbox
                      checked={props.appliedFilt[item.key]}
                      id={item.key}
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
            {props.categories.map((item, index) => {
              return (
                <MenuItem
                  key={index}
                  sx={{
                    paddingRight: 0,
                  }}
                  onClick={() => props.filterByCategory(item.key)}
                >
                  <Stack
                    justifyContent="space-between"
                    alignItems="center"
                    direction="row"
                    width="100%"
                  >
                    {item.name}
                    <Checkbox
                      checked={props.appliedCat[item.key]}
                      id={item.key}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  </Stack>
                </MenuItem>
              );
            })}
          </Box>
        </Stack>
      </Menu>
    </>
  );
}
