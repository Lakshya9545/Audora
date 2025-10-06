// src/controllers/authController.ts

import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod'; // Import zod

// Instantiate Prisma Client
import prisma from "../prisma/prisma"; // Adjust the path if necessary

// --- Zod Schemas ---

// Updated: Uses 'username' instead of 'name'
const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }), // Added regex for basic validation
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});


// --- Environment Variables & Constants ---

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
    process.exit(1);
}

const SALT_ROUNDS = 10;
const JWT_EXPIRATION = '1d'; // Example: 1 day expiration
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day in milliseconds

/**
 * Controller for handling User Signup (Registration).
 * Uses Zod for input validation. Aligned with Prisma schema using 'username'.
 * @param req Express Request object. Expects { username, email, password } in body.
 * @param res Express Response object.
 */
export const signupController = async (req: Request, res: Response): Promise<void> => {

    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
        const formattedErrors = validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        res.status(400).json({ message: 'Validation failed.', errors: formattedErrors });
        return;
    }

    // Use validated data from now on - using 'username'
    const { username, email, password } = validationResult.data;
    const lowerCaseEmail = email.toLowerCase();
    const lowerCaseUsername = username.toLowerCase(); // Normalize username

    try {
        // --- Check if email OR username already exists ---
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: lowerCaseEmail },
                    { username: lowerCaseUsername }
                ],
            },
        });

        if (existingUser) {
            // Determine which field caused the conflict
            const message = existingUser.email === lowerCaseEmail
                ? 'User with this email already exists.'
                : 'Username is already taken.';
            res.status(409).json({ message });
            return;
        }

        // --- Hash the password ---
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // --- Create the new user ---
        // Updated: Uses 'username' field
        const newUser = await prisma.user.create({
            data: {
                username: lowerCaseUsername, // Store normalized username
                email: lowerCaseEmail,
                password: hashedPassword,
                // avatarUrl and bio are optional and not required at signup
            },
            select: { // Return only non-sensitive fields - updated with 'username'
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                bio: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // --- Respond ---
        res.status(201).json({ message: 'User created successfully.', user: newUser });

    } catch (error) {
        console.error('Signup Error:', error);
        // Check for specific Prisma errors if needed (e.g., unique constraint violation if the findFirst check somehow missed it)
        // if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { ... }
        if (error instanceof Error) {
             res.status(500).json({ message: 'Error creating user.', error: error.message });
        } else {
             res.status(500).json({ message: 'An unexpected error occurred during signup.' });
        }
    }
};

/**
 * Controller for handling User Login.
 * Uses Zod for input validation. Aligned with Prisma schema using 'username'.
 * @param req Express Request object. Expects { email, password } in body.
 * @param res Express Response object.
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
    // --- Validate Input with Zod ---
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
        const formattedErrors = validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        res.status(400).json({ message: 'Validation failed.', errors: formattedErrors });
        return;
    }

    // Use validated data
    const { email, password } = validationResult.data;
    const lowerCaseEmail = email.toLowerCase();

    try {
        // --- Find the user by email ---
        const user = await prisma.user.findUnique({
            where: { email: lowerCaseEmail },
        });

        if (!user) {
            // Use a generic message for security
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        // --- Compare provided password with stored hash ---
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Use a generic message for security
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        // --- Generate JWT ---
        // Payload includes essential identifiers
        const tokenPayload = {
            userId: user.id,
            email: user.email, // Keep email for potential future use/checks
            username: user.username // Include username in payload if useful client-side immediately after login
        };

        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        // --- Set JWT as an HTTP-Only Cookie ---
        res.cookie('accessToken', token, {
            httpOnly: true, // Prevents client-side JS access
            secure: true, // MUST be true when sameSite is 'none'
            sameSite: 'none', // Necessary for cross-origin requests
           // domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined, // Set domain in production
            maxAge: COOKIE_MAX_AGE, // Corresponds to JWT expiration
            path: '/', // Make cookie available across the site
        });


        // --- Respond with success message and user info (NO TOKEN in body) ---
        // Updated: returns 'username' field
        res.status(200).json({
            message: 'Login successful.',
            user: { // Return non-sensitive user info
                id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                bio: user.bio
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
         if (error instanceof Error) {
              res.status(500).json({ message: 'Error during login.', error: error.message });
         } else {
              res.status(500).json({ message: 'An unexpected error occurred during login.' });
         }
    }
};

/**
 * Controller to check if the user is authenticated based on the presence
 * and validity of the accessToken cookie.
 * @param req Express Request object
 * @param res Express Response object
 */
export const checkAuth = async (req: Request, res: Response) => { // Added async for potential DB lookup
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ authenticated: false, user: null, message: 'No token provided' });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload; // Type assertion

      // Optional: Fetch fresh user data to ensure user still exists and is valid
      // This adds a DB query but provides more robust auth checking
      const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
              bio: true
          }
      });

      if (!user) {
          // User associated with token no longer exists
          res.clearCookie('accessToken'); // Clear the invalid cookie
          return res.status(401).json({ authenticated: false, user: null, message: 'User not found' });
      }

      // If token is valid and user exists, return authenticated status and user info
      return res.status(200).json({ authenticated: true, user: user });

    } catch (err) {
      // Handle different JWT errors specifically if needed (e.g., TokenExpiredError)
      console.error("Auth Check Error:", err);
      res.clearCookie('accessToken'); // Clear invalid/expired cookie
      return res.status(401).json({ authenticated: false, user: null, message: 'Invalid or expired token' });
    }
};

/**
 * Controller for handling User Logout. Clears the auth cookie.
 * @param req Express Request object
 * @param res Express Response object
 */
 export const logoutController = (req: Request, res: Response): void => {
    // Clear the cookie. Must use the same settings (secure, sameSite) as when it was set.
    res.cookie('accessToken', '', {
        httpOnly: true,
        secure: true, // Match the login cookie setting
        sameSite: 'none', // Match the login cookie setting
        expires: new Date(0), // Set expiration to a past date
        path: '/',
    });

    res.status(200).json({ message: 'Logout successful.' });
};