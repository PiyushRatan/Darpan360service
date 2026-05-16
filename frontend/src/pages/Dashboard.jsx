import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, CodeBracketIcon, ChartBarIcon, Cog8ToothIcon, ArrowRightOnRectangleIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { secureFetch } from '../utils/api';
import { auth } from '../config/firebase';
import { SubPageLoader } from '../components/Loaders';

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
  const [toasts, setToasts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const createToastId = () => (
    globalThis.crypto?.randomUUID?.() || `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`
  );

  const pushToast = ({ type = 'info', title, message, actionLabel, onAction, duration = 4200 }) => {
    const id = createToastId();
    setToasts(prev => [...prev, { id, type, title, message, actionLabel, onAction }]);

    if (duration) {
      window.setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getErrorMessage = (error, fallback) => {
    if (Array.isArray(error?.details) && error.details.length > 0) {
      return error.details.join(' ');
    }

    return error?.message || fallback;
  };

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
      pushToast({
        type: 'error',
        title: 'Could not load bots',
        message: getErrorMessage(error, 'Refresh the page or check that the backend is running.')
      });
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
    if (!formData.botName.trim()) {
      pushToast({
        type: 'error',
        title: 'Bot name required',
        message: 'Give this chatbot an internal name before saving.'
      });
      return;
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(formData.primaryColor)) {
      pushToast({
        type: 'error',
        title: 'Invalid brand color',
        message: 'Use a 6-digit hex color like #2563EB.'
      });
      return;
    }

    // Convert comma-separated string to an array of domains, trimming whitespace
    const parsedDomains = formData.allowedDomains
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    if (parsedDomains.length > 20) {
      pushToast({
        type: 'error',
        title: 'Too many domains',
        message: 'Add no more than 20 allowed domains for one chatbot.'
      });
      return;
    }

    if (parsedDomains.some(domain => domain.length > 253)) {
      pushToast({
        type: 'error',
        title: 'Invalid domain',
        message: 'Each allowed domain must be under 253 characters.'
      });
      return;
    }

    if (formData.avatarImgUrl.trim()) {
      try {
        new URL(formData.avatarImgUrl.trim());
      } catch (error) {
        pushToast({
          type: 'error',
          title: 'Invalid avatar URL',
          message: 'Use a full URL like https://example.com/logo.png.'
        });
        return;
      }
    }

    const payload = {
        botName: formData.botName.trim(),
        allowedDomains: parsedDomains,
        systemContext: formData.systemContext,
        knowledgeBaseText: formData.knowledgeBaseText,
        primaryColor: formData.primaryColor,
        avatarImgUrl: formData.avatarImgUrl.trim()
    };

    try {
      setSaving(true);
      if (modalMode === 'create') {
        await secureFetch('/bots', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        pushToast({
          type: 'success',
          title: 'Bot created',
          message: 'Your chatbot is ready to configure and embed.'
        });
      } else if (modalMode === 'edit') {
        await secureFetch(`/bots/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        pushToast({
          type: 'success',
          title: 'Changes saved',
          message: 'The chatbot configuration was updated.'
        });
      }
      setIsModalOpen(false);
      fetchBots();
    } catch (error) {
      console.error("Error saving bot:", error);
      pushToast({
        type: 'error',
        title: modalMode === 'create' ? 'Bot was not created' : 'Changes were not saved',
        message: getErrorMessage(error, 'Check the chatbot fields and try again.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBot = async (id) => {
    pushToast({
      type: 'warning',
      title: 'Delete this bot?',
      message: 'This removes the bot configuration immediately.',
      actionLabel: 'Delete',
      duration: 9000,
      onAction: async () => {
        try {
          setDeletingId(id);
          await secureFetch(`/bots/${id}`, { method: 'DELETE' });
          await fetchBots();
          pushToast({
            type: 'success',
            title: 'Bot deleted',
            message: 'The chatbot was removed.'
          });
        } catch (error) {
          console.error("Error deleting bot:", error);
          pushToast({
            type: 'error',
            title: 'Bot was not deleted',
            message: getErrorMessage(error, 'Try again in a moment.')
          });
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleCopy = async (text, botId, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(botId);
      setCopiedType(type);
      pushToast({
        type: 'success',
        title: type === 'embed' ? 'Embed copied' : 'Link copied',
        message: type === 'embed' ? 'Paste this script into your website.' : 'Share this hosted chat link.'
      });
      setTimeout(() => {
        setCopiedId(null);
        setCopiedType(null);
      }, 2000);
    } catch (error) {
      console.error("Copy Error:", error);
      pushToast({
        type: 'error',
        title: 'Could not copy',
        message: 'Your browser blocked clipboard access.'
      });
    }
  };

  if (!currentUser || loading) return <SubPageLoader label="Loading dashboard" />;

  return (
    <div className="min-h-screen bg-builder-900 flex text-gray-200">
      <div className="fixed right-4 top-4 z-[70] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toast.type === 'success'
              ? CheckCircleIcon
              : toast.type === 'error'
                ? ExclamationTriangleIcon
                : InformationCircleIcon;
            const color = toast.type === 'success'
              ? 'text-emerald-400'
              : toast.type === 'error'
                ? 'text-red-400'
                : toast.type === 'warning'
                  ? 'text-amber-400'
                  : 'text-accent-500';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                className="border border-builder-border bg-builder-800 p-4 shadow-xl"
              >
                <div className="flex gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white">{toast.title}</div>
                    {toast.message && <div className="mt-1 text-sm leading-5 text-gray-400">{toast.message}</div>}
                    {toast.actionLabel && (
                      <button
                        type="button"
                        onClick={async () => {
                          removeToast(toast.id);
                          await toast.onAction?.();
                        }}
                        className="mt-3 rounded border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:border-red-400 hover:text-red-200"
                      >
                        {toast.actionLabel}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-500 transition-colors hover:text-white"
                    aria-label="Dismiss notification"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-builder-border p-4 hidden md:flex flex-col">
        <h1 className="text-xl font-bold tracking-tight text-white mb-8 cursor-pointer" onClick={() => navigate('/')}>
          Darpan360
        </h1>
        
        <nav className="flex-1 space-y-1">
          <button type="button" className="flex w-full items-center gap-3 rounded bg-builder-800 px-3 py-2 text-left font-medium text-white">
            <ChartBarIcon className="w-5 h-5 text-accent-500" />
            Overview
          </button>
          <Link to="/docs" className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-builder-800 hover:text-white">
            <BookOpenIcon className="h-5 w-5 text-gray-500" />
            Docs
          </Link>
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
              No bots available. Create your first bot to begin.
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
                disabled={deletingId === bot._id}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                title="Delete Bot"
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
                {modalMode === 'create' ? 'Create New Bot' : 'Configure Bot'}
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
                    <span>System Prompt</span>
                  </label>
                  <textarea 
                    className="input-field min-h-[60px] shadow-inner" 
                    value={formData.systemContext}
                    onChange={e => setFormData({...formData, systemContext: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide flex justify-between">
                    <span>Knowledge Base Content</span>
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
                        <span className="text-[9px] text-accent-500 ml-2 normal-case truncate">(Max size 2MB link)</span>
                      </label>
                      <input type="text" className="input-field shadow-inner" value={formData.avatarImgUrl} onChange={e => setFormData({...formData, avatarImgUrl: e.target.value})} placeholder="https://example.com/logo.png" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-builder-border">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSaveBot} disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save Changes'}
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
