import { NewFile } from '../../../models/images';
interface FileUploadPreviewProps {
    defaultTileImageKey: string | null;
    fileIdentifier: NewFile | string;
    setDefaultTileImage: (fileId: string | null) => void;
    removeFile: (fileId: string) => void;
}
export declare const FileUploadPreview: ({ defaultTileImageKey, fileIdentifier, setDefaultTileImage, removeFile, }: FileUploadPreviewProps) => import("react/jsx-runtime").JSX.Element;
export {};
