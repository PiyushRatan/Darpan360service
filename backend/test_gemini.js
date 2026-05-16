require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getNumberedEnvValues } = require('./services/aiService');

async function testKey() {
    const [key] = getNumberedEnvValues('GEMINI_KEY');
    console.log("Testing Gemini key:", key ? `****${key.slice(-4)}` : 'missing');
    
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        
        const result = await model.generateContent("color of sky in 20words max?");
        console.log("Success! Response:", result.response.text());
    } catch (error) {
        console.error("Google API Failure Status:", error.status);
        console.error("Google API Failure Message:", error.message);
    }
}

testKey();
