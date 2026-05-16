const { generateGeminiResponse } = require('./providers/geminiProvider');
const { generateGroqResponse } = require('./providers/groqProvider');

const PLACEHOLDER_PATTERNS = [
    /^your_/i,
    /placeholder/i,
    /paste_/i,
    /^<.*>$/
];

const getNumberedEnvValues = (prefix) => (
    Object.entries(process.env)
        .map(([key, value]) => {
            const match = key.match(new RegExp(`^${prefix}_(\\d+)$`));
            return match ? { index: Number(match[1]), value } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.index - b.index)
        .map(({ value }) => value && value.trim())
        .filter((value, position, values) => (
            value
            && !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
            && values.indexOf(value) === position
        ))
);

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

    let geminiFailed = false;
    let geminiErrorMessage = "";

    // Attempt the cascading fallback loop for Gemini First
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
        try {
            console.log(`[AI Engine] Attempting Gemini Request using Key Pool Slot #${i + 1}`);
            const response = await generateGeminiResponse(GEMINI_KEYS[i], fullContext, history, newMessage);
            return response; // Success! Return immediately.
        } catch (error) {
            // Check if it's a Rate Limit error (429) or Quota Exceeded
            if (error.status === 429 || Math.abs(error.status) === 429 || (error.message && error.message.includes('429'))) {
                console.warn(`[AI Engine] Warning: Gemini Slot #${i + 1} hit a 429 Rate Limit!`);
                geminiFailed = true;
            } else {
                console.error("[AI Engine] Critical Generic API failure for Gemini:", error);
                if (error.status === 404 || (error.message && error.message.includes('404'))) {
                    return ` API Gateway Error (Slot ${i+1}): Your Gemini API Key is structurally valid but returned a 404 Not Found. You likely pasted a Firebase Web Key or your project does not have the 'Generative Language API' enabled. Please generate a dedicated key at https://aistudio.google.com/app/apikey.`;
                } else if (error.status === 400 || (error.message && error.message.includes('400'))) {
                    return ` API Gateway Error (Slot ${i+1}): Your Gemini API Key is invalid (400 Bad Request).`;
                }
                geminiFailed = true;
                geminiErrorMessage = error.message;
            }
        }
    }

    // If Gemini loop completely failed, fall back to Groq!
    if (geminiFailed || GEMINI_KEYS.length === 0) {
        if (GROQ_KEYS.length === 0) {
            console.warn("[AI Engine] Missing both Gemini and Groq API keys in the environment! Returning Mock response safely.");
            return `[Mock Offline Mode] I see you provided no valid Gemini or Groq API keys in backend/.env. The Gemini keys threw an explicit failure: ${geminiErrorMessage || 'None provided'}. Please add a real Llama3 Groq fallback key or correct your Google API keys!`;
        }

        console.log(`[AI Engine] Primary models failed! Hot-swapping to GROQ Llama-3...`);

        for (let i = 0; i < GROQ_KEYS.length; i++) {
            try {
                console.log(`[AI Engine] Attempting Groq Request using Key Pool Slot #${i + 1}`);
                const response = await generateGroqResponse(GROQ_KEYS[i], fullContext, history, newMessage);
                return response;
            } catch (groqError) {
                console.error(`[AI Engine] Critical Groq API failure for Slot #${i + 1}:`, groqError);
            }
        }

        throw new Error("Extreme Load: Both Gemini and Groq fallback pools have failed.");
    }
};

module.exports = { getAiResponse, getNumberedEnvValues };
