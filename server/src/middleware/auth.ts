import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { getAuth as getFirebaseAuth } from "firebase/auth";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email?: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log("req", req.headers);
    // console.log("authHeader", authHeader);
    // const auth = getFirebaseAuth();
    // const user = auth.currentUser;
    // const idToken = await user?.getIdToken();
    // console.log("idToken", idToken,user,auth);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || undefined,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
