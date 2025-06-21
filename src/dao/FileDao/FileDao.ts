import { UploadedFile } from "express-fileupload";
import { UserRow } from "../../types/database/UserRow";
import errorHandler from "../../utils/erronHandler";
import {
  deleteFile,
  getFileType,
  saveUploadedFile,
} from "../../utils/commonFunc";
import { filesPath } from "../../utils/filePathConsts";
import { FileModel } from "../../models/FileModels";
import * as path from "path";
import { GetFileParams } from "../../types/bodies/file/File";
import redisClient from "../../service/redis/redis";

class FileDao {
  async createFile(file: UploadedFile, user: UserRow) {
    try {
      const { name, mimetype, size } = file;
      const savedName = await saveUploadedFile(file, filesPath);
      const extension = getFileType(file);
      await FileModel.create({
        filename: name,
        mimeType: mimetype,
        size: Math.round(size / 1024),
        path: savedName,
        userId: user.id,
        extension,
        uploadedAt: new Date(),
      });
      return { success: true, message: "" };
    } catch (error) {
      return errorHandler(error);
    }
  }
  async updateFile(file: UploadedFile, id: number, user: UserRow) {
    try {
      const oldFile = await FileModel.findOne({ where: { id }, raw: true });
      if (!oldFile) {
        return { success: false, message: "File not found" };
      }
      if (+oldFile.userId !== +user.id) {
        return { success: false, message: "Forbidden" };
      }
      deleteFile(path.join(filesPath, oldFile.path));
      const { name, mimetype, size } = file;
      const savedName = await saveUploadedFile(file, filesPath);
      const extension = getFileType(file);
      await FileModel.update(
        {
          filename: name,
          mimeType: mimetype,
          size: Math.round(size / 1024),
          path: savedName,
          extension,
          uploadedAt: new Date(),
        },
        { where: { id } }
      );
      return { success: true, message: "" };
    } catch (error) {
      return errorHandler(error);
    }
  }
  async deleteFile(id: number, user: UserRow) {
    try {
      const file = await FileModel.findOne({ where: { id } });
      if (!file) {
        return { success: false, message: "File not found" };
      }
      if (+file.userId !== +user.id) {
        return { success: false, message: "Forbidden" };
      }
      deleteFile(path.join(filesPath, file.path));
      await file.destroy();
      return { success: true, message: "" };
    } catch (error) {
      return errorHandler(error);
    }
  }
  async getFiles(params: GetFileParams) {
    try {
      const { id, list_size, page } = params;
      if (id && !isNaN(+id)) {
        const cacheKey = `file-${id}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as FileModel;
          return { success: true, data: parsed, message: "From cache" };
        }
        const file = await FileModel.findOne({ where: { id }, raw: true });
        if (!file) {
          return { success: true, data: file, message: "File not found" };
        }
        await redisClient.setEx(cacheKey, 300, JSON.stringify(file));
        return { success: true, data: file, message: "" };
      }
      const limit = list_size && !isNaN(+list_size) ? +list_size : 10;
      const currentPage = page && !isNaN(+page) ? +page : 1;
      const offset = (currentPage - 1) * limit;
      const files = await FileModel.findAndCountAll({
        limit,
        offset,
        raw: true,
      });
      return { success: true, message: "", data: files };
    } catch (error) {
      return errorHandler(error);
    }
  }
}

const fileDao = new FileDao();
export default fileDao;
