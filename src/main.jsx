import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

const AIAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Orbital Link Established. I am your Strategic Assistant. How can I assist with your mission?' }
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
      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "Uplink intermittent. Please repeat query.";
      setMessages(prev => [...prev, { role: 'assistant', content: content.replace(/\*\*/g, '') }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Signal lost. Check network telemetry." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${m.role === 'user'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white/[0.04] text-slate-300 border border-white/10'
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/5 flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
        <input
          className="flex-1 bg-transparent border-none outline-none text-white text-xs font-mono placeholder-slate-700"
          placeholder="Initiate command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="text-blue-400 hover:text-white transition-colors">
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
