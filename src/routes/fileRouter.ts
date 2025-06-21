import { Router } from "express";
import tryCatch from "../utils/tryCatch";
import authMiddleware from "../middleware/authMiddleware";
import fileControllers from "../controllers/FileControllers";

const fileRouter = Router();

fileRouter.post(
  "/upload",
  authMiddleware,
  tryCatch(fileControllers.createFile)
);

fileRouter.put(
  "/update/:id",
  authMiddleware,
  tryCatch(fileControllers.updateFile)
);

fileRouter.delete(
  "/delete/:id",
  authMiddleware,
  tryCatch(fileControllers.deleteFile)
);

fileRouter.get(
  "/list",
  authMiddleware,
  tryCatch(fileControllers.getFileList)
);

fileRouter.get(
  "/:id",
  authMiddleware,
  tryCatch(fileControllers.getFile)
);


fileRouter.get(
  "/download/:id",
  authMiddleware,
  tryCatch(fileControllers.downloadFile)
);

export default fileRouter;