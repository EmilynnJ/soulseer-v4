import { Router } from 'express';
import { supabaseAdmin } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';

export const adminRouter = Router();
const guard = [requireAuth, requireRole('admin')] as any[];

adminRouter.get('/users', ...guard, async (req: any, res: any) => {
  try {
    const q = req.query.q as string;
    let query = supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });
    if (q) query = (query as any).ilike('email', `%${q}%`);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.post('/readers', ...guard, async (req: any, res: any) => {
  try {
    const { email, display_name, bio, specialties, chat_rate_cents, voice_rate_cents, video_rate_cents, avatar_url } = req.body;
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email, password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2), email_confirm: true
    });
    if (authErr) throw authErr;
    const uid = authUser.user.id;
    await supabaseAdmin.from('users').insert({ id: uid, email, display_name, bio, avatar_url, role: 'reader' });
    const { data, error } = await supabaseAdmin.from('reader_profiles')
      .insert({ user_id: uid, specialties: specialties || [], chat_rate_cents, voice_rate_cents, video_rate_cents }).select().single();
    if (error) throw error;
    res.json({ userId: uid, profile: data });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.patch('/readers/:id', ...guard, async (req: any, res: any) => {
  try {
    const { display_name, bio, avatar_url, specialties, chat_rate_cents, voice_rate_cents, video_rate_cents } = req.body;
    await supabaseAdmin.from('users').update({ display_name, bio, avatar_url }).eq('id', req.params.id);
    const { data, error } = await supabaseAdmin.from('reader_profiles')
      .update({ specialties, chat_rate_cents, voice_rate_cents, video_rate_cents }).eq('user_id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.get('/readings', ...guard, async (_req: any, res: any) => {
  try {
    const { data, error } = await supabaseAdmin.from('readings').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.get('/transactions', ...guard, async (_req: any, res: any) => {
  try {
    const { data, error } = await supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false }).limit(1000);
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.post('/users/:id/adjust-balance', ...guard, async (req: any, res: any) => {
  try {
    const { amount_cents, note } = req.body;
    const { data: user } = await supabaseAdmin.from('users').select('balance_cents').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const newBalance = user.balance_cents + amount_cents;
    if (newBalance < 0) return res.status(400).json({ error: 'Cannot go negative' });
    await supabaseAdmin.from('users').update({ balance_cents: newBalance }).eq('id', req.params.id);
    await supabaseAdmin.from('transactions').insert({ user_id: req.params.id, type: 'adjustment', amount_cents, note });
    res.json({ balance_cents: newBalance });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.delete('/forum/posts/:id', ...guard, async (req: any, res: any) => {
  try {
    await supabaseAdmin.from('forum_posts').update({ deleted: true }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

adminRouter.delete('/forum/replies/:id', ...guard, async (req: any, res: any) => {
  try {
    await supabaseAdmin.from('forum_replies').update({ deleted: true }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
