// d:/Projects/Full stack/Audora/server/types/index.ts
import type { Request } from 'express';

/**
 * Represents an authenticated request where the user object has been attached.
 * This interface should be used in all controllers that handle protected routes.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string; // This should be the standard user ID property
  };
}
