import { Router } from 'express';
import { supabaseAdmin } from '../db';
import { requireAuth } from '../middleware/auth';

export const forumRouter = Router();

forumRouter.get('/posts', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('forum_posts')
      .select('*, author:users!author_id(display_name, avatar_url)')
      .eq('deleted', false).order('pinned', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

forumRouter.post('/posts', requireAuth, async (req, res) => {
  try {
    const { title, body } = req.body;
    const { data, error } = await supabaseAdmin.from('forum_posts')
      .insert({ title, body, author_id: req.user!.id }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

forumRouter.get('/posts/:id/replies', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('forum_replies')
      .select('*, author:users!author_id(display_name, avatar_url)')
      .eq('post_id', req.params.id).eq('deleted', false).order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

forumRouter.post('/posts/:id/replies', requireAuth, async (req, res) => {
  try {
    const { body } = req.body;
    const { data, error } = await supabaseAdmin.from('forum_replies')
      .insert({ post_id: req.params.id, body, author_id: req.user!.id }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
