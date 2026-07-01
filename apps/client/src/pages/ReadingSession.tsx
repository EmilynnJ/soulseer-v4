import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

type SessionStatus = 'connecting' | 'active' | 'ended' | 'error';

interface ChatMessage {
  id: string;
  sender: 'client' | 'reader';
  text: string;
  timestamp: Date;
}

export default function ReadingSession() {
  const { readerId } = useParams<{ readerId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [status, setStatus] = useState<SessionStatus>('connecting');
  const [elapsed, setElapsed] = useState(0); // seconds
  const [cost, setCost] = useState(0); // cents
  const [ratePerMin, setRatePerMin] = useState(200); // cents/min
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [readerName, setReaderName] = useState('Reader');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const GRACE_SECONDS = 120; // 2-minute grace period

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    initSession();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const initSession = async () => {
    try {
      const token = await getToken();
      // Fetch reader info
      const readerRes = await fetch(`/api/readers/${readerId}`);
      const readerData = await readerRes.json();
      setReaderName(readerData.reader?.full_name || 'Reader');
      setRatePerMin(readerData.reader?.rate_per_minute || 200);

      // Start session
      const res = await fetch('/api/readings/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reader_id: readerId }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus('error'); return; }
      setSessionId(data.reading_id);
      setStatus('active');
      startTimer(readerData.reader?.rate_per_minute || 200);
    } catch {
      setStatus('error');
    }
  };

  const startTimer = (rate: number) => {
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        setCost(Math.floor((next / 60) * rate));
        return next;
      });
    }, 1000);
  };

  const endSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('ended');
    if (!sessionId) return;
    const token = await getToken();
    await fetch(`/api/readings/${sessionId}/end`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }).catch(() => {});
  }, [sessionId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'active') return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'client',
      text: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    // TODO: send via Cloudflare Realtime WebSocket
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (status === 'error') return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      <p className="text-red-400 text-lg mb-4">Failed to start session. Check your balance or try again.</p>
      <button onClick={() => navigate('/browse')} className="px-6 py-2 bg-purple-600 rounded-lg">Back to Browse</button>
    </div>
  );

  if (status === 'ended') return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      <h2 className="text-3xl font-bold text-purple-300 mb-2">Session Ended</h2>
      <p className="text-gray-400 mb-2">Duration: {formatTime(elapsed)}</p>
      <p className="text-green-400 text-2xl font-bold mb-6">${(cost / 100).toFixed(2)} charged</p>
      <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">Go to Dashboard</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-purple-900/40 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-purple-200">{readerName}</p>
          <p className="text-xs text-gray-400">{status === 'connecting' ? 'Connecting...' : `${formatTime(elapsed)} • $${(cost / 100).toFixed(2)}`}</p>
        </div>
        <button
          onClick={endSession}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-sm font-medium"
        >
          End Session
        </button>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 && status === 'active' && (
          <p className="text-center text-gray-500 text-sm">Session started. Say hello to {readerName}!</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
              msg.sender === 'client' ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-gray-900 border-t border-purple-900/40 px-4 py-3 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={status !== 'active'}
          className="flex-1 bg-gray-800 border border-purple-700 rounded-lg px-4 py-2 text-white focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status !== 'active' || !input.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg font-medium transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
