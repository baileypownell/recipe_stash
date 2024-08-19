import { ExistingFileUpload, NewFileUpload } from '../../../models/images';
interface FileUploadProps {
    defaultTileImageUUID?: string | null;
    passFiles: (files: (NewFileUpload | ExistingFileUpload)[]) => void;
    preExistingImageUrls?: string[];
}
declare const FileUpload: ({ passFiles, preExistingImageUrls, defaultTileImageUUID, }: FileUploadProps) => import("react/jsx-runtime").JSX.Element;
export default FileUpload;
