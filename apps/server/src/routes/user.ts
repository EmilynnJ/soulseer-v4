import { Router } from 'express';
import { supabaseAdmin } from '../db';
import { requireAuth } from '../middleware/auth';

export const userRouter = Router();

userRouter.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { display_name, bio, avatar_url } = req.body;
    const { data, error } = await supabaseAdmin.from('users')
      .update({ display_name, bio, avatar_url }).eq('id', req.user!.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

userRouter.get('/upload-url', requireAuth, async (req, res) => {
  try {
    const ext = (req.query.ext as string) || 'jpg';
    const path = `avatars/${req.user!.id}.${ext}`;
    const { data, error } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET!).createSignedUploadUrl(path);
    if (error) throw error;
    res.json({ signedUrl: data.signedUrl, path });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
