import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Popover,
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
  const open = Boolean(anchorEl);
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
        aria-describedby="filter-menu"
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
      <Popover
        id="filter-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Stack
          direction="column"
          alignItems="center"
          paddingBottom={1}
          paddingRight={2}
          paddingLeft={2}
        >
          <Stack direction="row" spacing={2}>
            <Box minWidth="150px">
              <Typography variant="body1" fontWeight="bold" p={1}>
                Tags
              </Typography>
              <Divider />
              <FormGroup>
                {filters.map((item) => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          tabIndex={0}
                          checked={appliedFilt[item.key]}
                          onChange={() => filter(item.key)}
                        />
                      }
                      label={item.name}
                      key={item.name}
                    />
                  );
                })}
              </FormGroup>
            </Box>

            <Box minWidth="150px">
              <Typography variant="body1" fontWeight="bold" p={1}>
                Categories
              </Typography>
              <Divider />
              <FormGroup>
                {categories.map((item) => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={appliedCat[item.key]}
                          id={item.key}
                          onChange={() => filterByCategory(item.key)}
                        />
                      }
                      label={item.name}
                      key={item.name}
                    />
                  );
                })}
              </FormGroup>
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
      </Popover>
    </>
  );
};

export default FilterMenu;
