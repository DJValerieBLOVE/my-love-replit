import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userPubkey?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const pubkey = req.headers["x-nostr-pubkey"] as string | undefined;
  
  if (!pubkey) {
    return res.status(401).json({ error: "Authentication required. Please login with Nostr." });
  }
  
  try {
    let user = await storage.getUserByNostrPubkey(pubkey);
    
    if (!user) {
      return res.status(401).json({ error: "User not found. Please complete registration." });
    }
    
    req.userId = user.id;
    req.userPubkey = pubkey;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const pubkey = req.headers["x-nostr-pubkey"] as string | undefined;
  
  if (pubkey) {
    storage.getUserByNostrPubkey(pubkey)
      .then(user => {
        if (user) {
          req.userId = user.id;
          req.userPubkey = pubkey;
        }
        next();
      })
      .catch(() => next());
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
