import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

const AIAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ask about markets, regions, or headlines — concise answers, no fluff.' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `System: You are a professional news assistant. Answer concisely and clearly.\n\nUser: ${userMsg}` })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errText = data.error || data.message || res.statusText || 'Request failed';
        setMessages(prev => [...prev, { role: 'assistant', content: `Request failed: ${errText}` }]);
        return;
      }
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "No response — try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: content.replace(/\*\*/g, '') }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Couldn’t reach the server. Check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] rounded-xl overflow-hidden border border-white/[0.08] bg-[rgba(12,18,34,0.45)] backdrop-blur-md shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${m.role === 'user'
              ? 'bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-md shadow-sky-900/20'
              : 'bg-white/[0.05] text-slate-200 border border-white/[0.08]'
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] px-3 py-2.5 rounded-xl border border-white/[0.06] flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-sky-400/90 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-sky-400/90 rounded-full animate-bounce [animation-delay:75ms]"></span>
              <span className="w-1.5 h-1.5 bg-sky-400/90 rounded-full animate-bounce [animation-delay:150ms]"></span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3.5 border-t border-white/[0.06] bg-black/25 flex gap-2 items-center">
        <input
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 outline-none text-slate-100 text-xs font-sans placeholder:text-slate-600 focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20"
          placeholder="Message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button type="button" onClick={handleSend} className="shrink-0 w-9 h-9 rounded-lg border border-white/[0.1] bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 hover:text-white transition-colors flex items-center justify-center" aria-label="Send">
          <i className="fas fa-paper-plane text-xs"></i>
        </button>
      </div>
    </div>
  );
};

const assistantMount = document.getElementById('react-ai-assistant');
if (assistantMount) {
  ReactDOM.createRoot(assistantMount).render(
    <React.StrictMode>
      <AIAssistant />
    </React.StrictMode>
  );
}
