import { Request, Response, NextFunction } from 'express';
export declare const authMiddleware: (request: Request, response: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
