import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

const AIAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your NewsAtlas AI Assistant. Ask any question about global news, macroeconomic data, weather, or country profiles.' }
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
          responseText = `Comparing ${countries[0]} and ${countries[1]} in the intelligence dashboard.`;
        } else {
          responseText = "Format: `/compare [Country 1] vs [Country 2]` (e.g. `/compare India vs United States`).";
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
          responseText = `Showing weather and atmospheric data for "${arg}".`;
        } else {
          responseText = "Please specify a city. Format: `/weather [City Name]`.";
        }
      }
      else if (cmd === "/layer") {
        const layers = ["gdp", "growth", "default"];
        if (layers.includes(arg.toLowerCase()) && window.changeMapLayer) {
          const select = document.getElementById("map-layer-select");
          if (select) select.value = arg.toLowerCase();
          window.changeMapLayer(arg.toLowerCase());
          responseText = `Switched map layer overlay to ${arg.toUpperCase()}.`;
        } else {
          responseText = "Available layer modes: `/layer gdp`, `/layer growth`, or `/layer default`.";
        }
      }
      else {
        responseText = `Unknown command "${cmd}". You can type /compare, /weather, or /layer.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, location: window._currentCountryName || 'Global' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errText = data.error || data.message || "Service unavailable";
        setMessages(prev => [...prev, { role: 'assistant', isError: true, content: `Error: ${errText}` }]);
        return;
      }
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "No response generated. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: content.replace(/\*\*/g, '') }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', isError: true, content: "Unable to reach AI service. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[460px] max-h-[75vh] overflow-hidden bg-[var(--bg-surface)] transition-colors">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-xl text-xs leading-relaxed transition-colors ${m.role === 'user'
              ? 'bg-[var(--accent-primary)] text-white shadow-sm font-medium'
              : m.isError
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 font-mono text-[11px]'
                : 'bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-sans'
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-surface-subtle)] px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:75ms]"></span>
              <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:150ms]"></span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex gap-2 items-center transition-colors">
        <input
          className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3.5 py-2 outline-none text-[var(--text-primary)] text-xs font-sans placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] transition-all"
          placeholder="Ask about countries, macroeconomics, weather, or news..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button type="button" onClick={handleSend} className="shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors flex items-center justify-center shadow-sm" aria-label="Send message">
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
