import { Router } from "express";

import multer from "multer";

export default class UploadRouter {
  private upload: multer.Multer;
  private authMiddleware: any;

  constructor(authMiddleware: any, fileUploadPath: string) {
    this.authMiddleware = authMiddleware;

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, fileUploadPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = file.mimetype.split("/")[1];
        cb(null, `${uniqueSuffix}.${ext}`);
      }
    });

    const multerFilter = (req, file, cb) => {
      if (file.mimetype.split("/")[1] === "pdf") {
        cb(null, true);
      } else {
        cb(new Error("O arquivo deve ser um PDF!"), false);
      }
    };

    this.upload = multer({
      storage,
      fileFilter: multerFilter,
    });
  }

  public create(): Router {
    const router = Router();

    router.post(
      "/single",
      [
        this.authMiddleware.authenticate,
        this.authMiddleware.isAuthenticated,
        this.upload.single("file"),
      ],
      async (req, res) => {
        return res.status(200).json({ fileName: req.file.filename });
      },
    );

    return router;
  }
}

