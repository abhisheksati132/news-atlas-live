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

    if (userMsg.startsWith("/")) {
      const parts = userMsg.split(" ");
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(" ");
      
      let responseText = "";

      if (cmd === "/compare") {
        const countries = arg.split(" vs ");
        if (countries.length === 2 && window.handleCountryClickByName && window.toggleCompareMode) {
          window.compareModeActive = false;
          window.handleCountryClickByName(countries[0]);
          setTimeout(() => {
            window.toggleCompareMode();
            setTimeout(() => {
              window.handleCountryClickByName(countries[1]);
            }, 600);
          }, 600);
          responseText = `COMMAND EXECUTED: Commencing tactical compare mode sequence between "${countries[0]}" and "${countries[1]}".`;
        } else {
          responseText = "COMMAND ERROR: Invalid parameters. Format: `/compare [Country 1] vs [Country 2]` (e.g. `/compare India vs United States`).";
        }
      } 
      else if (cmd === "/weather") {
        if (arg && window.searchCityForTab) {
          window.switchTab("atmosphere");
          const searchInput = document.getElementById("atmosphere-city-search");
          if (searchInput) {
            searchInput.value = arg;
            window.searchCityForTab("atmosphere");
          }
          responseText = `COMMAND EXECUTED: Scanning meteorological telemetry zones for "${arg}".`;
        } else {
          responseText = "COMMAND ERROR: Missing target query. Format: `/weather [City Name]`.";
        }
      }
      else if (cmd === "/layer") {
        const layers = ["gdp", "growth", "default"];
        if (layers.includes(arg.toLowerCase()) && window.changeMapLayer) {
          const select = document.getElementById("map-layer-select");
          if (select) select.value = arg.toLowerCase();
          window.changeMapLayer(arg.toLowerCase());
          responseText = `COMMAND EXECUTED: Changing active visual choropleth sensor overlay to "${arg.toUpperCase()}".`;
        } else {
          responseText = "COMMAND ERROR: Invalid overlay mode. Available: `/layer gdp`, `/layer growth`, or `/layer default`.";
        }
      }
      else {
        responseText = `COMMAND ERROR: Unrecognized protocol code "${cmd}". Type /compare, /weather, or /layer.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `System: You are a professional news assistant. Answer concisely and clearly.\n\nUser: ${userMsg}` })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errText = data.error || data.message || `Provider returned status ${res.status}`;
        setMessages(prev => [...prev, { role: 'assistant', isError: true, content: `Intelligence Provider Unavailable: ${errText}` }]);
        return;
      }
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "No response — try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: content.replace(/\*\*/g, '') }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', isError: true, content: "Neural uplink unreachable. Check connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] rounded-[12px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-subtle)] transition-colors">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] px-3.5 py-2.5 rounded-[10px] text-[13px] leading-relaxed transition-colors ${m.role === 'user'
              ? 'bg-[var(--accent-primary)] text-white shadow-sm font-medium'
              : m.isError
                ? 'bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)]/25 font-mono text-[12px]'
                : 'bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-surface-subtle)] px-3 py-2 rounded-[10px] border border-[var(--border-subtle)] flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:75ms]"></span>
              <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:150ms]"></span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex gap-2 items-center transition-colors">
        <input
          className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[8px] px-3 py-2 outline-none text-[var(--text-primary)] text-xs font-sans placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-focus-ring)] transition-all"
          placeholder="Ask intelligence..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button type="button" onClick={handleSend} className="shrink-0 w-8 h-8 rounded-[8px] bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors flex items-center justify-center shadow-sm" aria-label="Send query">
          <i className="fas fa-paper-plane text-[11px]"></i>
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
