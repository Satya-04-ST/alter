import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}
export declare const authenticateJwt: (req: Request, res: Response, next: NextFunction) => Promise<void>;
