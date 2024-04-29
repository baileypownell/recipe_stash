/// <reference types="react" />
import { NewFile } from '../../../models/images';
interface FileUploadProps {
    passDefaultTileImage: (key: string | null) => void;
    preExistingImageUrls?: string[];
    defaultTileImageUUID?: string | null;
    passFiles: (files: (File | NewFile)[]) => void;
    passFilesToDelete?: (files: string[]) => void;
}
declare const FileUpload: ({ passDefaultTileImage, preExistingImageUrls, defaultTileImageUUID, passFiles, passFilesToDelete, }: FileUploadProps) => JSX.Element;
export default FileUpload;
