import { Request, Response, NextFunction } from 'express';
import ApiError from '../error/ApiError';

export default function ErrorHandlingMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message });
    return
  }
  res.status(500).json({ message: 'Непредвиденная ошибка' });
  return 
}