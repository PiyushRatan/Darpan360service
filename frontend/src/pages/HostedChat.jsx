import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ChatPageLoader } from '../components/Loaders';
import { apiFetch } from '../utils/api';

const createSessionId = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `sess_${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
};

const getDefaultAvatarUrl = () => `${globalThis.location?.origin || ''}/logo.png`;

const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return getDefaultAvatarUrl();

  try {
    return new URL(avatarUrl, globalThis.location?.origin || undefined).href;
  } catch {
    return getDefaultAvatarUrl();
  }
};

const postWidgetConfig = (botId, config) => {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'DARPAN_WIDGET_CONFIG',
      botId,
      botName: config.name,
      avatarImgUrl: config.avatar,
      primaryColor: config.color
    }, '*');
  }
};

const HostedChat = () => {
  const { botId } = useParams();
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Loading Darpan360...' } // Default state before fetch
  ]);
  const [input, setInput] = useState('');
  const [botConfig, setBotConfig] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const bottomRef = useRef(null);
  const [sessionId, setSessionId] = useState('');

  // 1. Generate or Retrieve session ID and fetch bot config on load
  useEffect(() => {
    // Check if the user already has an active session with this specific bot on this device
    let storedSession = localStorage.getItem(`chat_session_${botId}`);
    if (!/^sess_[a-f0-9]{32}$/.test(storedSession || '')) {
      storedSession = createSessionId();
      localStorage.setItem(`chat_session_${botId}`, storedSession);
    }
    setSessionId(storedSession);

    const fetchConfigAndHistory = async () => {
      try {
        const configData = await apiFetch(`/chat/${botId}/config`);

        const nextConfig = {
          name: configData.botName || "AI Assistant",
          color: configData.primaryColor || "#2563EB", 
          avatar: resolveAvatarUrl(configData.avatarImgUrl),
          welcomeMessage: configData.welcomeMessage || "Hello! I am your AI Assistant. How can I help you today?"
        };

        setBotConfig(nextConfig);
        postWidgetConfig(botId, nextConfig);

        // Config is valid! Now pull their past messages if any exist
        const historyData = await apiFetch(`/chat/${botId}/history/${storedSession}`);

        if (historyData.messages && historyData.messages.length > 0) {
            // Restore actual past chat thread
            setMessages(historyData.messages);
        } else {
            // New user, push the welcome message
            setMessages([{ role: 'model', content: nextConfig.welcomeMessage }]);
        }

      } catch (error) {
        console.error("Failed to load bot:", error);
        setMessages([{ role: 'model', content: "Gateway restricted. Bot not found." }]);
      } finally {
        setIsBooting(false);
      }
    };
    fetchConfigAndHistory();
  }, [botId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim().slice(0, 2000);
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      const data = await apiFetch(`/chat/${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, clientSessionId: sessionId })
      });

      // If this is the first real message, the backend returns the actual botName/avatar
      if (data.botName) {
        setBotConfig(prev => {
          const nextConfig = {
            ...prev,
            name: data.botName,
            avatar: data.avatarImgUrl ? resolveAvatarUrl(data.avatarImgUrl) : prev?.avatar,
            color: data.primaryColor || prev?.color,
            welcomeMessage: prev?.welcomeMessage
          };
          postWidgetConfig(botId, nextConfig);
          return nextConfig;
        });
      }

      setMessages(prev => [...prev, { role: 'model', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: " Gateway Timeout. " + error.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isBooting) {
    return <ChatPageLoader label="Opening secure chat" />;
  }

  return (
    <div className="flex flex-col h-screen bg-builder-900 text-gray-200 font-sans">
      
      {/* Widget Header area matching specific Bot Color */}
      <header 
        className="p-4 shadow-md flex items-center gap-3 relative z-10"
        style={{ backgroundColor: botConfig?.color || '#1E1E1E' }}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center font-bold">
          <img
            src={botConfig?.avatar || getDefaultAvatarUrl()}
            alt={`${botConfig?.name || 'Bot'} profile`}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getDefaultAvatarUrl();
              event.currentTarget.className = 'h-7 w-7 object-contain';
            }}
          />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm">{botConfig?.name || "Loading..."}</h2>
          <p className="text-xs text-white/70">Powered by Darpan360</p>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-builder-700 text-white border border-builder-border rounded-br-none' 
                  : 'bg-builder-800 text-gray-200 border border-builder-border rounded-bl-none shadow-sm'
              }`}
            >
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-builder-900 prose-pre:border prose-pre:border-builder-border">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-builder-800 border border-builder-border p-3 rounded-lg rounded-bl-none flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chat input */}
      <div className="p-3 bg-builder-800 border-t border-builder-border">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Type your message..." 
            className="w-full bg-builder-900 border border-builder-border rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:border-accent-500 text-white shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1.5 p-1.5 bg-accent-500 rounded-full text-white disabled:opacity-50"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
        {/* Attribution */}
        <div className="text-center mt-2 pb-1">
          <a href="/" target="_blank" className="text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-accent-500 transition-colors">
            Powered by Darpan360
          </a>
        </div>
      </div>
      
    </div>
  );
};

export default HostedChat;

