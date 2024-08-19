export interface UploadedFileResult {
    awsKey: string;
    file: NewFileUpload;
}
export interface ExistingFileUpload {
    isDefault: boolean;
    url: string;
}
export interface NewFileUpload {
    file: File;
    isDefault: boolean;
    backgroundImage: string;
}
