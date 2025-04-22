
export interface IFileUploader {
    uploadFile(filePath: string, options?: { folder?: string }): Promise<string | null>;
  }