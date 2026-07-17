import { UploadFileRoundedIcon } from '@icons';
import { Box, Button, Text, Group, useMantineTheme } from '@mantine/core';
import { useEffect, useRef } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { ImagePreview } from './ImagePreview';
import type { ExistingFileUpload, NewFileUpload } from '../../../models/images';

const getDefaultState = (
  i: number,
  index: number,
  checked: boolean,
  file: NewFileUpload | ExistingFileUpload,
): boolean => {
  // return i === index
  //   ? checked
  //     ? true
  //     : false
  //   : checked
  //   ? false
  //   : file.isDefault;
  return i === index ? checked : checked ? false : file.isDefault;
};

interface FileUploadProps {
  defaultTileImageUUID?: string | null;
  passFiles: (files: (NewFileUpload | ExistingFileUpload)[]) => void;
  preExistingImageUrls?: string[];
}

const FileUpload = ({
  passFiles,
  preExistingImageUrls,
  defaultTileImageUUID,
}: FileUploadProps) => {
  const theme = useMantineTheme();
  const input = useRef<HTMLInputElement | null>(null);
  const { control, watch, setValue } = useForm<{
    defaultTileImageUUID: string | null | undefined;
    files: NewFileUpload[];
    preExistingFiles: ExistingFileUpload[];
  }>({
    defaultValues: {
      files: [],
      preExistingFiles: preExistingImageUrls
        ? preExistingImageUrls.map((url) => ({
            url,
            isDefault: defaultTileImageUUID
              ? url.includes(defaultTileImageUUID)
              : false,
          }))
        : [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'files',
  });
  const { fields: existingFiles, remove: removeExistingFile } = useFieldArray({
    control,
    name: 'preExistingFiles',
  });

  const files = watch('files');
  const preExistingFiles = watch('preExistingFiles');

  useEffect(() => {
    const combinedFiles = [...files, ...preExistingFiles].filter(
      (file) => file !== undefined,
    );
    passFiles(combinedFiles);
  }, [files, preExistingFiles, passFiles]);

  const openFileFinder = () => {
    input.current?.click();
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) {
      return;
    }

    append(
      Array.from(fileList).map((file) => ({
        file,
        backgroundImage: URL.createObjectURL(file),
        isDefault: false,
      })),
    );
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  };

  return (
    <Box>
      <Box
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        style={{
          border: `1px dashed ${theme.colors.gray[4]}`,
          borderRadius: theme.radius.sm,
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.gray[0],
        }}
      >
        <input
          ref={input}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          disabled={false}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            addFiles(e.target.files);
          }}
          multiple
          title="Upload a file"
          style={{ display: 'none' }}
        />
        <Group
          justify="space-between"
          align="center"
          gap="md"
        >
          <Box>
            <Text size="sm" fw={500}>Images</Text>
            <Text size="xs" c="dimmed">Drop images here or choose files</Text>
          </Box>
          <Button
            variant="outline"
            color="dark"
            onClick={openFileFinder}
            disabled={false}
            leftSection={<UploadFileRoundedIcon />}
          >
            Choose files
          </Button>
        </Group>
      </Box>
      <Group mt="md">
        {fields.map((item, index) => (
          <ImagePreview
            key={item.id}
            item={item}
            index={index}
            remove={remove}
            control={control}
            backgroundImageUrl={item.backgroundImage}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setValue(
                'files',
                files.map((file, i) => {
                  return {
                    ...file,
                    isDefault: getDefaultState(
                      i,
                      index,
                      e.target.checked,
                      file,
                    ),
                  };
                }),
              );

              if (existingFiles.length) {
                setValue(
                  'preExistingFiles',
                  preExistingFiles.map((file) => ({
                    ...file,
                    isDefault: false,
                  })),
                );
              }
            }}
          />
        ))}

        {existingFiles.map((item, index) => (
          <ImagePreview
            item={item}
            key={item.id}
            control={control}
            remove={removeExistingFile}
            index={index}
            backgroundImageUrl={item.url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setValue(
                'preExistingFiles',
                preExistingFiles.map((file, i) => {
                  return {
                    ...file,
                    isDefault: getDefaultState(
                      i,
                      index,
                      e.target.checked,
                      file,
                    ),
                  };
                }),
              );

              if (fields.length) {
                setValue(
                  'files',
                  files.map((file) => ({
                    ...file,
                    isDefault: false,
                  })),
                );
              }
            }}
          />
        ))}
      </Group>
    </Box>
  );
};

export default FileUpload;
