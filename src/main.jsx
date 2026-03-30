import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

const AIAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Assistant. How can I help you today?' }
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
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: content.replace(/\*\*/g, '') }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please check your network." }]);
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
          placeholder="Ask me anything..."
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

const AIBriefing = () => (
  <div className="p-4 bg-blue-500/[0.02] border border-blue-500/10 rounded-2xl text-[11px] text-slate-400 font-medium">
    Select a country on the map to generate a real-time summary.
  </div>
);

const MarketTicker = () => (
  <div className="flex gap-4 overflow-hidden whitespace-nowrap text-[10px] font-bold text-emerald-400/80">
    BITCOIN: $68,432 &bull; GOLD: $2,185 &bull; NASDAQ100: +1.4% &bull; USD/INR: 83.12
  </div>
);

const NewsFeed = () => (
  <div className="text-center py-12 text-slate-500 text-xs font-medium">
    <i className="fas fa-rss-square block text-2xl mb-3 opacity-20"></i>
    Click a sector to populate global news feeds.
  </div>
);

const WeatherIntel = () => (
  <div className="flex flex-col items-center">
    <div className="text-5xl font-black text-white leading-none">--&deg;</div>
    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-[.2em] mt-2">WEATHER_OFFLINE</div>
  </div>
);

const mountPoints = [
  { id: 'react-ai-briefing', comp: <AIBriefing /> },
  { id: 'react-stock-ticker', comp: <MarketTicker /> },
  { id: 'react-news-feed', comp: <NewsFeed /> },
  { id: 'react-weather-intel', comp: <WeatherIntel /> },
  { id: 'react-ai-assistant', comp: <AIAssistant /> },
];

mountPoints.forEach(({ id, comp }) => {
  const el = document.getElementById(id);
  if (el) {
    ReactDOM.createRoot(el).render(
      <React.StrictMode>
        {comp}
      </React.StrictMode>
    );
  }
});
