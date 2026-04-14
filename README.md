# Darpan360 ⚡ Platform Architecture

Welcome to the **Darpan360** platform—a robust multi-tenant Chatbot-as-a-Service architecture. This platform allows users to deploy custom, knowledge-restricted AI agents across their own websites utilizing a smart, cascading AI infrastructure. 

---

##  Architecture Overview

The platform uses a decoupled client-server architecture:

1. **The Builder UI (React/Vite)**
   - Located in `/frontend`.
   - Built on React and styled with TailwindCSS (including Framer Motion for animations).
   - Allows users to configure bots: defining specific Brand Colors, Avatars, Domain Whitelists, System Brain Prompts, and isolated Knowledge Bases.
   - Utilizes Google Firebase SDK for centralized Auth.

2. **The Intelligence API (Node/Express)**
   - Located in `/backend`.
   - Connects to a standard MongoDB Atlas cluster.
   - Provides an embed script `/widget.js` that websites embed.
   - Exposes REST endpoints to compile AI generation via the Gateway.

---

##  The Smart AI Rotator Engine 

To maintain 100% uptime without passing massive cloud bills to the user, the backend utilizes an advanced **AI Waterfall System**.

1. **Layer 1 (The Primary Engine)**: 
   When a user sends a message, the Node server packages their conversation history along with your custom Knowledge Base and sends it to the **Google Gemini API** (currently configured for `gemini-2.5-flash-lite`, the fastest tier).

2. **Layer 2 (Rate-Limit Cascading)**:
   If Gemini throws a `429 Too Many Requests` or quota limit, the backend dynamically catches the failure and silently swaps to `GEMINI_KEY_2`.

3. **Layer 3 (The Fallback Net)**:
   If the entire Google cloud infrastructure is exhausted or keys fail, the engine shifts entirely to **Groq**. It transmits the data to the `llama3-8b-8192` model natively, ensuring the chatbot never "goes offline" for the end-user.

###  Artificial Limitations
- **Token Capacity**: Gemini limits context depending on the model tier (typically 1 Million tokens). If the user pastes an absurdly large Knowledge Base dump, older conversation history will natively fall out of context.
- **Latency Overload**: If Node must cascade all the way down to Groq due to rate limits, the user will experience an additional ~800ms of latency before the first token streams.
- **Stateless AI**: The LLMs do not "learn" from session to session. Each time a user opens a new browser instance (generating a new `sessionId`), the bot treats them precisely according to the strict initial Knowledge Base.

---

##  Chat Persistence & The Grim Reaper Cron

1. **Client Persistence (Browser)**
   Your tab retains chat continuity! When an anonymous user loads the widget or `/chat/:botId` interface, their specific session key (`sess_xxx`) is bound natively to `localStorage`. Refreshing the screen hits the `GET /history` API, seamlessly pulling the exact JSON chat array from the Mongo database to re-populate their screen.

2. **The 4-Hour Database Purge**
   Massive abandoned chat arrays bloat MongoDB. To solve this, `/backend/services/cronService.js` natively initializes an hourly Node Cron Job. It sweeps the database and completely `Drops/Erases` any `ChatSession` where the most recent message is older than 4 hours. No data hoarding.

---

## Setup & Execution

### 1. Requirements

Ensure you possess a fully configured `backend/.env` file. You will need:
- Your MongoDB Cluster URI
- At least 1 Google AI Studio Generative Language API Key.
- (Recommended) A Groq API Key.
- Your Firebase Admin JSON strings to secure login tokens.

### 2. Launch Commands

You must run the Application concurrently.

**Booting the Database & Backend API**
\`\`\`bash
cd backend
npm install
npx nodemon server.js
\`\`\`

**Booting the React Dashboard**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Navigate to \`http://localhost:5173/\` to log in and begin provisioning bots!
