import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { ImagePreview } from './ImagePreview';
import { ExistingFileUpload, NewFileUpload } from '../../../models/images';

const getDefaultState = (
  i: number,
  index: number,
  checked: boolean,
  file: any,
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
  const input = useRef(null);
  const theme = useTheme();
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
  }, [fields, existingFiles]);

  const openFileFinder = () => {
    if (input.current) (input.current as any).click();
  };

  const handleDrop = (e): void => {
    e.preventDefault();
    e.stopPropagation();
    const fileList: FileList = e.dataTransfer.files;
    if (!fileList.length) {
      return;
    }
    append(
      Array.from(e.dataTransfer.files as FileList).map((file) => ({
        file,
        backgroundImage: URL.createObjectURL(file),
        isDefault: false,
      })),
    );
  };

  return (
    <Box padding="20px 0">
      <Box
        sx={{
          border: `2px dashed  ${theme.palette.boxShadow.main}`,
          cursor: 'pointer',
          position: 'relative',
          input: {
            display: 'block',
            width: '100%',
            opacity: 0,
            position: 'absolute',
            minHeight: '275px',
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDrop}
      >
        <input
          ref={input}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          disabled={false}
          onChange={(e) => {
            append(
              Array.from(e.target.files as FileList).map((file) => ({
                file,
                backgroundImage: URL.createObjectURL(file),
                isDefault: false,
              })),
            );
          }}
          multiple
          title="Upload a file"
        ></input>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '25px',
            svg: {
              fontSize: '100px',
              marginTop: '15px',
            },
          }}
        >
          <Typography variant="overline">Drag & drop an image</Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={openFileFinder}
            disabled={false}
            sx={{
              margin: 1,
            }}
          >
            Choose a file
          </Button>
          {/* <Typography>(Limit 5)</Typography> */}
          <UploadFileRoundedIcon />
        </Box>
      </Box>
      <Stack padding="15px 0" direction="row" flexWrap="wrap">
        {fields.map((item, index) => (
          <ImagePreview
            key={item.id}
            item={item}
            index={index}
            remove={remove}
            control={control}
            backgroundImageUrl={item.backgroundImage}
            onChange={(e) => {
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
            onChange={(e) => {
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
      </Stack>
    </Box>
  );
};

export default FileUpload;
