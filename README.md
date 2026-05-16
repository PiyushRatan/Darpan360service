# Darpan360 Service

Darpan360 is a managed AI chatbot service platform for configuring, installing, and maintaining business-specific chatbots on client websites. It includes an operator dashboard, Firebase Authentication, Firestore persistence, dynamic AI key rotation, hosted chat pages, and an embeddable website widget.

Repository: https://github.com/PiyushRatan/Darpan360service

## Service Positioning

This version is structured for service providers who want to sell chatbot setup and maintenance as a client service. The client provides business details, FAQs, policies, service information, and approved website domains. The operator handles configuration, launch testing, website installation, and future updates.

Use the public service pages to explain:

- what the chatbot service does
- what information clients need to provide
- how installation is handled
- what ongoing maintenance includes
- how developers can copy the open-source version if they want to self-host

## How Darpan360 Bots Work

Darpan360 bots use two core layers:

1. **Behavior Layer**: generated from role, tone, language style, capabilities, and advanced instructions. This controls how the assistant speaks, what kind of assistant it acts like, and what rules it follows.
2. **Knowledge Layer**: the reference data or knowledge base. This contains services, FAQs, pricing notes, support policies, opening hours, contact methods, restrictions, and boundaries.

When a visitor sends a message, the backend combines Darpan360 platform instructions, generated behavior rules, the business knowledge base, recent conversation history, and the visitor message. The behavior layer controls how the assistant responds. The knowledge layer controls what the assistant responds with.

The Help Me Write flow can generate a clean knowledge base and a starting welcome message from simple business questions. Operators can edit everything before saving.

## Product Structure

### Frontend Dashboard

- Located in `/frontend`.
- Built with React, Vite, and Tailwind CSS.
- Includes service landing pages, operator sign-in, dashboard management, hosted chat views, and documentation pages.
- Uses Firebase client authentication.

### Backend API

- Located in `/backend`.
- Uses Firebase Admin SDK and Cloud Firestore.
- Serves the embeddable `/widget.js` script for client websites.
- Provides REST endpoints for auth sync, bot management, chat sessions, and AI responses.

## AI Reliability

The backend supports provider failover and key rotation:

1. Gemini keys can be added as `GEMINI_KEY_1`, `GEMINI_KEY_2`, `GEMINI_KEY_3`, and so on.
2. If a key reaches a provider limit or fails, the service tries the next available key.
3. Optional Groq keys can be added as `GROQ_KEY_1`, `GROQ_KEY_2`, and so on for fallback responses.

## Session Management

Widget users are identified with a browser session key so returning visitors can keep conversation context across page reloads. The backend also includes cleanup logic for removing stale chat sessions.

## Developer Setup

These setup notes are for developers who want to run or copy the open-source project. Service clients do not need to operate this stack.

Copy the example environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure `backend/.env` with Firebase Admin credentials, Firestore project values, AI provider keys, and frontend/backend origins.

Configure `frontend/.env` with:

- `VITE_BACKEND_URL`
- `VITE_FRONTEND_URL`
- `VITE_GITHUB_REPO_URL`

Run the backend:

```bash
cd backend
npm install
npm run check:firebase
npm run check:ai-keys
npm run dev
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/` to use the service dashboard locally.

## Deployment Notes

- Do not commit `.env` files or Firebase service account JSON files.
- For production hosting, prefer `FIREBASE_SERVICE_ACCOUNT` as an environment variable.
- Set backend `FRONTEND_URL` to the production frontend origin.
- Set frontend `VITE_BACKEND_URL` to the production backend URL before building.
- Add more AI provider keys with numbered env vars when scaling usage.
