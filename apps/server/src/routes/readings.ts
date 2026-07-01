import { Router } from 'express';
import { supabaseAdmin } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';
import { COMMISSION_READER } from '@soulseer/shared';

export const readingsRouter = Router();

readingsRouter.post('/', requireAuth, requireRole('client'), async (req, res) => {
  try {
    const { reader_id, type } = req.body;
    const { data: rp } = await supabaseAdmin.from('reader_profiles')
      .select('chat_rate_cents, voice_rate_cents, video_rate_cents').eq('user_id', reader_id).single();
    if (!rp) return res.status(404).json({ error: 'Reader not found' });
    const rate = type === 'chat' ? rp.chat_rate_cents : type === 'voice' ? rp.voice_rate_cents : rp.video_rate_cents;
    const { data, error } = await supabaseAdmin.from('readings')
      .insert({ client_id: req.user!.id, reader_id, type, rate_cents_per_min: rate }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readingsRouter.post('/:id/start', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('readings')
      .update({ status: 'active', started_at: new Date().toISOString(), last_tick_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readingsRouter.post('/:id/tick', requireAuth, async (req, res) => {
  try {
    const { data: reading } = await supabaseAdmin.from('readings').select('*').eq('id', req.params.id).single();
    if (!reading || reading.status !== 'active') return res.status(400).json({ error: 'Reading not active' });
    const charge = reading.rate_cents_per_min;
    const readerEarns = Math.floor(charge * COMMISSION_READER);
    const platformFee = charge - readerEarns;
    await supabaseAdmin.rpc('deduct_client_balance', {
      p_reading_id: reading.id, p_client_id: reading.client_id, p_reader_id: reading.reader_id,
      p_charge_cents: charge, p_reader_cents: readerEarns, p_platform_cents: platformFee
    });
    res.json({ charged: charge });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readingsRouter.post('/:id/end', requireAuth, async (req, res) => {
  try {
    await supabaseAdmin.rpc('complete_reading', { p_reading_id: req.params.id });
    const { data } = await supabaseAdmin.from('readings').select('*').eq('id', req.params.id).single();
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readingsRouter.post('/:id/review', requireAuth, requireRole('client'), async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { data: reading } = await supabaseAdmin.from('readings').select('reader_id').eq('id', req.params.id).single();
    if (!reading) return res.status(404).json({ error: 'Not found' });
    await supabaseAdmin.from('readings').update({ client_rating: rating, client_review: review }).eq('id', req.params.id);
    await supabaseAdmin.rpc('update_reader_rating', { p_reader_id: reading.reader_id, p_new_rating: rating });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readingsRouter.get('/', requireAuth, async (req, res) => {
  try {
    const col = req.user!.role === 'client' ? 'client_id' : 'reader_id';
    const { data, error } = await supabaseAdmin.from('readings').select('*')
      .eq(col, req.user!.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

readingsRouter.get('/:id/session-token', requireAuth, async (req, res) => {
  try {
    const { data: reading } = await supabaseAdmin.from('readings').select('*').eq('id', req.params.id).single();
    if (!reading) return res.status(404).json({ error: 'Not found' });
    if (reading.client_id !== req.user!.id && reading.reader_id !== req.user!.id)
      return res.status(403).json({ error: 'Forbidden' });
    const cfRes = await fetch(
      `https://rtc.live.cloudflare.com/v1/apps/${process.env.CLOUDFLARE_REALTIME_APP_ID}/sessions/new`,
      { method: 'POST', headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_REALTIME_TOKEN}`, 'Content-Type': 'application/json' } }
    );
    const session = await cfRes.json() as any;
    res.json({ sessionToken: session.sessionId, roomName: reading.cf_room_name || reading.id, readingId: reading.id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
