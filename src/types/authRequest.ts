import { Request } from "express"
import { UserRow } from "./database/UserRow";

export interface IGetUserAuthInfoRequest extends Request {
  user?: UserRow;
}