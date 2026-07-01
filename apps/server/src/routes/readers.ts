import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';

export const readersRouter = Router();

readersRouter.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, display_name, avatar_url, bio, is_online, reader_profiles(*)')
      .eq('role', 'reader').eq('is_online', true);
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readersRouter.get('/all', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, display_name, avatar_url, bio, is_online, reader_profiles(*)')
      .eq('role', 'reader');
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readersRouter.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, display_name, avatar_url, bio, is_online, reader_profiles(*)')
      .eq('id', req.params.id).eq('role', 'reader').single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readersRouter.patch('/profile', requireAuth, requireRole('reader'), async (req, res) => {
  try {
    const { bio, specialties, chat_rate_cents, voice_rate_cents, video_rate_cents, avatar_url, display_name } = req.body;
    if (display_name) await supabaseAdmin.from('users').update({ display_name, avatar_url }).eq('id', req.user!.id);
    const { data, error } = await supabaseAdmin
      .from('reader_profiles')
      .update({ specialties, chat_rate_cents, voice_rate_cents, video_rate_cents })
      .eq('user_id', req.user!.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readersRouter.patch('/status', requireAuth, requireRole('reader'), async (req, res) => {
  try {
    const { is_online } = req.body;
    const { data, error } = await supabaseAdmin
      .from('users').update({ is_online }).eq('id', req.user!.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readersRouter.get('/:id/reviews', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('readings')
      .select('id, client_rating, client_review, created_at')
      .eq('reader_id', req.params.id).eq('status', 'completed')
      .not('client_rating', 'is', null).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
