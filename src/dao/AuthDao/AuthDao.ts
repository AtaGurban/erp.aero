import { Op, WhereOptions } from "sequelize";
import { Token, User } from "../../models/UserModels";
import { LoginOrRegistrationBody } from "../../service/zod/auth";
import { hashToken, validateEmail } from "../../utils/commonFunc";
import errorHandler from "../../utils/erronHandler";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from "../../utils/envConst";
import { DataForRefreshToken, UserRow } from "../../types/database/UserRow";
import { IGetUserAuthInfoRequest } from "../../types/authRequest";
import { isHttps } from "../../utils/booleanConst";
import { Request, Response } from "express";
import redisClient from "../../service/redis/redis";

class AuthDao {
  async registration(data: LoginOrRegistrationBody) {
    try {
      const { id, password } = data;
      let phone = null;
      let email = null;
      if (validateEmail(id)) {
        email = id;
      } else {
        phone = id;
      }
      const checkOldUserWhereOptions: WhereOptions = {};
      if (email) {
        checkOldUserWhereOptions.email = email;
      } else if (phone) {
        checkOldUserWhereOptions.phone = phone;
      }
      const checkOldUser = await User.findOne({
        where: checkOldUserWhereOptions,
        attributes: ["id"],
        raw: true,
      });
      if (checkOldUser) {
        return {
          success: false,
          message: "Этот пользователь уже зарегистрирован",
        };
      }
      const hashPassword = await bcrypt.hash(password, 5);
      const createdUser = await User.create({
        email,
        phone,
        password: hashPassword,
      });
      return { success: true, message: "", data: createdUser };
    } catch (error) {
      return errorHandler(error);
    }
  }
  async login(data: LoginOrRegistrationBody) {
    try {
      const { id, password } = data;
      const findUserWhereOptions: WhereOptions = {};
      if (validateEmail(id)) {
        findUserWhereOptions.email = id;
      } else {
        findUserWhereOptions.phone = id;
      }
      const user = await User.findOne({
        where: findUserWhereOptions,
        raw: true,
      });
      if (!user) {
        return {
          success: false,
          message: "Пользователь не найден",
        };
      }
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return {
          success: false,
          message: "Неправильный пароль",
        };
      }
      return { success: true, message: "", data: user };
    } catch (error) {
      return errorHandler(error);
    }
  }
  generateJwt(
    payload: { [key: string]: any },
    expiresIn: string | number,
    jwtKey: string
  ): string {
    const options: jwt.SignOptions = {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    };
    return jwt.sign(payload, jwtKey, options);
  }
  async createRefreshToken(
    refreshTokenData: DataForRefreshToken,
    user: UserRow | User
  ) {
    try {
      const refreshToken = this.generateJwt(
        { ...refreshTokenData },
        "20d",
        REFRESH_SECRET_KEY
      );
      const now = new Date();
      const refreshTokenExpiredAt = new Date();
      refreshTokenExpiredAt.setTime(now.getTime() + 20 * 24 * 60 * 60 * 1000);
      await Token.upsert({
        userId: user.id,
        refreshToken,
        expiresAt: refreshTokenExpiredAt,
        deviceUUID: refreshTokenData.deviceUUID,
      });
      return { success: true, data: refreshToken, message: "" };
    } catch (error) {
      return errorHandler(error);
    }
  }
  async prevSaveTokensInCookie(
    req: Request | IGetUserAuthInfoRequest,
    res: Response,
    userId: number
  ) {
    try {
      const user = await User.findOne({ where: { id: userId }, raw: true });
      if (!user) {
        return {
          success: false,
          message: "Пользователь не найден",
          data: null,
        };
      }
      const deviceUUID = req.cookies["Device-UUID"] ?? `${userId}`;
      const userAgent = req.cookies["User-Agent"] ?? "";
      const refreshTokenData: DataForRefreshToken = {
        deviceUUID,
        userAgent,
        userId: user.id,
      };
      const getRefreshResult = await authDao.createRefreshToken(
        refreshTokenData,
        user
      );
      if (!getRefreshResult.success || !getRefreshResult.data) {
        return getRefreshResult;
      }
      const refreshToken = getRefreshResult.data;
      const accessToken = authDao.generateJwt(
        { ...user, refreshTokens: undefined },
        "15m",
        ACCESS_SECRET_KEY
      );
      authDao.saveTokensInCookie(res, accessToken, refreshToken);
      return {
        success: true,
        message: "",
        data: { refreshToken, accessToken },
      };
    } catch (error) {
      return errorHandler(error);
    }
  }
  async getAccessTokenByUserId(userId: number) {
    try {
      const user = await User.findOne({ where: { id: userId }, raw: true });
      if (!user) {
        return {
          success: false,
          message: "Пользователь не найден",
          data: null,
        };
      }
      const token = this.generateJwt(
        { ...user, refreshTokens: undefined },
        "15m",
        ACCESS_SECRET_KEY
      );
      return { success: true, data: token, message: "" };
    } catch (error) {
      return errorHandler(error);
    }
  }
  async checkRefreshToken(userId: number, refreshToken: string) {
    try {
      const hashedToken = hashToken(refreshToken);
      const cacheKey = `refreshToken:${userId}:${hashedToken}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as Token;
        return { success: true, data: parsed, message: "From cache" };
      }
      const checkToken = await Token.findOne({
        where: {
          userId,
          refreshToken,
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
        raw: true,
      });
      if (!checkToken) {
        return { success: false, message: "Refresh token is missing." };
      }
      await redisClient.setEx(cacheKey, 300, JSON.stringify(checkToken));
      return { success: true, data: checkToken, message: "" };
    } catch (error) {
      return errorHandler(error);
    }
  }
  async logout(req: IGetUserAuthInfoRequest, res: Response) {
    const { user } = req;
    if (!user) {
      return { success: false, message: "user not authorized" };
    }
    const currentRefreshToken = req.cookies.refresh_token ?? "";
    if (!currentRefreshToken || typeof currentRefreshToken !== "string") {
      return { success: false, message: "Refresh token is missing." };
    }
    await Token.destroy({
      where: { refreshToken: currentRefreshToken.trim() },
    });
    res.cookie("access_token", "", {
      maxAge: 0,
      secure: isHttps,
    });
    res.cookie("refresh_token", "", {
      httpOnly: true,
      secure: isHttps,
      maxAge: 0,
    });
    return { success: true, message: "" };
  }
  saveTokensInCookie(
    res: Response,
    access_token: string | undefined,
    refresh_token: string | undefined
  ) {
    try {
      if (access_token) {
        res.cookie("access_token", access_token, {
          // httpOnly: true,
          secure: isHttps,
          maxAge: 60 * 60 * 1000, // 4 часа
        });
      }
      if (refresh_token) {
        res.cookie("refresh_token", refresh_token, {
          httpOnly: true,
          secure: isHttps,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

const authDao = new AuthDao();
export default authDao;
