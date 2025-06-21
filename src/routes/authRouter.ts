import { Router } from "express";
import tryCatch from "../utils/tryCatch";
import authControllers from "../controllers/AuthControllers";
import authMiddleware from "../middleware/authMiddleware";

const authRouter = Router();

authRouter.post("/signup", tryCatch(authControllers.registration));
authRouter.post("/signin", tryCatch(authControllers.login));
authRouter.post("/signin/new_token", tryCatch(authControllers.refreshToken));
authRouter.get(
  "/logout",
  authMiddleware,
  tryCatch(authControllers.logout)
);
authRouter.get(
  "/info",
  authMiddleware,
  tryCatch(authControllers.getUserInfo)
);

export default authRouter;
