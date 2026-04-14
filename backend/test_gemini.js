require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
    const key = process.env.GEMINI_KEY_1;
    console.log("Testing Key:", key);
    
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
