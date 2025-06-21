import { DatabaseModelRow } from "./DatabaseModelRow";


export interface DataForRefreshToken {
  deviceUUID: string;
  userAgent: string;
  userId: number;
}

export interface UserRow extends DatabaseModelRow {
  password: string;
  email: string | null;
  phone: string | null;
}

export interface TokenRow extends DatabaseModelRow {
  userId: string;
  refreshToken: string;
  deviceUUID: string;
  expiresAt: Date;
}
