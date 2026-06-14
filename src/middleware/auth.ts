import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../lib/supabase.ts';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw error || new Error('User not found or authorization failed');
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying Supabase user token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
export default requireAuth;
