import { FilterListRoundedIcon } from '@icons';
import { ClearIcon } from '@icons';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Indicator,
  Stack,
  ActionIcon,
  Popover,
  Text,
  Group,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 767.95);
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 767.95);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <Box style={{ minWidth: isNarrow ? 0 : 180, width: isNarrow ? '100%' : undefined }}>
      <Box>
        <Text fw={700}>{title}</Text>
      </Box>
      <Stack gap="xs">
        {items.map((item: FilterMenuItem) => (
          <Checkbox
            key={item.name}
            checked={applied[item.key]}
            id={item.key}
            onChange={() => onChange(item.key)}
            size="sm"
            label={item.name}
          />
        ))}
      </Stack>
    </Box>
  );

  return (
    <Popover opened={open} onChange={setOpen} position="bottom-end" shadow="md">
      <Popover.Target>
        <ActionIcon
          aria-describedby="filter-menu"
          onClick={() => setOpen((current) => !current)}
          size="lg"
          radius="md"
          style={{
            color: mantineTheme.white,
            boxShadow: theme.other.app.shadows.toolbar,
          }}
        >
          <Indicator
            disabled={!numberOfSelectedFilters}
            label={numberOfSelectedFilters}
            size={16}
          >
            <FilterListRoundedIcon />
          </Indicator>
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown
        style={{
          minWidth: isNarrow ? 'calc(100vw - 32px)' : 'min(520px, calc(100vw - 32px))',
          padding: mantineTheme.spacing.md,
          border: `1px solid ${theme.other.app.borders.subtle}`,
          borderRadius: 8,
          boxShadow: theme.other.app.shadows.overlay,
        }}
      >
        <Stack gap="md">
          <Group
            align="flex-start"
            gap="xl"
            style={{
              flexDirection: isNarrow ? 'column' : undefined,
              alignItems: isNarrow ? 'stretch' : 'flex-start',
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
          </Group>

          <Divider />
          <Group justify="space-between">
            <Text size="sm">
              {numberOfSelectedFilters
                ? `${numberOfSelectedFilters} selected`
                : 'No filters selected'}
            </Text>
            <Button
              onClick={clearFilters}
              size="sm"
              variant="outline"
              leftSection={<ClearIcon />}
              disabled={!numberOfSelectedFilters}
            >
              Clear All
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default FilterMenu;
