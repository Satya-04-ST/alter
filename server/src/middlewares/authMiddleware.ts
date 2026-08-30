import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma, memStore } from '../config/prisma';

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

export const authenticateJwt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication token is missing or malformed',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      name?: string;
    };

    if (memStore.isPostgresReady) {
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!dbUser) {
        res.status(401).json({ success: false, error: 'User session not found' });
        return;
      }
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      };
    } else {
      const memUser = memStore.users.get(decoded.id);
      if (!memUser && !decoded.email) {
        res.status(401).json({ success: false, error: 'User session not found' });
        return;
      }
      req.user = {
        id: decoded.id,
        email: memUser ? memUser.email : decoded.email,
        name: memUser ? memUser.name : decoded.name || 'User',
        role: memUser ? memUser.role : (decoded.role || 'STUDENT'),
      };
    }

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
      return;
    }
    res.status(401).json({ success: false, error: 'Invalid authentication token.' });
  }
};
