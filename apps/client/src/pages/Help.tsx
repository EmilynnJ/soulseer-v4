import { useState } from 'react';

const faqs = [
  {
    q: 'How does pay-per-minute work?',
    a: 'You fund your account with a balance before starting a session. Once connected with a reader, you are charged per minute at the rate shown on their profile. Your session ends when you click \'End Session\' or your balance runs low.',
  },
  {
    q: 'How do I add funds to my account?',
    a: 'Go to your Dashboard and click \'+ Add Funds\'. You can top up using any major credit or debit card via our secure Stripe payment processor.',
  },
  {
    q: 'Are the readers verified?',
    a: 'Yes. Every reader on SoulSeer is personally reviewed and approved by our admin team. We do not allow self-registration as a reader; all reader accounts are created by administrators.',
  },
  {
    q: 'What happens if I disconnect during a session?',
    a: 'There is a 2-minute grace period if either party disconnects unexpectedly. If reconnection happens within that window, the session continues. Otherwise the session is automatically ended and you are charged only for time used.',
  },
  {
    q: 'How are readers paid?',
    a: 'Readers receive 60% of all session revenue. Payouts are processed via Stripe Connect and are typically available within 2 business days of a completed session.',
  },
  {
    q: 'Can I become a reader on SoulSeer?',
    a: 'Reader accounts are created by administrators only. If you are an experienced practitioner interested in joining, please contact us through the support email below.',
  },
  {
    q: 'How do I report an issue with a session?',
    a: 'Contact our support team at support@soulseer.app with your session ID (visible in your Dashboard reading history). We review all disputes within 48 hours.',
  },
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-300 mb-4">Help Center</h1>
        <p className="text-gray-400 mb-12">Find answers to common questions below, or contact support if you need further assistance.</p>

        <div className="space-y-3 mb-16">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-gray-900 rounded-xl border border-purple-900/30 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition"
              >
                <span className="font-medium text-purple-200">{faq.q}</span>
                <span className="text-purple-400 text-xl">{open === i ? '\u2212' : '+'}</span>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-gray-300 text-sm leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-purple-900/20 rounded-2xl p-8 border border-purple-700/30 text-center">
          <h2 className="text-xl font-semibold text-purple-200 mb-2">Still need help?</h2>
          <p className="text-gray-400 mb-4">Our support team is here for you.</p>
          <a href="mailto:support@soulseer.app" className="text-purple-400 hover:text-purple-300 font-medium">support@soulseer.app</a>
        </div>
      </div>
    </div>
  );
}
