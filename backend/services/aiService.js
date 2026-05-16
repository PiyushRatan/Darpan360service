const { generateGeminiResponse } = require('./providers/geminiProvider');
const { generateGroqResponse } = require('./providers/groqProvider');

const PLACEHOLDER_PATTERNS = [
    /^your_/i,
    /placeholder/i,
    /paste_/i,
    /^<.*>$/
];

const ENV_ALIASES = {
    GEMINI_KEY: ['GEMINI_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'],
    GROQ_KEY: ['GROQ_KEY', 'GROQ_API_KEY']
};

const getEnvPoolEntries = (prefix) => {
    const aliases = ENV_ALIASES[prefix] || [prefix];
    const entries = [];

    aliases.forEach((name, aliasIndex) => {
        const directValue = process.env[name];
        if (directValue) {
            entries.push({ envName: name, index: aliasIndex / 10, value: directValue });
        }

        Object.entries(process.env).forEach(([key, value]) => {
            const match = key.match(new RegExp(`^${name}_(\\d+)$`));
            if (match) {
                entries.push({
                    envName: key,
                    index: Number(match[1]) + (aliasIndex / 10),
                    value
                });
            }
        });
    });

    const seenValues = new Set();
    return entries
        .map((entry) => ({
            ...entry,
            value: entry.value && entry.value.trim()
        }))
        .filter((entry) => (
            entry.value
            && !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(entry.value))
            && !seenValues.has(entry.value)
            && seenValues.add(entry.value)
        ))
        .sort((a, b) => a.index - b.index);
};

const getNumberedEnvValues = (prefix) => (
    getEnvPoolEntries(prefix).map(({ value }) => value)
);

const getKeyPoolSummary = () => ({
    gemini: getEnvPoolEntries('GEMINI_KEY').map(({ envName }) => envName),
    groq: getEnvPoolEntries('GROQ_KEY').map(({ envName }) => envName)
});

const stripJsonFence = (text) => String(text || '')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

const parseGeneratedSetup = (text) => {
    const cleaned = stripJsonFence(text);
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);

    return {
        knowledgeBaseText: String(parsed.knowledgeBaseText || '').trim().slice(0, 20000),
        welcomeMessage: String(parsed.welcomeMessage || '').trim().slice(0, 500)
    };
};

const cleanOpeningContext = (value) => String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/[.?!]+$/, '')
    .trim()
    .slice(0, 130);

const createSafeWelcomeMessage = ({ languageStyle, answers = {} }) => {
    const name = cleanOpeningContext(answers.businessName) || 'there';
    const style = String(languageStyle || '').toLowerCase();

    if (style.includes('hindi')) {
        return `Namaste! ${name} mein aapka swagat hai. Aapki kaise madad kar sakte hain?`.slice(0, 500);
    }

    if (style.includes('hinglish')) {
        return `Hi! Welcome to ${name}. Bataiye, kaise help kar sakte hain?`.slice(0, 500);
    }

    return `Hello! Welcome to ${name}. How can I help you today?`.slice(0, 500);
};

const createFallbackSetupDraft = ({ assistantRole, languageStyle, tone, answers = {} }) => {
    const sections = [
        ['Business or assistant name', answers.businessName],
        ['Primary purpose', answers.primaryPurpose],
        ['Services, products, or topics', answers.offerings],
        ['Common questions', answers.commonQuestions],
        ['Customer handoff or contact route', answers.contactRoute],
        ['Rules and things to avoid', answers.boundaries],
        ['Extra notes', answers.extraNotes]
    ].filter(([, value]) => value && String(value).trim());

    const knowledgeBaseText = [
        `Assistant Role: ${assistantRole || 'General Assistant'}`,
        `Language Style: ${languageStyle || 'English'}`,
        `Tone: ${tone || 'Professional'}`,
        '',
        ...sections.flatMap(([label, value]) => [`${label}:`, String(value).trim(), ''])
    ].join('\n').trim();

    return {
        knowledgeBaseText,
        welcomeMessage: createSafeWelcomeMessage({ languageStyle, answers })
    };
};

const generateSetupDraft = async ({ assistantRole, languageStyle, tone, capabilities = [], answers = {} }) => {
    const prompt = `Create reference data for configuring an AI assistant.

Return only valid JSON with these two string fields:
{
  "knowledgeBaseText": "...",
  "welcomeMessage": "..."
}

The reference data should be structured, specific, beginner-friendly, and useful as the assistant knowledge base.
The welcome message must be short, natural, and safe. Do not quote or summarize reference data in the welcome message because raw reference text may start with internal notes or unwanted phrases.

Assistant role: ${assistantRole || 'General Assistant'}
Language style: ${languageStyle || 'English'}
Tone: ${tone || 'Professional'}
Enabled capabilities: ${capabilities.join(', ') || 'answer questions, generate text, help with workflows'}
Form answers:
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value || ''}`).join('\n')}`;

    const GROQ_KEYS = getNumberedEnvValues('GROQ_KEY');
    const GEMINI_KEYS = getNumberedEnvValues('GEMINI_KEY');
    const systemContext = 'You write clean chatbot setup reference material. Output valid JSON only. Do not include markdown.';
    const keyPoolSummary = getKeyPoolSummary();
    console.info(
        `[Setup Generator] Key pools loaded: Gemini=${GEMINI_KEYS.length} [${keyPoolSummary.gemini.join(', ') || 'none'}]; ` +
        `Groq=${GROQ_KEYS.length} [${keyPoolSummary.groq.join(', ') || 'none'}]`
    );

    for (let i = 0; i < GROQ_KEYS.length; i++) {
        try {
            console.log(`[Setup Generator] Attempting Groq draft using Key Pool Slot #${i + 1}`);
            const response = await generateGroqResponse(GROQ_KEYS[i], systemContext, [], prompt);
            return {
                ...parseGeneratedSetup(response),
                welcomeMessage: createSafeWelcomeMessage({ languageStyle, answers }),
                source: 'groq'
            };
        } catch (error) {
            console.error(`[Setup Generator] Groq draft failed for Slot #${i + 1}:`, error.message);
        }
    }

    for (let i = 0; i < GEMINI_KEYS.length; i++) {
        try {
            console.log(`[Setup Generator] Attempting Gemini draft using Key Pool Slot #${i + 1}`);
            const response = await generateGeminiResponse(GEMINI_KEYS[i], systemContext, [], prompt);
            return {
                ...parseGeneratedSetup(response),
                welcomeMessage: createSafeWelcomeMessage({ languageStyle, answers }),
                source: 'gemini'
            };
        } catch (error) {
            console.error(`[Setup Generator] Gemini draft failed for Slot #${i + 1}:`, error.message);
        }
    }

    return { ...createFallbackSetupDraft({ assistantRole, languageStyle, tone, answers }), source: 'fallback' };
};

const AI_SERVICE_PUBLIC_MESSAGE = 'A service-side AI error occurred. Please try again in a moment.';

const getProviderErrorStatus = (error) => {
    const status = Number(
        error?.status
        || error?.statusCode
        || error?.response?.status
        || error?.cause?.status
    );

    return Number.isFinite(status) ? status : null;
};

const getProviderErrorCode = (error) => (
    error?.code
    || error?.error?.code
    || error?.response?.data?.error?.code
    || error?.cause?.code
    || 'UNKNOWN'
);

const getProviderErrorMessage = (error) => (
    String(
        error?.message
        || error?.error?.message
        || error?.response?.data?.error?.message
        || 'Unknown provider error'
    )
        .replace(/\s+/g, ' ')
        .slice(0, 300)
);

const classifyProviderError = (error) => {
    const status = getProviderErrorStatus(error);
    const message = getProviderErrorMessage(error);
    const normalizedMessage = message.toLowerCase();

    if (status === 429 || normalizedMessage.includes('429') || normalizedMessage.includes('rate limit') || normalizedMessage.includes('quota')) {
        return 'rate_limit';
    }

    if ([400, 401, 403, 404].includes(status)
        || normalizedMessage.includes('api key')
        || normalizedMessage.includes('apikey')
        || normalizedMessage.includes('unauthorized')
        || normalizedMessage.includes('permission')
        || normalizedMessage.includes('forbidden')
        || normalizedMessage.includes('invalid key')) {
        return 'api_key_or_config';
    }

    return 'provider_error';
};

const logProviderFailure = ({ provider, slot, kind, status, code, message }) => {
    const prefix = kind === 'rate_limit' ? 'warn' : 'error';
    console[prefix](
        `[AI Engine] ${provider} slot #${slot} failed. kind=${kind}; status=${status || 'unknown'}; code=${code}; message="${message}"`
    );
};

const createAiServiceError = (code, failures) => {
    const error = new Error(AI_SERVICE_PUBLIC_MESSAGE);
    error.publicCode = code;
    error.publicMessage = AI_SERVICE_PUBLIC_MESSAGE;
    error.statusCode = code === 'AI_PROVIDER_RATE_LIMITED' ? 429 : 503;
    error.failures = failures;
    return error;
};

/**
 * The Smart Rotator Engine
 * Handles routing messages to Free AI providers and catches Rate Limit errors (HTTP 429)
 * to instantly hot-swap to the next available API key in the pool, and finally to Groq Llama 3.
 */
const getAiResponse = async (botConfig, history, newMessage) => {
    const botName = botConfig.botName || 'this business';

    // Apply an overarching Core Identity block so the AI never forgets it acts as the business representative AND represents the Introducer.ai platform.
    const PLATFORM_CORE_IDENTITY = `[URGENT STRICT DIRECTIVE] You are an intelligent customer service AI Assistant provided by "Darpan360: an identity for everyone". Currently, you are deployed to assist and represent the specific startup/business named "${botName}". 
1. You must COMPLETELY embody the professional identity of "${botName}".
2. Do NOT ever break character, and do not assist with tasks outside of this business's scope. Talk to the user as if you are a real representative of this startup.
3. If the user explicitly asks who you are, who created you, or what AI model you are, you MUST state: "I am an AI chatbot provided by Darpan360, currently assisting ${botName}." Do not mention Google, Llama, OpenAI, Gemini, or Groq.`;

    // Determine context. We combine the personality (systemContext) with the FAQ/Knowledge block.
    const fullContext = `${PLATFORM_CORE_IDENTITY}\n\n[${botName}'s SPECIFIC INSTRUCTIONS]:\n${botConfig.systemContext}\n\n[${botName}'s KNOWLEDGE BASE (Use this data strictly)]:\n${botConfig.knowledgeBaseText}`;

    // Define API key pools dynamically from .env, e.g. GEMINI_KEY_1, GEMINI_KEY_2, GROQ_KEY_1.
    const GEMINI_KEYS = getNumberedEnvValues('GEMINI_KEY');
    const GROQ_KEYS = getNumberedEnvValues('GROQ_KEY');
    const keyPoolSummary = getKeyPoolSummary();
    console.info(
        `[AI Engine] Key pools loaded: Gemini=${GEMINI_KEYS.length} [${keyPoolSummary.gemini.join(', ') || 'none'}]; ` +
        `Groq=${GROQ_KEYS.length} [${keyPoolSummary.groq.join(', ') || 'none'}]`
    );

    const providerFailures = [];

    // Attempt the cascading fallback loop for Gemini First
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
        try {
            console.log(`[AI Engine] Attempting Gemini Request using Key Pool Slot #${i + 1}`);
            const response = await generateGeminiResponse(GEMINI_KEYS[i], fullContext, history, newMessage);
            return response; // Success! Return immediately.
        } catch (error) {
            const failure = {
                provider: 'Gemini',
                slot: i + 1,
                kind: classifyProviderError(error),
                status: getProviderErrorStatus(error),
                code: getProviderErrorCode(error),
                message: getProviderErrorMessage(error)
            };
            providerFailures.push(failure);
            logProviderFailure(failure);
        }
    }

    // If Gemini loop completely failed, fall back to Groq!
    if (GEMINI_KEYS.length === 0) {
        console.warn('[AI Engine] Gemini key pool is empty. Falling back to Groq if configured.');
    }

    if (GROQ_KEYS.length === 0) {
        console.error('[AI Engine] Groq key pool is empty.');
    } else {
        console.log(`[AI Engine] Primary models failed! Hot-swapping to GROQ Llama-3...`);

        for (let i = 0; i < GROQ_KEYS.length; i++) {
            try {
                console.log(`[AI Engine] Attempting Groq Request using Key Pool Slot #${i + 1}`);
                const response = await generateGroqResponse(GROQ_KEYS[i], fullContext, history, newMessage);
                return response;
            } catch (groqError) {
                const failure = {
                    provider: 'Groq',
                    slot: i + 1,
                    kind: classifyProviderError(groqError),
                    status: getProviderErrorStatus(groqError),
                    code: getProviderErrorCode(groqError),
                    message: getProviderErrorMessage(groqError)
                };
                providerFailures.push(failure);
                logProviderFailure(failure);
            }
        }
    }

    if (GEMINI_KEYS.length === 0 && GROQ_KEYS.length === 0) {
        console.error('[AI Engine] No valid Gemini or Groq API keys are configured. Chat response blocked with public service error.');
        throw createAiServiceError('AI_KEYS_MISSING', providerFailures);
    }

    const allFailuresAreRateLimits = providerFailures.length > 0
        && providerFailures.every((failure) => failure.kind === 'rate_limit');
    throw createAiServiceError(
        allFailuresAreRateLimits ? 'AI_PROVIDER_RATE_LIMITED' : 'AI_SERVICE_UNAVAILABLE',
        providerFailures
    );
};

module.exports = { getAiResponse, getNumberedEnvValues, generateSetupDraft };
