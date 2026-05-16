export const ASSISTANT_ROLES = [
  {
    id: 'general-assistant',
    label: 'General Assistant',
    description: 'Handles broad questions and routine help.',
    prompt: 'Act as a reliable general assistant. Answer clearly, stay within the provided reference data, and route uncertain requests to a human.'
  },
  {
    id: 'personal-assistant',
    label: 'Personal Assistant',
    description: 'Helps with planning, reminders, and daily workflows.',
    prompt: 'Act as an organized personal assistant. Help users plan, understand next steps, and make information easier to act on.'
  },
  {
    id: 'persona-assistant',
    label: 'Persona Assistant',
    description: 'Adopts a configured persona or brand voice.',
    prompt: 'Act in the approved persona or brand voice described in the reference data. Match the supplied style, vocabulary, and perspective while staying honest about limits and avoiding unsupported claims.'
  },
  {
    id: 'information-assistant',
    label: 'Information Assistant',
    description: 'Gives clear information and answers general queries.',
    prompt: 'Act as an information assistant. Answer general queries clearly, organize facts, summarize useful details, and rely on the provided reference data as the source of truth.'
  },
  {
    id: 'faq-assistant',
    label: 'FAQ Assistant',
    description: 'Handles common questions from visitors.',
    prompt: 'Act as a FAQ assistant. Answer repeated questions directly, keep responses short and useful, and guide users to a human handoff when the reference data does not contain the answer.'
  },
  {
    id: 'customer-support',
    label: 'Customer Support',
    description: 'Answers customer questions and explains policies.',
    prompt: 'Act as a customer support representative. Be patient, accurate, calm, and helpful. Use the reference data before answering.'
  },
  {
    id: 'sales-assistant',
    label: 'Sales Assistant',
    description: 'Guides visitors toward the right service or offer.',
    prompt: 'Act as a sales assistant. Understand visitor needs, explain relevant offers, handle objections honestly, and suggest a clear next step.'
  },
  {
    id: 'business-helper',
    label: 'Business Helper',
    description: 'Supports business information and workflows.',
    prompt: 'Act as a business helper. Explain services, process questions, handoff routes, and operational information in practical language.'
  },
  {
    id: 'study-assistant',
    label: 'Study Assistant',
    description: 'Explains topics and supports learning.',
    prompt: 'Act as a study assistant. Explain concepts step by step, check understanding, and keep answers encouraging and clear.'
  },
  {
    id: 'coding-assistant',
    label: 'Coding Assistant',
    description: 'Helps explain code and technical tasks.',
    prompt: 'Act as a coding assistant. Give precise technical help, ask for missing details, and explain tradeoffs clearly.'
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    description: 'Balanced AI helper for mixed tasks.',
    prompt: 'Act as a balanced AI assistant. Help with questions, writing, summaries, and workflows while staying inside the configured business context.'
  },
  {
    id: 'reception-assistant',
    label: 'Reception Assistant',
    description: 'Welcomes visitors and routes them.',
    prompt: 'Act as a reception assistant. Welcome users, answer basic questions, collect relevant context, and guide them to the right contact route.'
  },
  {
    id: 'team-assistant',
    label: 'Team Assistant',
    description: 'Helps teams find answers and process info.',
    prompt: 'Act as a team assistant. Help users find internal information, summarize context, and clarify next steps.'
  },
  {
    id: 'creative-writer',
    label: 'Creative Writer',
    description: 'Helps draft and refine creative content.',
    prompt: 'Act as a creative writing assistant. Help users draft, revise, brainstorm, and improve content while matching the requested style.'
  },
  {
    id: 'research-assistant',
    label: 'Research Assistant',
    description: 'Organizes facts and explains findings.',
    prompt: 'Act as a research assistant. Summarize provided information, compare details, identify gaps, and avoid unsupported claims.'
  }
];

export const LANGUAGE_STYLES = [
  { id: 'english', label: 'English', instruction: 'Reply in clear English.' },
  { id: 'hinglish', label: 'Hinglish', instruction: 'Reply in natural Hinglish when it fits the user.' },
  { id: 'hindi', label: 'Hindi', instruction: 'Reply in Hindi unless the user asks otherwise.' },
  { id: 'formal-english', label: 'Formal English', instruction: 'Reply in polished formal English.' },
  { id: 'indian-english', label: 'Indian English', instruction: 'Reply in natural Indian English with familiar business phrasing.' },
  { id: 'bilingual', label: 'Bilingual', instruction: 'Reply bilingually when useful, keeping the answer easy to understand.' }
];

export const ROLE_TONES = {
  'general-assistant': ['Professional', 'Friendly', 'Calm', 'Direct'],
  'personal-assistant': ['Friendly', 'Calm', 'Supportive', 'Minimal'],
  'persona-assistant': ['Friendly', 'Professional', 'Expressive', 'Calm'],
  'information-assistant': ['Professional', 'Direct', 'Calm', 'Minimal'],
  'faq-assistant': ['Friendly', 'Direct', 'Calm', 'Professional'],
  'customer-support': ['Friendly', 'Calm', 'Professional'],
  'sales-assistant': ['Persuasive', 'Friendly', 'Professional'],
  'business-helper': ['Professional', 'Direct', 'Calm'],
  'study-assistant': ['Supportive', 'Calm', 'Friendly'],
  'coding-assistant': ['Technical', 'Direct', 'Minimal'],
  'ai-assistant': ['Professional', 'Friendly', 'Direct'],
  'reception-assistant': ['Friendly', 'Calm', 'Professional'],
  'team-assistant': ['Direct', 'Supportive', 'Professional'],
  'creative-writer': ['Friendly', 'Supportive', 'Persuasive'],
  'research-assistant': ['Professional', 'Direct', 'Technical']
};

export const CAPABILITY_OPTIONS = [
  { id: 'answer-questions', label: 'Answer questions' },
  { id: 'generate-text', label: 'Generate text' },
  { id: 'workflow-help', label: 'Help with workflows' },
  { id: 'summarize-info', label: 'Summarize information' },
  { id: 'collect-leads', label: 'Collect visitor details' }
];

export const BASE_GENERATOR_FIELDS = [
  { id: 'businessName', label: 'Business or assistant name', placeholder: 'Dolphin 360, Acme Clinic, Math Tutor...' },
  { id: 'primaryPurpose', label: 'What should this assistant help with?', placeholder: 'Answer service questions, guide leads, explain lessons...' },
  { id: 'offerings', label: 'Services, products, or topics', placeholder: 'List important services, products, plans, subjects, or features.' },
  { id: 'commonQuestions', label: 'Common questions people ask', placeholder: 'Add FAQs, objections, confusion points, or repeated requests.' },
  { id: 'contactRoute', label: 'How should it hand off to a human?', placeholder: 'Phone, WhatsApp, email, office hours, booking link...' },
  { id: 'boundaries', label: 'What should it avoid saying?', placeholder: 'No discounts, no medical/legal guarantees, no private account access...' }
];

export const ROLE_GENERATOR_HINTS = {
  'persona-assistant': 'Add persona traits, preferred wording, point of view, phrases to use, phrases to avoid, and strict boundaries.',
  'information-assistant': 'Add the key facts, topics covered, source material, common information gaps, and handoff route.',
  'faq-assistant': 'Add the most common questions, exact answers, policy notes, service details, and escalation rules.',
  'customer-support': 'Add refund rules, support hours, escalation steps, and policy details.',
  'sales-assistant': 'Add pricing, best-fit customers, objections, proof points, and buying next steps.',
  'coding-assistant': 'Add tech stack, supported languages, repository rules, and explanation style.',
  'study-assistant': 'Add subjects, level, curriculum, examples, and exam or practice needs.',
  'reception-assistant': 'Add opening hours, locations, appointment rules, and contact routing.'
};

export const getRoleById = (roleId) => (
  ASSISTANT_ROLES.find((role) => role.id === roleId) || ASSISTANT_ROLES[0]
);

export const getLanguageById = (languageId) => (
  LANGUAGE_STYLES.find((language) => language.id === languageId) || LANGUAGE_STYLES[0]
);

export const getToneOptions = (roleId) => ROLE_TONES[roleId] || ROLE_TONES['general-assistant'];

export const buildSystemContext = ({
  botName,
  assistantRole,
  languageStyle,
  tone,
  capabilities,
  advancedInstructions
}) => {
  const role = getRoleById(assistantRole);
  const language = getLanguageById(languageStyle);
  const capabilityLabels = CAPABILITY_OPTIONS
    .filter((capability) => capabilities.includes(capability.id))
    .map((capability) => capability.label);

  return [
    `Assistant name/context: ${botName || 'Configured assistant'}.`,
    `Role: ${role.label}. ${role.prompt}`,
    `Language style: ${language.label}. ${language.instruction}`,
    `Tone: ${tone || getToneOptions(role.id)[0]}.`,
    `Enabled capabilities: ${capabilityLabels.join(', ') || 'Answer questions'}.`,
    'Use the reference data as the source of truth. If the answer is not present, say what information is missing and offer a human handoff.',
    'Do not claim to make calls, book appointments, access private accounts, physically perform tasks, or guarantee perfect accuracy.',
    advancedInstructions ? `Additional operator instructions: ${advancedInstructions}` : ''
  ].filter(Boolean).join('\n');
};

export const buildOpeningMessage = ({ botName, assistantRole, languageStyle }) => {
  const role = getRoleById(assistantRole);
  const language = getLanguageById(languageStyle);
  const roleLabel = role.label.toLowerCase();
  const englishIdentity = botName ? `${botName}'s ${roleLabel}` : `your ${roleLabel}`;
  const conversationalIdentity = botName ? `${botName} ka ${roleLabel}` : `aapka ${roleLabel}`;

  if (language.id === 'hindi') {
    return `Namaste, main ${conversationalIdentity} hoon. Aap kya jaana chahenge?`;
  }

  if (language.id === 'hinglish') {
    return `Hi, main ${conversationalIdentity} hoon. Bataiye, main kaise help kar sakta hoon?`;
  }

  return `Hello, I am ${englishIdentity}. How can I help you today?`;
};
