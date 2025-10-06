import express, { type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import interactionRoutes from './routes/interactionRoutes';

import authRoutes from './routes/authRoutes';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
  }));
  app.use(express.json()); 
  app.use(cookieParser());
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    console.log('Request body:', req.body); 
    next();
  });
  
  app.get('/', (res: Response) => {
    res.json({ message: 'Server is running' });
  });


  
  app.use('/api/auth', authRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/users', userRoutes); 
  app.use('/api/posts', postRoutes);
  app.use('/api/interactions', interactionRoutes);


  
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error handler:', err);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  });
  
  // --- Start Server ---
  const PORT = process.env.PORT; // Use port from .env or default to 5001
  
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });