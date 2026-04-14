import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const HostedChat = () => {
  const { botId } = useParams();
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Loading Darpan360...' } // Default state before fetch
  ]);
  const [input, setInput] = useState('');
  const [botConfig, setBotConfig] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const [sessionId, setSessionId] = useState('');

  // 1. Generate or Retrieve session ID and fetch bot config on load
  useEffect(() => {
    // Check if the user already has an active session with this specific bot on this device
    let storedSession = localStorage.getItem(`chat_session_${botId}`);
    if (!storedSession) {
      storedSession = 'sess_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem(`chat_session_${botId}`, storedSession);
    }
    setSessionId(storedSession);

    const fetchConfigAndHistory = async () => {
      try {
        const configRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${botId}/config`);
        const configData = await configRes.json();
        
        if (!configRes.ok) throw new Error(configData.error);

        setBotConfig({
          name: configData.botName || "AI Assistant",
          color: configData.primaryColor || "#2563EB", 
          avatar: configData.avatarImgUrl || ""
        });

        // Config is valid! Now pull their past messages if any exist
        const historyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${botId}/history/${storedSession}`);
        const historyData = await historyRes.json();

        if (historyRes.ok && historyData.messages && historyData.messages.length > 0) {
            // Restore actual past chat thread
            setMessages(historyData.messages);
        } else {
            // New user, push the welcome message
            setMessages([{ role: 'model', content: "Hello! I am your AI Assistant. How can I help you today?" }]);
        }

      } catch (error) {
        console.error("Failed to load bot:", error);
        setMessages([{ role: 'model', content: "Gateway restricted. Bot not found." }]);
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

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, clientSessionId: sessionId })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      // If this is the first real message, the backend returns the actual botName/avatar
      if (data.botName) {
        setBotConfig(prev => ({ ...prev, name: data.botName, avatar: data.avatarImgUrl }));
      }

      setMessages(prev => [...prev, { role: 'model', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "⚠️ Gateway Timeout. " + error.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-builder-900 text-gray-200 font-sans">
      
      {/* Widget Header area matching specific Bot Color */}
      <header 
        className="p-4 shadow-md flex items-center gap-3 relative z-10"
        style={{ backgroundColor: botConfig?.color || '#1E1E1E' }}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center font-bold">
          {botConfig?.avatar ? (
            <img src={botConfig.avatar} alt="bot" className="w-full h-full object-cover" />
          ) : (
            "BOT"
          )}
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
                <text className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-builder-900 prose-pre:border prose-pre:border-builder-border">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </text>
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

      {/* The Billboard Engine & Input Box */}
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
        {/* Viral Billboard Trap! */}
        <div className="text-center mt-2 pb-1">
          <a href="/" target="_blank" className="text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-accent-500 transition-colors">
            ⚡ Powered By Darpan360
          </a>
        </div>
      </div>
      
    </div>
  );
};

export default HostedChat;
