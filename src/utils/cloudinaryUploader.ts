import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { IFileUploader } from "../interfaces/IfileUploader/IfileUploader";
import "../config/cloudinaryConfig";

export class CloudinaryUploader implements IFileUploader {
  constructor(private defaultFolder: string = "fixify") {}

  async uploadFile(
    filePath: string,
    options: { folder?: string } = {}
  ): Promise<string | null> {
    const folder = options.folder || this.defaultFolder;

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: "auto",
      });

      this.cleanupFile(filePath);

      console.log(
        "result from the upload file method in the cloudinary uploader class:",
        result
      );

      return result.public_id;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);

      this.cleanupFile(filePath);

      return null;
    }
  }

  private cleanupFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
