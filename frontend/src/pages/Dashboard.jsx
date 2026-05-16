import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, CodeBracketIcon, ChartBarIcon, Cog8ToothIcon, ArrowRightOnRectangleIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon, BookOpenIcon, SparklesIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { secureFetch } from '../utils/api';
import { auth } from '../config/firebase';
import { SubPageLoader } from '../components/Loaders';
import {
  ASSISTANT_ROLES,
  BASE_GENERATOR_FIELDS,
  CAPABILITY_OPTIONS,
  LANGUAGE_STYLES,
  ROLE_GENERATOR_HINTS,
  buildOpeningMessage,
  buildSystemContext,
  getRoleById,
  getToneOptions
} from '../config/assistantSetup';

const trimTrailingSlash = (value) => (value || '').replace(/\/$/, '');

const escapeHtmlAttribute = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const getFrontendBaseUrl = () => (
  trimTrailingSlash(import.meta.env.VITE_FRONTEND_URL || globalThis.location?.origin || 'http://localhost:5173')
);

const createHostedChatUrl = (botId) => `${getFrontendBaseUrl()}/chat/${botId}`;

const createEmbedScript = (bot) => {
  const avatarAttribute = bot.avatarImgUrl
    ? ` data-avatar-url="${escapeHtmlAttribute(bot.avatarImgUrl)}"`
    : '';

  return `<script src="${getFrontendBaseUrl()}/widget.js" data-bot-id="${escapeHtmlAttribute(bot._id)}"${avatarAttribute} crossorigin="anonymous"></script>`;
};

const DEFAULT_CAPABILITIES = ['answer-questions', 'generate-text', 'workflow-help'];
const MAX_ALLOWED_DOMAINS = 2;

const createEmptyGeneratorAnswers = () => (
  BASE_GENERATOR_FIELDS.reduce((answers, field) => ({ ...answers, [field.id]: '' }), {})
);

const normalizeDomainInput = (value) => {
  const trimmed = String(value || '').trim().toLowerCase();
  if (!trimmed) return '';

  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname.replace(/^www\./, '');
  } catch {
    return trimmed.split('/')[0].split(':')[0].replace(/^www\./, '');
  }
};

const isValidDomainInput = (domain) => (
  domain === 'localhost'
  || /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)
);

const getMissingGeneratorFields = (answers) => (
  BASE_GENERATOR_FIELDS.filter((field) => !String(answers[field.id] || '').trim())
);

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
    assistantRole: 'general-assistant',
    languageStyle: 'english',
    tone: 'Professional',
    capabilities: DEFAULT_CAPABILITIES,
    allowedDomains: [],
    welcomeMessage: '',
    systemContext: '',
    advancedInstructions: '',
    knowledgeBaseText: '',
    primaryColor: '#2563EB',
    avatarImgUrl: ''
  });
  const [domainDraft, setDomainDraft] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorAnswers, setGeneratorAnswers] = useState(createEmptyGeneratorAnswers);
  const [generatingReference, setGeneratingReference] = useState(false);
  const [createdBotPrompt, setCreatedBotPrompt] = useState(null);

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
    setDomainDraft('');
    setShowAdvanced(false);
    setGeneratorAnswers(createEmptyGeneratorAnswers());
    setCreatedBotPrompt(null);
    if (mode === 'edit' && bot) {
      const assistantRole = bot.assistantRole || 'general-assistant';
      const toneOptions = getToneOptions(assistantRole);
      setFormData({
        id: bot._id,
        botName: bot.botName,
        assistantRole,
        languageStyle: bot.languageStyle || 'english',
        tone: toneOptions.includes(bot.tone) ? bot.tone : toneOptions[0],
        capabilities: Array.isArray(bot.capabilities) && bot.capabilities.length > 0 ? bot.capabilities : DEFAULT_CAPABILITIES,
        allowedDomains: Array.isArray(bot.allowedDomains) ? bot.allowedDomains.slice(0, MAX_ALLOWED_DOMAINS) : [],
        welcomeMessage: bot.welcomeMessage || '',
        systemContext: bot.systemContext || '',
        advancedInstructions: bot.advancedInstructions || '',
        knowledgeBaseText: bot.knowledgeBaseText || '',
        primaryColor: bot.primaryColor || '#2563EB',
        avatarImgUrl: bot.avatarImgUrl || ''
      });
    } else {
      setFormData({
        id: null,
        botName: '',
        assistantRole: 'general-assistant',
        languageStyle: 'english',
        tone: 'Professional',
        capabilities: DEFAULT_CAPABILITIES,
        allowedDomains: [],
        welcomeMessage: '',
        systemContext: '',
        advancedInstructions: '',
        knowledgeBaseText: '',
        primaryColor: '#2563EB',
        avatarImgUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const updateAssistantRole = (assistantRole) => {
    const toneOptions = getToneOptions(assistantRole);
    setFormData(prev => ({
      ...prev,
      assistantRole,
      tone: toneOptions.includes(prev.tone) ? prev.tone : toneOptions[0]
    }));
    pushToast({
      type: 'info',
      title: 'Role updated',
      message: `${getRoleById(assistantRole).label} behavior selected.`
    });
  };

  const toggleCapability = (capabilityId) => {
    setFormData(prev => {
      const hasCapability = prev.capabilities.includes(capabilityId);
      const capabilities = hasCapability
        ? prev.capabilities.filter(item => item !== capabilityId)
        : [...prev.capabilities, capabilityId];

      return {
        ...prev,
        capabilities: capabilities.length > 0 ? capabilities : ['answer-questions']
      };
    });
  };

  const handleAddDomain = () => {
    const domain = normalizeDomainInput(domainDraft);

    if (!domain) return;

    if (!isValidDomainInput(domain)) {
      pushToast({
        type: 'error',
        title: 'Invalid domain',
        message: 'Use a real domain like example.com or localhost.'
      });
      return;
    }

    if (formData.allowedDomains.includes(domain)) {
      pushToast({
        type: 'info',
        title: 'Domain already added',
        message: `${domain} is already in the whitelist.`
      });
      setDomainDraft('');
      return;
    }

    if (formData.allowedDomains.length >= MAX_ALLOWED_DOMAINS) {
      pushToast({
        type: 'error',
        title: 'Domain limit reached',
        message: `Only ${MAX_ALLOWED_DOMAINS} domains can be added for one chatbot.`
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      allowedDomains: [...prev.allowedDomains, domain]
    }));
    setDomainDraft('');
    pushToast({
      type: 'success',
      title: 'Domain added',
      message: `${domain} can use this widget.`
    });
  };

  const handleRemoveDomain = (domain) => {
    setFormData(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter(item => item !== domain)
    }));
    pushToast({
      type: 'info',
      title: 'Domain removed',
      message: `${domain} was removed from this bot.`
    });
  };

  const openReferenceGenerator = () => {
    setGeneratorAnswers(prev => ({
      ...prev,
      businessName: prev.businessName || formData.botName
    }));
    setIsGeneratorOpen(true);
    pushToast({
      type: 'info',
      title: 'Reference writer opened',
      message: 'Answer every question so the draft can be specific and useful.'
    });
  };

  const closeReferenceGenerator = (reason = 'closed') => {
    setIsGeneratorOpen(false);
    pushToast({
      type: 'info',
      title: reason === 'cancelled' ? 'Reference writing cancelled' : 'Reference writer closed',
      message: reason === 'cancelled'
        ? 'No reference data was changed.'
        : 'You can reopen Help me write anytime.'
    });
  };

  const handleGenerateReference = async () => {
    const missingFields = getMissingGeneratorFields(generatorAnswers);

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map((field) => field.label);
      pushToast({
        type: 'error',
        title: 'Complete every question',
        message: `Missing: ${missingLabels.slice(0, 3).join(', ')}${missingLabels.length > 3 ? ` and ${missingLabels.length - 3} more` : ''}.`,
        duration: 7000
      });
      return;
    }

    try {
      setGeneratingReference(true);
      pushToast({
        type: 'info',
        title: 'Writing reference data',
        message: 'Preparing a clean knowledge base and opening message.'
      });

      const data = await secureFetch('/bots/generate-reference', {
        method: 'POST',
        body: JSON.stringify({
          assistantRole: getRoleById(formData.assistantRole).label,
          languageStyle: LANGUAGE_STYLES.find(item => item.id === formData.languageStyle)?.label || 'English',
          tone: formData.tone,
          capabilities: CAPABILITY_OPTIONS
            .filter(item => formData.capabilities.includes(item.id))
            .map(item => item.label),
          answers: generatorAnswers
        })
      });

      setFormData(prev => ({
        ...prev,
        knowledgeBaseText: data.knowledgeBaseText || prev.knowledgeBaseText,
        welcomeMessage: data.welcomeMessage || prev.welcomeMessage
      }));
      setIsGeneratorOpen(false);
      pushToast({
        type: 'success',
        title: 'Reference data written',
        message: data.message || 'The draft was added to this bot.'
      });
    } catch (error) {
      console.error("Reference generation error:", error);
      pushToast({
        type: 'error',
        title: 'Generation failed',
        message: getErrorMessage(error, 'Try again or paste the reference data manually.')
      });
    } finally {
      setGeneratingReference(false);
    }
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

    const parsedDomains = formData.allowedDomains
      .map(normalizeDomainInput)
      .filter(Boolean);

    if (parsedDomains.length > MAX_ALLOWED_DOMAINS) {
      pushToast({
        type: 'error',
        title: 'Too many domains',
        message: `Add no more than ${MAX_ALLOWED_DOMAINS} domains for one chatbot.`
      });
      return;
    }

    if (parsedDomains.some(domain => domain.length > 253 || !isValidDomainInput(domain))) {
      pushToast({
        type: 'error',
        title: 'Invalid domain',
        message: 'Use valid domains like example.com or localhost.'
      });
      return;
    }

    if (!formData.knowledgeBaseText.trim() || formData.knowledgeBaseText.trim().length < 20) {
      pushToast({
        type: 'error',
        title: 'Reference data required',
        message: 'Add business facts, FAQs, services, or use Help me write before saving.'
      });
      return;
    }

    if (formData.avatarImgUrl.trim()) {
      try {
        const avatarUrl = new URL(formData.avatarImgUrl.trim());
        if (!['http:', 'https:'].includes(avatarUrl.protocol)) {
          throw new Error('Unsupported protocol');
        }
      } catch {
        pushToast({
          type: 'error',
          title: 'Invalid avatar URL',
          message: 'Use a full http or https URL like https://example.com/logo.png.'
        });
        return;
      }
    }

    const generatedSystemContext = buildSystemContext(formData);
    const generatedWelcomeMessage = formData.welcomeMessage.trim() || buildOpeningMessage(formData);

    const payload = {
        botName: formData.botName.trim(),
        assistantRole: formData.assistantRole,
        languageStyle: formData.languageStyle,
        tone: formData.tone,
        capabilities: formData.capabilities,
        allowedDomains: parsedDomains,
        welcomeMessage: generatedWelcomeMessage,
        systemContext: generatedSystemContext,
        advancedInstructions: formData.advancedInstructions.trim(),
        knowledgeBaseText: formData.knowledgeBaseText.trim(),
        primaryColor: formData.primaryColor,
        avatarImgUrl: formData.avatarImgUrl.trim()
    };

    try {
      setSaving(true);
      if (modalMode === 'create') {
        const createdBot = await secureFetch('/bots', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const createdBotId = createdBot?._id || createdBot?.id;
        pushToast({
          type: 'success',
          title: 'Bot created',
          message: formData.welcomeMessage.trim()
            ? 'Your chatbot is ready to test.'
            : 'Opening message was generated and your chatbot is ready.'
        });
        if (createdBotId) {
          setCreatedBotPrompt({
            botName: createdBot.botName || payload.botName,
            url: createHostedChatUrl(createdBotId)
          });
        }
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
      await fetchBots();
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
            Service Guide
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
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-12">
        <div className="mb-6 border border-builder-border bg-builder-800 p-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="min-w-0 text-left text-lg font-bold tracking-tight text-white"
            >
              Darpan360
            </button>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/docs"
                className="inline-flex h-10 items-center gap-2 border border-builder-border px-3 text-sm font-semibold text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
              >
                <BookOpenIcon className="h-4 w-4 text-gray-500" />
                Guide
              </Link>
              <button
                type="button"
                onClick={() => auth.signOut()}
                className="inline-flex h-10 w-10 items-center justify-center border border-builder-border text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
                aria-label="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-builder-border pt-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src={currentUser.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="h-8 w-8 shrink-0 rounded-full border border-builder-border" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{currentUser.displayName || 'User'}</div>
                {dbUser?.role === 'admin' && <div className="text-[10px] font-bold uppercase tracking-widest text-accent-500">Admin</div>}
              </div>
            </div>
            <div className="inline-flex shrink-0 items-center gap-2 border border-accent-500/30 bg-accent-500/10 px-3 py-2 text-xs font-semibold text-accent-100">
              <ChartBarIcon className="h-4 w-4" />
              Dashboard
            </div>
          </div>
        </div>

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Active Bots</h2>
            <p className="text-gray-400 text-sm mt-1">Manage and track your deployed AI gateways.</p>
          </div>
          
          <button onClick={() => openModal('create')} className="btn-primary w-full sm:w-auto">
            <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
            New Bot
          </button>
        </header>

        {/* Dense Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {bots.length === 0 ? (
            <div className="text-center py-16 text-gray-500 border border-dashed border-builder-border rounded card xl:col-span-2">
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
                    <span className="text-gray-400 shrink-0 mr-4">Client Domains</span>
                    <span className="text-gray-200 font-medium truncate">
                      {(bot.allowedDomains || []).length > 0 ? bot.allowedDomains.join(', ') : 'No client domain - Darpan360 only'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-builder-border/50 truncate">
                    <span className="text-gray-400 shrink-0 mr-4">Assistant Role</span>
                    <span className="text-gray-200 font-medium truncate">
                      {getRoleById(bot.assistantRole).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bot Action Footer */}
              <div className="mt-8 flex flex-col gap-3 border-t border-builder-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button 
                  onClick={() => openModal('edit', bot)}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white sm:justify-start"
                >
                  <Cog8ToothIcon className="w-4 h-4" /> Config
                </button>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                  <button 
                    className="flex items-center justify-center gap-2 text-sm font-bold text-accent-500 transition-colors hover:text-accent-600"
                    onClick={() => handleCopy(createHostedChatUrl(bot._id), bot._id, 'link')}
                  >
                    <CodeBracketIcon className="w-4 h-4" /> 
                    {copiedId === bot._id && copiedType === 'link' ? "Copied Link!" : "Web Link"}
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 text-sm font-bold text-accent-500 transition-colors hover:text-accent-600"
                    onClick={() => handleCopy(createEmbedScript(bot), bot._id, 'embed')}
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
          <div className="fixed inset-0 z-50 flex items-stretch justify-center overflow-hidden bg-black/60 p-0 backdrop-blur-sm sm:items-start sm:overflow-y-auto sm:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden border border-builder-border bg-builder-800 shadow-2xl sm:my-4 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded"
            >
              <div className="shrink-0 border-b border-builder-border px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 inline-flex border border-accent-500/30 bg-accent-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-100">
                      Guided setup
                    </div>
                    <h3 className="text-lg font-bold text-white sm:text-xl">
                      {modalMode === 'create' ? 'Create New Bot' : 'Configure Bot'}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-gray-400">Complete the required setup once, then test the hosted chat before sharing it.</p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="shrink-0 text-gray-500 transition-colors hover:text-white" aria-label="Close bot setup">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
              <div className="space-y-4 sm:space-y-5">
                <div className="grid gap-2 text-xs font-semibold text-gray-400 sm:grid-cols-4">
                  {['Identity', 'Behavior', 'Access', 'Knowledge'].map((item, index) => (
                    <div key={item} className="flex items-center gap-2 border border-builder-border bg-builder-900/70 px-3 py-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-builder-border text-[10px] text-accent-500">{index + 1}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Core Settings */}
                <div className="border border-builder-border bg-builder-900/40 p-3 sm:p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Identity</h4>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Name the assistant and set the client-facing brand details.</p>
                    </div>
                    <span className="shrink-0 border border-red-300/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-200">Required</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_minmax(0,1fr)]">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Assistant Name</label>
                      <input type="text" className="input-field shadow-inner" value={formData.botName} onChange={e => setFormData({...formData, botName: e.target.value})} placeholder="e.g. Dolphin 360 Assistant" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Brand Color</label>
                      <input type="text" className="input-field shadow-inner" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} placeholder="#2563EB" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Profile Image / Logo URL</label>
                      <input type="text" className="input-field shadow-inner" value={formData.avatarImgUrl} onChange={e => setFormData({...formData, avatarImgUrl: e.target.value})} placeholder="https://example.com/logo.png" />
                    </div>
                  </div>
                </div>

                <div className="border border-builder-border bg-builder-900/40 p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">Behavior</h4>
                        <span className="border border-red-300/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-200">Required</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Choose the job, speaking style, and practical abilities for this assistant.</p>
                    </div>
                    <div className="text-xs font-semibold text-accent-500 sm:text-right">{getRoleById(formData.assistantRole).label}</div>
                  </div>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Assistant Role</div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {ASSISTANT_ROLES.map((role) => {
                      const selected = formData.assistantRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => updateAssistantRole(role.id)}
                          className={`border p-2.5 text-left transition-colors sm:p-3 ${selected ? 'border-accent-500 bg-accent-500/10 text-white' : 'border-builder-border bg-builder-800 text-gray-300 hover:border-gray-600 hover:text-white'}`}
                        >
                          <div className="text-sm font-semibold">{role.label}</div>
                          <div className="mt-1 text-[11px] leading-4 text-gray-500 sm:text-xs sm:leading-5">{role.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3 border border-builder-border bg-builder-900/40 p-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Language Style</label>
                    <select
                      className="input-field shadow-inner"
                      value={formData.languageStyle}
                      onChange={e => setFormData({...formData, languageStyle: e.target.value})}
                    >
                      {LANGUAGE_STYLES.map((language) => (
                        <option key={language.id} value={language.id}>{language.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Tone</label>
                    <div className="flex flex-wrap gap-2">
                      {getToneOptions(formData.assistantRole).map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => setFormData({...formData, tone})}
                          className={`border px-3 py-2 text-xs font-semibold transition-colors ${formData.tone === tone ? 'border-accent-500 bg-accent-500/15 text-white' : 'border-builder-border text-gray-400 hover:border-gray-600 hover:text-white'}`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border border-builder-border bg-builder-900/40 p-3 sm:p-4">
                  <h4 className="text-sm font-semibold text-white">Capabilities</h4>
                  <p className="mt-1 text-xs leading-5 text-gray-500">Keep enabled items practical; these become behavioral guardrails for the bot.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {CAPABILITY_OPTIONS.map((capability) => (
                      <label key={capability.id} className="flex items-center gap-2 border border-builder-border bg-builder-800 px-3 py-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={formData.capabilities.includes(capability.id)}
                          onChange={() => toggleCapability(capability.id)}
                          className="h-4 w-4 accent-accent-500"
                        />
                        {capability.label}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 border-l-2 border-amber-400/70 bg-amber-400/5 p-3 text-xs leading-6 text-gray-300">
                    <p className="font-semibold text-amber-200">Capability notice</p>
                    <p className="mt-1">This AI can answer questions, generate text, and help with workflows.</p>
                    <p className="mt-2 text-gray-400">It cannot physically perform tasks, make phone calls, book appointments automatically, access private accounts unless connected, or guarantee perfect accuracy.</p>
                  </div>
                </div>

                <div className="border border-builder-border bg-builder-900/40 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Website Access</h4>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Add up to {MAX_ALLOWED_DOMAINS} client domains. Darpan360 stays allowed by default.</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-gray-500">{formData.allowedDomains.length}/{MAX_ALLOWED_DOMAINS}</span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      className="input-field shadow-inner"
                      value={domainDraft}
                      onChange={e => setDomainDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDomain();
                        }
                      }}
                      placeholder="example.com"
                    />
                    <button type="button" onClick={handleAddDomain} className="btn-secondary shrink-0 sm:w-auto">Add</button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.allowedDomains.length === 0 ? (
                      <span className="border border-dashed border-builder-border px-3 py-2 text-xs text-gray-500">
                        No client domain added - Darpan360 only
                      </span>
                    ) : formData.allowedDomains.map((domain) => (
                      <span key={domain} className="inline-flex items-center gap-2 border border-builder-border bg-builder-900 px-3 py-2 text-xs font-semibold text-gray-200">
                        {domain}
                        <button type="button" onClick={() => handleRemoveDomain(domain)} className="text-gray-500 hover:text-red-300" aria-label={`Remove ${domain}`}>
                          <XMarkIcon className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-builder-border bg-builder-900/40 p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">Reference Data</h4>
                        <span className="border border-red-300/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-200">Required</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Facts, FAQs, services, rules, and handoff details the assistant should know.</p>
                    </div>
                    <button type="button" onClick={openReferenceGenerator} className="btn-secondary w-full text-sm sm:w-auto">
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      Help me write
                    </button>
                  </div>
                  <textarea
                    className="input-field mt-3 min-h-[150px] border-accent-500/30 shadow-inner sm:min-h-[170px]"
                    value={formData.knowledgeBaseText}
                    onChange={e => setFormData({...formData, knowledgeBaseText: e.target.value})}
                    placeholder="Paste client services, FAQs, pricing notes, policies, working hours, and handoff instructions..."
                  />
                </div>

                <div className="border border-builder-border bg-builder-900/40 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Opening Message</label>
                      <p className="text-xs leading-5 text-gray-500">Leave blank to auto-generate from the reference data.</p>
                    </div>
                    <span className="shrink-0 border border-builder-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Editable</span>
                  </div>
                  <textarea
                    className="input-field mt-3 min-h-[74px] shadow-inner"
                    value={formData.welcomeMessage}
                    onChange={e => setFormData({...formData, welcomeMessage: e.target.value})}
                    placeholder={buildOpeningMessage(formData)}
                  />
                </div>

                <div className="border border-builder-border bg-builder-900/40 p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(prev => !prev)}
                    className="text-sm font-semibold text-accent-500 hover:text-accent-600"
                  >
                    {showAdvanced ? 'Hide advanced customization' : 'Show advanced customization'}
                  </button>
                  <p className="mt-1 text-xs leading-5 text-gray-500">Optional edge-case rules stay tucked away until needed.</p>
                  {showAdvanced && (
                    <div className="mt-3">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Additional Instructions</label>
                      <textarea
                        className="input-field min-h-[90px] shadow-inner"
                        value={formData.advancedInstructions}
                        onChange={e => setFormData({...formData, advancedInstructions: e.target.value})}
                        placeholder="Optional rules for edge cases, escalation, words to avoid, or brand-specific behavior."
                      />
                    </div>
                  )}
                </div>
              </div>
              </div>

              <div className="shrink-0 border-t border-builder-border bg-builder-800 px-4 py-3 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button onClick={() => setIsModalOpen(false)} className="w-full px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white sm:w-auto">Cancel</button>
                <button onClick={handleSaveBot} disabled={saving} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                  {saving ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createdBotPrompt && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="w-full max-w-md border border-builder-border bg-builder-800 p-5 shadow-2xl sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="created-bot-title"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 id="created-bot-title" className="text-lg font-semibold text-white">Chatbot created</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      {createdBotPrompt.botName} is ready. Open the hosted chat page to test the welcome message, answers, and domain access.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreatedBotPrompt(null)}
                  className="text-gray-500 transition-colors hover:text-white"
                  aria-label="Close chatbot created confirmation"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 border border-builder-border bg-builder-900/70 px-3 py-2 text-xs leading-5 text-gray-400">
                Hosted chat: <span className="break-all font-mono text-gray-200">{createdBotPrompt.url}</span>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCreatedBotPrompt(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
                >
                  Stay on dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const hostedChatUrl = createdBotPrompt.url;
                    setCreatedBotPrompt(null);
                    window.location.assign(hostedChatUrl);
                  }}
                  className="btn-primary"
                >
                  Test hosted chat
                  <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGeneratorOpen && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/70 p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden border border-builder-border bg-builder-800 shadow-2xl sm:my-4 sm:max-h-[calc(100dvh-2rem)]"
            >
              <div className="shrink-0 border-b border-builder-border px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Help Me Write Reference Data</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-400">
                    Answer every question. The AI will turn the full intake into clean reference data and an opening message.
                  </p>
                </div>
                <button type="button" onClick={() => closeReferenceGenerator()} className="text-gray-500 hover:text-white" aria-label="Close generator">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {ROLE_GENERATOR_HINTS[formData.assistantRole] && (
                <div className="mt-4 border border-accent-500/30 bg-accent-500/10 p-3 text-xs leading-5 text-accent-100">
                  {ROLE_GENERATOR_HINTS[formData.assistantRole]}
                </div>
              )}

              <div className="mt-5 grid gap-4">
                {BASE_GENERATOR_FIELDS.map((field) => (
                  <label key={field.id} className="block">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {field.label} <span className="text-red-300">*</span>
                    </span>
                    <textarea
                      className="input-field mt-1 min-h-[64px] shadow-inner"
                      value={generatorAnswers[field.id] || ''}
                      onChange={e => setGeneratorAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      required
                    />
                  </label>
                ))}
              </div>
              </div>

              <div className="shrink-0 border-t border-builder-border bg-builder-800 px-4 py-3 sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" onClick={() => closeReferenceGenerator('cancelled')} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">
                  Cancel
                </button>
                <button type="button" onClick={handleGenerateReference} disabled={generatingReference} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  {generatingReference ? 'Writing...' : 'Write Draft'}
                </button>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
