import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, CodeBracketIcon, ChartBarIcon, Cog8ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { secureFetch } from '../utils/api';
import { auth } from '../config/firebase';

const Dashboard = () => {
  const { currentUser, dbUser } = useAuth();
  const navigate = useNavigate();
  
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  
  // Bot Form Payload State
  const [formData, setFormData] = useState({
    id: null,
    botName: '',
    allowedDomains: '', // We use a comma-separated string in the UI
    systemContext: 'You are a helpful assistant.',
    knowledgeBaseText: '',
    primaryColor: '#2563EB',
    avatarImgUrl: ''
  });

  // Notification State for Copying
  const [copiedId, setCopiedId] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    if (!currentUser) navigate('/login');
    else fetchBots();
  }, [currentUser, navigate]);

  const fetchBots = async () => {
    try {
      const data = await secureFetch('/bots');
      setBots(data);
    } catch (error) {
      console.error("Error fetching bots:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, bot = null) => {
    setModalMode(mode);
    if (mode === 'edit' && bot) {
      setFormData({
        id: bot._id,
        botName: bot.botName,
        allowedDomains: bot.allowedDomains.join(', '), // Convert array back to string
        systemContext: bot.systemContext || '',
        knowledgeBaseText: bot.knowledgeBaseText || '',
        primaryColor: bot.primaryColor || '#2563EB',
        avatarImgUrl: bot.avatarImgUrl || ''
      });
    } else {
      setFormData({
        id: null,
        botName: '',
        allowedDomains: 'localhost',
        systemContext: 'You are a professional, helpful assistant. Answer questions strictly based ONLY on the provided Knowledge Base below.',
        knowledgeBaseText: '',
        primaryColor: '#2563EB',
        avatarImgUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveBot = async () => {
    if (!formData.botName) return;

    // Convert comma-separated string to an array of domains, trimming whitespace
    const parsedDomains = formData.allowedDomains
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    const payload = {
        botName: formData.botName,
        allowedDomains: parsedDomains,
        systemContext: formData.systemContext,
        knowledgeBaseText: formData.knowledgeBaseText,
        primaryColor: formData.primaryColor,
        avatarImgUrl: formData.avatarImgUrl
    };

    try {
      if (modalMode === 'create') {
        await secureFetch('/bots', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      } else if (modalMode === 'edit') {
        await secureFetch(`/bots/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchBots();
    } catch (error) {
      console.error("Error saving bot:", error);
    }
  };

  const handleDeleteBot = async (id) => {
    if(!window.confirm("Are you sure you want to completely erase this AI Bot?")) return;
    try {
      await secureFetch(`/bots/${id}`, { method: 'DELETE' });
      fetchBots();
    } catch (error) {
      console.error("Error deleting bot:", error);
    }
  };

  const handleCopy = (text, botId, type) => {
    navigator.clipboard.writeText(text);
    setCopiedId(botId);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedType(null);
    }, 2000);
  };

  if (!currentUser || loading) return <div className="min-h-screen bg-builder-900 flex items-center justify-center text-white">Loading Core Systems...</div>;

  return (
    <div className="min-h-screen bg-builder-900 flex text-gray-200">
      
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-builder-border p-4 hidden md:flex flex-col">
        <h1 className="text-xl font-bold tracking-tight text-white mb-8 cursor-pointer" onClick={() => navigate('/')}>
          Darpan360
        </h1>
        
        <nav className="flex-1 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-builder-800 text-white rounded font-medium">
            <ChartBarIcon className="w-5 h-5 text-accent-500" />
            Overview
          </a>
        </nav>

        {/* User Google Avatar Profile */}
        <div className="mt-auto border-t border-builder-border pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <img src={currentUser.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-8 h-8 rounded-full border border-builder-border" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white truncate w-28">{currentUser.displayName || 'User'}</span>
                {dbUser?.role === 'admin' && <span className="text-[10px] uppercase text-accent-500 font-bold tracking-widest">Admin</span>}
              </div>
            </div>
            <button onClick={() => auth.signOut()} className="text-gray-500 hover:text-white transition-colors">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Active Bots</h2>
            <p className="text-gray-400 text-sm mt-1">Manage and track your deployed AI gateways.</p>
          </div>
          
          <button onClick={() => openModal('create')} className="btn-primary">
            <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
            New Bot
          </button>
        </header>

        {/* Dense Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {bots.length === 0 ? (
            <div className="col-span-2 text-center py-16 text-gray-500 border border-dashed border-builder-border rounded card">
              No bots deployed yet. Provision your first Bot to start.
            </div>
          ) : bots.map((bot, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.2 }}
              key={bot._id} 
              className="card flex flex-col justify-between group relative"
            >
              <button 
                onClick={() => handleDeleteBot(bot._id)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                title="Erase Bot"
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>

              <div>
                <div className="flex justify-between items-start mb-4 pr-8">
                  <h3 className="font-semibold text-white ml-1">{bot.botName}</h3>
                  <div className="px-2 py-1 bg-builder-900 border border-builder-border text-xs rounded text-gray-400 font-mono">
                    ID: {bot._id.substring(bot._id.length - 6).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-builder-border/50 truncate">
                    <span className="text-gray-400 shrink-0 mr-4">Allowed Domains</span>
                    <span className="text-gray-200 font-medium truncate">
                      {bot.allowedDomains.length > 0 ? bot.allowedDomains.join(', ') : 'Any Domain'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bot Action Footer */}
              <div className="mt-8 pt-4 border-t border-builder-border flex items-center justify-between">
                <button 
                  onClick={() => openModal('edit', bot)}
                  className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Cog8ToothIcon className="w-4 h-4" /> Config
                </button>
                <div className="flex gap-4">
                  <button 
                    className="text-accent-500 hover:text-accent-600 flex items-center gap-2 text-sm font-bold transition-colors"
                    onClick={() => handleCopy(`${import.meta.env.VITE_FRONTEND_URL}/chat/${bot._id}`, bot._id, 'link')}
                  >
                    <CodeBracketIcon className="w-4 h-4" /> 
                    {copiedId === bot._id && copiedType === 'link' ? "Copied Link!" : "Web Link"}
                  </button>
                  <button 
                    className="text-accent-500 hover:text-accent-600 flex items-center gap-2 text-sm font-bold transition-colors"
                    onClick={() => handleCopy(`<script src="${import.meta.env.VITE_FRONTEND_URL}/widget.js" data-bot-id="${bot._id}"></script>`, bot._id, 'embed')}
                  >
                    <CodeBracketIcon className="w-4 h-4" /> 
                    {copiedId === bot._id && copiedType === 'embed' ? "Copied Script!" : "Copy Embed"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dynamic Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-builder-800 border border-builder-border rounded p-6 w-full max-w-2xl shadow-2xl my-8"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {modalMode === 'create' ? 'Provision New Bot' : 'Configure Bot'}
              </h3>
              <p className="text-gray-400 text-sm mb-6">Define the specific AI context and knowledge data below.</p>
              
              <div className="space-y-4">
                {/* Core Settings */}
                <div className="border-b border-builder-border pb-4">
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Internal Bot Name</label>
                  <input type="text" className="input-field shadow-inner" value={formData.botName} onChange={e => setFormData({...formData, botName: e.target.value})} placeholder="e.g. Enterprise Sales Agent" />
                </div>

                {/* Domains */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Domain Whitelist (Comma Separated)</label>
                  <input type="text" className="input-field shadow-inner" value={formData.allowedDomains} onChange={e => setFormData({...formData, allowedDomains: e.target.value})} placeholder="e.g. localhost, acme.com" />
                </div>

                {/* AI Configuration */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide flex justify-between">
                    <span>System Prompt (Core Brain)</span>
                  </label>
                  <textarea 
                    className="input-field min-h-[60px] shadow-inner" 
                    value={formData.systemContext}
                    onChange={e => setFormData({...formData, systemContext: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide flex justify-between">
                    <span>Knowledge Base Dump (Strict Rules)</span>
                  </label>
                  <textarea 
                    className="input-field min-h-[140px] shadow-inner border-accent-500/30" 
                    value={formData.knowledgeBaseText}
                    onChange={e => setFormData({...formData, knowledgeBaseText: e.target.value})}
                    placeholder="Paste all company FAQs, pricing tables, or context here..."
                  />
                </div>
                
                {/* Aesthetic Configuration */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 border-b border-builder-border pb-2 mt-4">
                    <span className="bg-accent-500/20 text-accent-500 px-2 py-0.5 rounded text-xs">UI Options</span> 
                    Interface Customization
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Brand Color (Hex)</label>
                      <input type="text" className="input-field shadow-inner" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} placeholder="#2563EB" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide flex justify-between">
                        Bot Avatar Image URL
                        <span className="text-[9px] text-accent-500 ml-2 normal-case truncate">(Strict max size 2MB link)</span>
                      </label>
                      <input type="text" className="input-field shadow-inner" value={formData.avatarImgUrl} onChange={e => setFormData({...formData, avatarImgUrl: e.target.value})} placeholder="https://example.com/logo.png" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-builder-border">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSaveBot} className="btn-primary">
                  {modalMode === 'create' ? 'Provision' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
