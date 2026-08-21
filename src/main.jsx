import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

const AIAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your NewsAtlas Geopolitical & Economic Analyst. Ask any question about country profiles, macroeconomic stability, trade, real-time news, or weather forecasts.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const scrollRef = useRef(null);

  const currentCountry = window._currentCountryName || 'Global';

  const promptChips = [
    { label: '📈 Macroeconomic Outlook', prompt: `Summarize key macroeconomic indicators, GDP, inflation, and growth drivers for ${currentCountry}.` },
    { label: '⚡ Geopolitical Risk', prompt: `What are the primary geopolitical, regional security, and trade risks for ${currentCountry}?` },
    { label: '🌦️ Climate & Weather', prompt: `Provide an environmental and meteorological summary for ${currentCountry}.` },
    { label: '💱 Currency & Forex', prompt: `Analyze currency stability and central bank policy dynamics for ${currentCountry}.` },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  const handleSendPrompt = async (textToSend) => {
    const userMsg = (textToSend || input).trim();
    if (!userMsg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    if (!textToSend) setInput('');

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
        const errText = data.error || data.message || "Service temporarily unavailable";
        setMessages(prev => [...prev, { role: 'assistant', isError: true, content: `Error: ${errText}` }]);
        return;
      }
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || data.response || "No analysis generated. Please refine your query.";
      setMessages(prev => [...prev, { role: 'assistant', content: content.replace(/\*\*/g, '') }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', isError: true, content: "Unable to reach AI service. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation reset. Focused on ${currentCountry}. Ask any geopolitical, market, or macroeconomic question.`
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[520px] max-h-[80vh] overflow-hidden bg-[var(--bg-surface)] transition-colors">
      {/* Context & Action Bar */}
      <div className="px-4 py-2 bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase font-semibold">Active Sector:</span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-bold">
            {currentCountry}
          </span>
        </div>
        <button
          onClick={handleResetChat}
          className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold"
          title="Reset conversation"
        >
          <i className="fas fa-redo-alt text-[9px]"></i>
          <span>Clear</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`relative group max-w-[90%] px-4 py-3 rounded-2xl text-xs leading-relaxed transition-all ${
              m.role === 'user'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm font-medium rounded-tr-sm'
                : m.isError
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[11px] rounded-tl-sm'
                  : 'bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-sm whitespace-pre-line font-sans'
            }`}>
              {m.content}

              {/* Copy message button */}
              {m.role === 'assistant' && !m.isError && (
                <button
                  onClick={() => copyMessage(m.content, i)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 text-[10px]"
                  title="Copy analysis"
                >
                  <i className={`fas ${copiedIdx === i ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-surface-subtle)] px-4 py-3 rounded-2xl rounded-tl-sm border border-[var(--border-subtle)] flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:100ms]"></span>
              <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:200ms]"></span>
              <span className="text-[11px] font-mono text-slate-400 ml-1">Analyzing telemetry...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(chip.prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--accent-primary)] text-slate-300 hover:text-white transition-all font-sans font-medium text-left"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Composer */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex gap-2 items-center transition-colors">
        <input
          className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 outline-none text-[var(--text-primary)] text-xs font-sans placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] transition-all"
          placeholder={`Ask anything about ${currentCountry}... (or type /compare, /weather, /layer)`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendPrompt();
            }
          }}
        />
        <button
          type="button"
          onClick={() => handleSendPrompt()}
          disabled={loading || !input.trim()}
          className="shrink-0 w-9 h-9 rounded-xl bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm"
          aria-label="Send query"
        >
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
