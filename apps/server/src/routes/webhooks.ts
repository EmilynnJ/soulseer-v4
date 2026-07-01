import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
export const webhooksRouter = Router();

webhooksRouter.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const userId = intent.metadata.user_id;
    const amount = intent.amount;
    if (userId) {
      const { data: user } = await supabaseAdmin.from('users').select('balance_cents').eq('id', userId).single();
      if (user) {
        await supabaseAdmin.from('users').update({ balance_cents: user.balance_cents + amount }).eq('id', userId);
        await supabaseAdmin.from('transactions').insert({
          user_id: userId, type: 'top_up', amount_cents: amount, stripe_payment_intent_id: intent.id
        });
      }
    }
  }
  res.json({ received: true });
});
