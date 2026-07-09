import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Popover,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { BaseStringAccessibleObjectBoolean } from '../../services/recipe-services';

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

  const renderFilterGroup = ({
    title,
    items,
    applied,
    onChange,
  }: {
    title: string;
    items: FilterMenuItem[];
    applied: BaseStringAccessibleObjectBoolean;
    onChange: (key: string) => void;
  }) => (
    <Box
      sx={{
        minWidth: {
          xs: '100%',
          sm: 0,
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          marginBottom: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: theme.palette.gray.main,
            fontWeight: 800,
            fontSize: '0.9rem',
            letterSpacing: 0,
          }}
        >
          {title}
        </Typography>
      </Stack>
      <Divider sx={{ marginBottom: 0.75 }} />
      <FormGroup
        sx={{
          gap: 0.25,
        }}
      >
        {items.map((item: FilterMenuItem) => (
          <FormControlLabel
            key={item.name}
            control={
              <Checkbox
                checked={applied[item.key]}
                id={item.key}
                onChange={() => onChange(item.key)}
                size="small"
                sx={{
                  padding: 0.5,
                }}
              />
            }
            label={item.name}
            sx={{
              marginLeft: -0.75,
              marginRight: 0,
              minHeight: 30,
              '.MuiFormControlLabel-label': {
                fontSize: '0.86rem',
                fontWeight: applied[item.key] ? 700 : 500,
                color: theme.palette.gray.main,
              },
            }}
          />
        ))}
      </FormGroup>
    </Box>
  );

  return (
    <>
      <IconButton
        aria-describedby="filter-menu"
        onClick={handleClick}
        sx={{
          px: 1.25,
          color: theme.palette.primary.dark,
        }}
      >
        <Badge
          badgeContent={numberOfSelectedFilters || null}
          color="primary"
          sx={{
            '.MuiBadge-badge': {
              fontSize: '0.65rem',
              minWidth: 16,
              height: 16,
            },
          }}
        >
          <FilterListRoundedIcon />
        </Badge>
      </IconButton>
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
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              ...theme.surfaces.quiet,
              width: {
                xs: 'calc(100vw - 32px)',
                sm: 360,
              },
              maxWidth: 'calc(100vw - 32px)',
              marginTop: 1,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Stack
          direction="column"
          sx={{
            padding: 2,
          }}
        >
          <Stack
            direction="row"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 1.5,
              alignItems: 'flex-start',
            }}
          >
            {renderFilterGroup({
              title: 'Tags',
              items: filters,
              applied: appliedFilt,
              onChange: filter,
            })}
            {renderFilterGroup({
              title: 'Categories',
              items: categories,
              applied: appliedCat,
              onChange: filterByCategory,
            })}
          </Stack>

          <Divider sx={{ width: '100%', marginTop: 1.5, marginBottom: 1.25 }} />
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.gray.main, 0.66),
                fontWeight: 600,
              }}
            >
              {numberOfSelectedFilters
                ? `${numberOfSelectedFilters} selected`
                : 'No filters selected'}
            </Typography>
            <Button
              onClick={clearFilters}
              size="small"
              variant="outlined"
              startIcon={<ClearIcon />}
              disabled={!numberOfSelectedFilters}
            >
              Clear All
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};

export default FilterMenu;
