# Darpan360 AI Platform

Darpan360 is a multi-tenant Chatbot-as-a-Service platform. It provides the infrastructure to deploy custom AI agents across third-party websites with specialized domain knowledge bases.

## Architecture

The platform uses a decoupled client-server architecture:

### 1. Frontend Dashboard (React/Vite)
- Located in `/frontend`.
- Built with React and styled with TailwindCSS.
- Enables users to configure and manage bots, including brand colors, avatars, allowed domains, system prompts, and knowledge bases.
- Uses Firebase for user authentication.

### 2. Backend API (Node/Express)
- Located in `/backend`.
- Connects to MongoDB for data storage.
- Serves the embeddable `/widget.js` script for third-party integration.
- Provides REST endpoints to handle interactions and interface with external LLM providers.

## AI Service Implementation

The backend implements a fallback mechanism for AI processing to improve reliability.

1. **Primary Provider (Gemini)**: 
   Incoming chatter, conversation history, and the configured knowledge base are routed primarily to the Google Gemini API (gemini-2.5-flash-lite).
   
2. **Key Rotation & Cascading**:
   If the primary API key encounters rate limits, the service fails over to a secondary API key.

3. **Fallback Provider (Groq)**:
   In the event of an upstream provider outage, the system routes requests to Groq (llama3-8b-8192) as a secondary inference provider.

## Session Management

1. **Client Persistence**
   User sessions are maintained via `localStorage` within the chat widget. Returning users are identified by a session key, ensuring that prior chat context is re-fetched and displayed across page reloads.

2. **Automated Cleanup**
   The application implements a cron job in `/backend/services/cronService.js`. To manage database size, it automatically removes chat sessions that have been inactive for more than 4 hours.

## Development Setup

### 1. Requirements

Configure your `backend/.env` file with the following variables:
- MongoDB connection string
- Google Generative Language API keys
- Groq API key (optional fallback)
- Firebase Admin SDK credentials

### 2. Running Locally

The application requires both backend and frontend services to be running.

**Backend Service:**
```bash
cd backend
npm install
npm run dev
```

**Frontend Service:**
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173/` in your browser to access the dashboard.
