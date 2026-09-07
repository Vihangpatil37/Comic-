// admin middleware - checks supabase token and admin email list
import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase-server";

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];
    
    // Using Supabase Auth getUser to securely verify the token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user || !user.email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
    
    if (!adminEmails.includes(user.email.toLowerCase())) {
      res.status(403).json({ error: "Forbidden: Not an admin" });
      return;
    }

    // Attach user email to request for downstream handlers
    (req as any).adminEmail = user.email;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};


