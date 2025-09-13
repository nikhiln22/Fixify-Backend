import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { LocalUpload } from "../config/multerConfig";
import { CategoryController } from "../controllers/categoryController";

export class CategoryRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;
  private localUpload: LocalUpload;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.localUpload = new LocalUpload();
    this.setupRoutes();
  }

  private setupRoutes() {
    const categoryController = container.resolve(CategoryController);

    this.router.get(
      "/",
      this.authMiddleware.authenticate(Roles.USER,Roles.ADMIN),
      categoryController.getAllCategory.bind(categoryController)
    );

    this.router.post(
      "/",
      this.authMiddleware.authenticate(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      categoryController.addCategory.bind(categoryController)
    );

    this.router.put(
      "/:categoryId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      categoryController.editCategory.bind(categoryController)
    );

    this.router.patch(
      "/:categoryId/status",
      this.authMiddleware.authenticate(Roles.ADMIN),
      categoryController.toggleCategoryStatus.bind(categoryController)
    );
  }

  public getRouter() {
    return this.router;
  }
}
