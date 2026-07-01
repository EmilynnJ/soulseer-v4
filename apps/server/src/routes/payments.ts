import { Router } from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../db';
import { requireAuth } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
export const paymentsRouter = Router();

paymentsRouter.post('/topup', requireAuth, async (req, res) => {
  try {
    const { amount_cents } = req.body;
    if (!amount_cents || amount_cents < 500) return res.status(400).json({ error: 'Min top-up $5.00' });
    const { data: user } = await supabaseAdmin.from('users').select('email').eq('id', req.user!.id).single();
    const intent = await stripe.paymentIntents.create({
      amount: amount_cents, currency: 'usd',
      metadata: { user_id: req.user!.id }, receipt_email: user?.email,
    });
    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

paymentsRouter.get('/balance', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('balance_cents').eq('id', req.user!.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

paymentsRouter.get('/transactions', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('transactions')
      .select('*').eq('user_id', req.user!.id).order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
