import * as fs from "fs";
import * as crypto from 'crypto';
import { UploadedFile } from "express-fileupload";
import { v4 } from "uuid";
import * as path from "path";

export function checkExistFolder(directory: string): void {
  // Проверяем существует ли папка, если нет - создаем её
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
export function gbToBytes(gb: number): number {
  return gb * 1024 * 1024 * 1024;
}
export function getUniqueNumbers(arr: number[]): number[] {
  return [...new Set(arr)];
}
export function bytesToGb(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 100) / 100;
}
export function deleteFile(path: string): void {
  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

export const getRandomInt = (codeLength: number): string => {
  const givenSet: string = "0123456789";
  let code: string = "";
  for (let i = 0; i < codeLength; i++) {
    let pos: number = Math.floor(Math.random() * givenSet.length);
    code += givenSet[pos];
  }
  return code;
};

export const getRandomString = (length: number): string => {
  const charSet: string =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let str: string = "";
  for (let i = 0; i < length; i++) {
    let pos: number = Math.floor(Math.random() * charSet.length);
    str += charSet[pos];
  }
  return str;
};

export function validateEmail(email: string) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
export async function sleep(timeout: number) {
  return await new Promise((res) => setTimeout(res, timeout));
}

export function checkPassword(password: string) {
  // Проверка наличия символа
  // if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) {
  //   return false;
  // }

  // Проверка наличия буквы верхнего регистра
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Проверка наличия буквы нижнего регистра
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Проверка длины пароля
  if (password.length < 8) {
    return false;
  }

  // Все условия выполнены
  return true;
}


export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};


export const getFileType = (file: File | UploadedFile) => {
  const arr = file.name.split(".");
  return arr.slice(-1)[0];
};

export async function saveUploadedFile(
  file: UploadedFile,
  pathForSave: string
) {
  const fileExt = getFileType(file);
  // checkExistFolder(pathForSave);
  const fileSaveName = v4() + `.${fileExt}`;
  await file.mv(path.resolve(pathForSave, fileSaveName));
  return fileSaveName;
}