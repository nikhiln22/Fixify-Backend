import multer from "multer";
import path from "path";
import fs from "fs";

export class LocalUpload {
  private uploadPath: string;
  public upload;
  public technicianQualificationUpload;

  constructor() {
    this.uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
    
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
      },
    });
    
    this.upload = multer({ storage });
    
    
    this.technicianQualificationUpload = this.upload.fields([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'certificates', maxCount: 5 }
    ]);
  }
}