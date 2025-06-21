import * as jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { IGetUserAuthInfoRequest } from "../types/authRequest";
import { DataForRefreshToken, UserRow } from "../types/database/UserRow";
import { User } from "../models/UserModels";
import { REFRESH_SECRET_KEY } from "../utils/envConst";

const authMiddleware = async (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.method === "OPTIONS") {
    next();
    return;
  }
  const refreshToken = req.cookies.refresh_token ?? "";
  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token is missing." });
    return;
  }
  try {
    const decoded = jwt.verify(
      refreshToken,
      REFRESH_SECRET_KEY
    ) as DataForRefreshToken;

    const user = (await User.findOne({
      where: { id: decoded.userId },
      raw: true,
    })) as null | UserRow;
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token." });
    return;
  }
};

export default authMiddleware;
