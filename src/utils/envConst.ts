import * as dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;
export const DB_NAME = process.env.DB_NAME;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DEV_MODE = process.env.DEV_MODE;
export const DB_HOST = process.env.DB_HOST;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY as string
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY as string