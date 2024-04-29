declare const uploadSingleAWSFile: (req: any, res: any) => Promise<unknown>;
declare const getPresignedUrls: (image_uuids: any) => any;
declare const getPresignedUrl: (uuid: any) => string;
declare const deleteAWSFiles: (awsKeys: any) => Promise<any[]>;
declare const deleteSingleAWSFile: (imageKey: any) => Promise<unknown>;
export { getPresignedUrls, getPresignedUrl, uploadSingleAWSFile, deleteAWSFiles, deleteSingleAWSFile, };
