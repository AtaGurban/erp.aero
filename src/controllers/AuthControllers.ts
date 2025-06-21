import { NextFunction, Response, Request } from "express";
import ApiError from "../error/ApiError";
import authDao from "../dao/AuthDao/AuthDao";
import { authSchema } from "../service/zod/auth";
import { IGetUserAuthInfoRequest } from "../types/authRequest";
import * as jwt from "jsonwebtoken";
import { REFRESH_SECRET_KEY } from "../utils/envConst";
import { DataForRefreshToken } from "../types/database/UserRow";

class AuthControllers {
  async registration(req: Request, res: Response, next: NextFunction) {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(ApiError.badRequest("Incomplete data"));
    }
    const { success, data, message } = await authDao.registration(parsed.data);
    if (!success || !data) {
      return next(ApiError.badRequest(message));
    }
    const getTokenResult = await authDao.prevSaveTokensInCookie(
      req,
      res,
      data.id
    );
    if (!getTokenResult.success || !getTokenResult.data) {
      return next(ApiError.badRequest(getTokenResult.message));
    }
    return res.json(getTokenResult.data);
  }
  async login(req: Request, res: Response, next: NextFunction) {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(ApiError.badRequest("Incomplete data"));
    }
    const { success, data, message } = await authDao.login(parsed.data);
    if (!success || !data) {
      return next(ApiError.badRequest(message));
    }
    const getTokenResult = await authDao.prevSaveTokensInCookie(
      req,
      res,
      data.id
    );
    if (!getTokenResult.success) {
      return next(ApiError.badRequest(getTokenResult.message));
    }
    return res.sendStatus(200);
  }
  async logout(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const { success, message } = await authDao.logout(req, res);
    if (!success) {
      return next(ApiError.badRequest(message));
    }
    return res.sendStatus(200);
  }
  async refreshToken(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const refreshToken = req.cookies.refresh_token ?? "";
    if (!refreshToken) {
      return next(ApiError.badRequest("Refresh token is missing."));
    }
    const decoded = jwt.verify(
      refreshToken,
      REFRESH_SECRET_KEY
    ) as DataForRefreshToken;
    const checkTokenResult = await authDao.checkRefreshToken(
      decoded.userId,
      refreshToken
    );
    if (!checkTokenResult.data || !checkTokenResult.success) {
      return next(ApiError.badRequest("Refresh token is missing."));
    }
    const now = Date.now();
    const threeDaysLater = new Date();
    threeDaysLater.setTime(now + 3 * 24 * 60 * 60 * 1000);
    const tokenExpiresTime = new Date(
      checkTokenResult.data.expiresAt
    ).getTime();
    if (tokenExpiresTime > threeDaysLater.getTime()) {
      const getAccessTokenResult = await authDao.getAccessTokenByUserId(
        decoded.userId
      );
      if (!getAccessTokenResult.data || !getAccessTokenResult.success) {
        return next(ApiError.badRequest(getAccessTokenResult.message));
      }
      authDao.saveTokensInCookie(res, getAccessTokenResult.data, undefined);
    } else {
      const setTokensResult = await authDao.prevSaveTokensInCookie(
        req,
        res,
        decoded.userId
      );
      if (!setTokensResult.data || !setTokensResult.success) {
        return next(ApiError.badRequest(setTokensResult.message));
      }
    }
    return res.sendStatus(200);
  }
  async getUserInfo(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const { user } = req;
    if (!user) {
      return next(ApiError.internal("user not authorized"));
    }
    return res.json(user.id);
  }
}

const authControllers = new AuthControllers();
export default authControllers;
