// Example: src/middleware/verifyToken.ts

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// FIX: Import VerifyErrors type
import type { JwtPayload, VerifyErrors } from 'jsonwebtoken';

// Define the expected structure of your JWT payload
interface TokenPayload extends JwtPayload {
    userId: string; // Expect userId to be a string (CUID from Prisma)
    email: string;
    // Add other fields if present in your token payload
}

// Define CustomRequest extending Express Request
interface CustomRequest extends Request {
    user?: { // Match the structure used in controllers
        id: string; // CUID from Prisma
    };
}

const verifyToken = (req: Request, res: Response, next: NextFunction): Response | void => {
    console.log('--- Verifying Token ---');
    console.log('Request Cookies:', req.cookies); // Log all cookies
    const token = req.cookies.accessToken;
    const secret = process.env.JWT_SECRET;

    if (!token) {
        console.log('Verification failed: No token provided.');
        return res.status(401).json({ message: "Unauthorized. No token provided." });
    }
    console.log('Token found:', token);

    if (!secret) {
        console.error('JWT_SECRET environment variable not set');
        return res.status(500).json({ message: "Server configuration error." });
    }

    // FIX: Add explicit types for err and decoded parameters
    jwt.verify(token, secret, (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Unauthorized. Token expired." });
            }
             if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: "Unauthorized. Invalid token." });
            }
            return res.status(401).json({ message: "Unauthorized." });
        }

        // console.log('Token decoded successfully:', decoded);

        // --- Type Guard for decoded payload ---
        // Check if decoded exists, is an object (not string), and has the expected properties
        if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
            // Attach user info to the request object
            (req as CustomRequest).user = {
                id: (decoded as TokenPayload).userId
            };
            console.log('User attached to request:', (req as CustomRequest).user);
            next(); // Proceed to the next middleware/controller
        } else {
            console.error('Decoded token is invalid or does not contain userId.');
            return res.status(401).json({ message: "Unauthorized. Invalid token payload." });
        }
    });
};

// Export without the unnecessary type assertion
export default verifyToken;

