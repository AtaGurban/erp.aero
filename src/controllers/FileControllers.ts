import { NextFunction, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types/authRequest";
import ApiError from "../error/ApiError";
import fileDao from "../dao/FileDao/FileDao";
import * as path from "path";
import { filesPath } from "../utils/filePathConsts";

class FileControllers {
  async createFile(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const { user } = req;
    if (!user) {
      return next(ApiError.internal("user not authorized"));
    }
    const file = req.files?.file;
    if (!file || Array.isArray(file)) {
      return next(ApiError.badRequest("Incomplete data"));
    }
    const { success, message } = await fileDao.createFile(file, user);
    if (!success) {
      return next(ApiError.badRequest(message));
    }
    return res.sendStatus(200);
  }
  async updateFile(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const { user } = req;
    if (!user) {
      return next(ApiError.internal("user not authorized"));
    }
    const file = req.files?.file;
    const { id } = req.params;
    if (!file || Array.isArray(file) || !id || isNaN(+id)) {
      return next(ApiError.badRequest("Incomplete data"));
    }
    const { success, message } = await fileDao.updateFile(file, +id, user);
    if (!success) {
      return next(ApiError.badRequest(message));
    }
    return res.sendStatus(200);
  }
  async deleteFile(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const { user } = req;
    if (!user) {
      return next(ApiError.internal("user not authorized"));
    }
    const { id } = req.params;
    if (!id || isNaN(+id)) {
      return next(ApiError.badRequest("Incomplete data"));
    }
    const { success, message } = await fileDao.deleteFile(+id, user);
    if (!success) {
      return next(ApiError.badRequest(message));
    }
    return res.sendStatus(200);
  }
  async getFile(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const { user } = req;
    if (!user) {
      return next(ApiError.internal("user not authorized"));
    }
    const { id } = req.params;
    if (!id || isNaN(+id)) {
      return next(ApiError.badRequest("Incomplete data"));
    }
    const { success, message, data } = await fileDao.getFiles({ id });
    if (!success || !data || "rows" in data) {
      return next(ApiError.badRequest(message));
    }
    return res.json(data);
  }
  async getFileList(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const { user } = req;
    if (!user) {
      return next(ApiError.internal("user not authorized"));
    }
    const { list_size, page } = req.params;
    const { success, message, data } = await fileDao.getFiles({
      list_size,
      page,
    });
    if (!success || !data) {
      return next(ApiError.badRequest(message));
    }
    return res.json(data);
  }
  async downloadFile(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id || isNaN(+id)) {
      return next(ApiError.badRequest("Incomplete data"));
    }
    const { success, message, data } = await fileDao.getFiles({ id });
    if (!success || !data || "rows" in data) {
      return next(ApiError.badRequest(message));
    }
    const filePath = path.join(filesPath, data.path);
    return res.download(filePath, data.filename, (err) => {
      if (err) {
        console.log("Ошибка при отправке файла:", err);
        res.status(500).send("Ошибка при скачивании файла");
      }
    });
  }
}

const fileControllers = new FileControllers();
export default fileControllers;
