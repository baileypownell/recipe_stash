import {
  Box, Checkbox, ActionIcon, rgba, useMantineTheme, 
  Group} from '@mantine/core';
import type { ChangeEvent } from 'react';
import type { CSSProperties } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, UseFieldArrayRemove } from 'react-hook-form';
import { DeleteRoundedIcon } from '@icons';
import type { ExistingFileUpload, NewFileUpload } from '../../../models/images';

interface ImagePreviewProps {
  item: (NewFileUpload | ExistingFileUpload) & { id: string };
  control: Control<{
    defaultTileImageUUID: string | null | undefined;
    files: NewFileUpload[];
    preExistingFiles: ExistingFileUpload[];
  }>;
  index: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  remove: UseFieldArrayRemove;
  backgroundImageUrl: string;
}

export const ImagePreview = ({
  item,
  control,
  index,
  onChange,
  remove,
  backgroundImageUrl,
}: ImagePreviewProps) => {
  const theme = useMantineTheme();
  const filePreviewStyles: CSSProperties = {
    boxShadow: theme.other.app.shadows.preview,
    flexGrow: 1,
    position: 'relative',
    height: '200px',
    minWidth: '200px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    borderRadius: theme.radius.sm,
    margin: theme.spacing.sm,
  };
  const fileCoverStyles: CSSProperties = {
    position: 'absolute',
    backgroundColor: rgba(theme.other.app.palette.gray.main, 0.33),
    justifyContent: 'space-between',
    alignItems: 'start',
    color: theme.white,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    padding: theme.spacing.sm,
    transition: 'backgroundColor 0.4s',
    borderRadius: theme.radius.sm,
  };
  return (
    <Controller
      key={item.id}
      name={`files.${index}`}
      control={control}
      render={() => {
        return (
          <Box
            style={{
              ...filePreviewStyles,
              backgroundImage: `url(${backgroundImageUrl})`,
            }}
          >
            <Group style={fileCoverStyles}>
              <Checkbox
                onChange={onChange}
                checked={item.isDefault}
                aria-label="primary checkbox"
                label="Use as tile background image"
              />
              <ActionIcon
                color="gray"
                onClick={() => remove(index)}
              >
                <DeleteRoundedIcon />
              </ActionIcon>
            </Group>
          </Box>
        );
      }}
    />
  );
};
