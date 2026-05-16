require('dotenv').config();

const { getNumberedEnvValues } = require('../services/aiService');

const geminiKeys = getNumberedEnvValues('GEMINI_KEY');
const groqKeys = getNumberedEnvValues('GROQ_KEY');

console.log(`Gemini key slots loaded: ${geminiKeys.length}`);
console.log(`Groq key slots loaded: ${groqKeys.length}`);
