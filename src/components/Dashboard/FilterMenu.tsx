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
import type { MouseEvent } from 'react';
import type {
  BaseStringAccessibleObjectBoolean,
} from '../../services/recipe-services';

interface FilterMenuItem {
  key: string;
  name: string;
}

interface FilterMenuProps {
  numberOfSelectedFilters: number;
  filters: FilterMenuItem[];
  categories: FilterMenuItem[];
  appliedFilt: BaseStringAccessibleObjectBoolean;
  appliedCat: BaseStringAccessibleObjectBoolean;
  filter: (key: string) => void;
  filterByCategory: (key: string) => void;
  clearFilters: () => void;
}

export const FilterMenu = ({
  numberOfSelectedFilters,
  filters,
  categories,
  appliedFilt,
  appliedCat,
  filter,
  filterByCategory,
  clearFilters,
}: FilterMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button aria-describedby="filter-menu" onClick={handleClick}>
        <Stack direction="row" sx={{
          alignItems: "center"
        }}>
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
          sx={{
            alignItems: "center",
            paddingBottom: 1,
            paddingRight: 2,
            paddingLeft: 2
          }}>
          <Stack direction="row" spacing={2}>
            <Box sx={{
              minWidth: "150px"
            }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  p: 1
                }}>
                Tags
              </Typography>
              <Divider />
              <FormGroup>
                {filters.map((item: FilterMenuItem) => {
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

            <Box sx={{
              minWidth: "150px"
            }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  p: 1
                }}>
                Categories
              </Typography>
              <Divider />
              <FormGroup>
                {categories.map((item: FilterMenuItem) => {
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
