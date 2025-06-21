import { DatabaseModelRow } from "./DatabaseModelRow";

export interface FileRow extends DatabaseModelRow {
  userId: string;
  filename: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date
}
