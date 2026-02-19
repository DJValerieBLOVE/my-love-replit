import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userPubkey?: string;
      authMethod?: 'nostr' | 'email';
    }
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const pubkey = req.headers["x-nostr-pubkey"] as string | undefined;
  const authHeader = req.headers["authorization"] as string | undefined;

  if (pubkey) {
    try {
      const user = await storage.getUserByNostrPubkey(pubkey);
      if (!user) {
        return res.status(401).json({ error: "User not found. Please complete registration." });
      }
      req.userId = user.id;
      req.userPubkey = pubkey;
      req.authMethod = 'nostr';
      return next();
    } catch (error) {
      console.error("Auth middleware error (nostr):", error);
      return res.status(500).json({ error: "Authentication failed" });
    }
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const user = await storage.getUser(decoded.userId);
        if (!user) {
          return res.status(401).json({ error: "User not found." });
        }
        req.userId = user.id;
        req.userPubkey = user.nostrPubkey || undefined;
        req.authMethod = 'email';
        return next();
      } catch (error) {
        console.error("Auth middleware error (jwt):", error);
        return res.status(500).json({ error: "Authentication failed" });
      }
    }
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  return res.status(401).json({ error: "Authentication required. Please login." });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const pubkey = req.headers["x-nostr-pubkey"] as string | undefined;
  const authHeader = req.headers["authorization"] as string | undefined;

  if (pubkey) {
    storage.getUserByNostrPubkey(pubkey)
      .then(user => {
        if (user) {
          req.userId = user.id;
          req.userPubkey = pubkey;
          req.authMethod = 'nostr';
        }
        next();
      })
      .catch(() => next());
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (decoded) {
      storage.getUser(decoded.userId)
        .then(user => {
          if (user) {
            req.userId = user.id;
            req.userPubkey = user.nostrPubkey || undefined;
            req.authMethod = 'email';
          }
          next();
        })
        .catch(() => next());
    } else {
      next();
    }
  } else {
    next();
  }
}

export function requireOwnership(paramName: string = "userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestedUserId = req.params[paramName];
    
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (requestedUserId && requestedUserId !== req.userId) {
      return res.status(403).json({ error: "Access denied. You can only access your own data." });
    }
    
    next();
  };
}

const ADMIN_PUBKEY = '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767';

const CREATOR_TIERS = ['creator', 'creator_annual', 'creator_byok'];
const ANNUAL_TIERS = ['core_annual', 'creator_annual', 'creator_byok'];

export function requireTier(requiredAccess: 'creator' | 'annual' | 'core') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.nostrPubkey === ADMIN_PUBKEY) {
        return next();
      }

      const tier = user.tier || 'free';

      let hasAccess = false;
      if (requiredAccess === 'creator') {
        hasAccess = CREATOR_TIERS.includes(tier);
      } else if (requiredAccess === 'annual') {
        hasAccess = ANNUAL_TIERS.includes(tier);
      } else if (requiredAccess === 'core') {
        hasAccess = tier !== 'free';
      }

      if (!hasAccess) {
        return res.status(403).json({ error: `This feature requires a ${requiredAccess} membership` });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
}
