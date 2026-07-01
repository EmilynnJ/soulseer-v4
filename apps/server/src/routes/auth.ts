import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../db';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/sync', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id, email } = req.user!;
    const display_name = req.body.display_name || email.split('@')[0];
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({ id, email, display_name }, { onConflict: 'id' })
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users').select('*').eq('id', req.user!.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
