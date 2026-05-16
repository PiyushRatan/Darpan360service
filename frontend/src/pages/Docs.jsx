import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
  CommandLineIcon,
  GlobeAltIcon,
  KeyIcon,
  ServerStackIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const githubRepoUrl = import.meta.env.VITE_GITHUB_REPO_URL || 'https://github.com/PiyushRatan/OnlineChatbotIntegration';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'github', label: 'GitHub' },
  { id: 'setup', label: 'Setup' },
  { id: 'env', label: 'Environment' },
  { id: 'run', label: 'Run locally' },
  { id: 'deploy', label: 'Deploy' },
  { id: 'use', label: 'Use the app' }
];

const envRows = [
  ['frontend/.env', 'VITE_BACKEND_URL', 'Backend API URL used by the React dashboard.'],
  ['frontend/.env', 'VITE_FRONTEND_URL', 'Frontend URL used when generating hosted chat and widget links.'],
  ['frontend/.env', 'VITE_GITHUB_REPO_URL', 'Public GitHub URL shown in the docs page.'],
  ['backend/.env', 'FRONTEND_URL', 'Comma-separated frontend origins allowed by backend CORS.'],
  ['backend/.env', 'FIREBASE_PROJECT_ID', 'Firebase project ID used by the Admin SDK.'],
  ['backend/.env', 'FIREBASE_CLIENT_EMAIL', 'Firebase service account email.'],
  ['backend/.env', 'FIREBASE_SERVICE_ACCOUNT_PATH', 'Local path to a service account JSON file ignored by git.'],
  ['backend/.env', 'FIREBASE_SERVICE_ACCOUNT', 'Production-friendly full service account JSON env var.'],
  ['backend/.env', 'GEMINI_KEY_1, GEMINI_KEY_2...', 'Numbered Gemini keys loaded automatically by the backend.'],
  ['backend/.env', 'GROQ_KEY_1, GROQ_KEY_2...', 'Optional numbered Groq fallback keys.']
];

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="rounded border border-builder-border bg-builder-800 p-5">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-builder-border bg-builder-900 text-accent-500">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-400">{children}</p>
      </div>
    </div>
  </div>
);

const CodeBlock = ({ children }) => (
  <pre className="overflow-x-auto rounded border border-builder-border bg-builder-950 p-4 text-xs leading-6 text-gray-300">
    <code>{children}</code>
  </pre>
);

const Step = ({ number, title, children }) => (
  <div className="border-l border-builder-border pl-5">
    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">Step {number}</div>
    <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
    <div className="mt-2 text-sm leading-6 text-gray-400">{children}</div>
  </div>
);

const Docs = () => {
  return (
    <div className="min-h-screen bg-builder-900 text-gray-200">
      <header className="border-b border-builder-border bg-builder-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold text-white">
            <ArrowLeftIcon className="h-4 w-4 text-gray-500" />
            Darpan360 Developer Docs
          </Link>
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-500 hover:text-accent-600"
          >
            GitHub
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-6 space-y-1 border border-builder-border bg-builder-800 p-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-builder-900 hover:text-white"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-12">
          <section id="overview" className="border border-builder-border bg-builder-800 p-6 md:p-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Deployable chatbot platform
              </h1>
              <p className="mt-5 text-base leading-7 text-gray-400">
                Darpan360 is an open-source chatbot platform with a React dashboard, Firebase Authentication, Firestore storage, dynamic AI key rotation, and an embeddable website widget. This guide is for developers who want to copy, run, and deploy the project.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <InfoCard icon={ShieldCheckIcon} title="Authentication">
                Firebase Authentication verifies dashboard users before bot management routes are allowed.
              </InfoCard>
              <InfoCard icon={ServerStackIcon} title="Storage">
                Firebase Admin SDK writes users, bots, and chat sessions into Cloud Firestore.
              </InfoCard>
              <InfoCard icon={KeyIcon} title="AI key rotation">
                Numbered environment keys are loaded automatically and tried in order when a provider fails.
              </InfoCard>
            </div>
          </section>

          <section id="github" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Repository</h2>
            <div className="rounded border border-builder-border bg-builder-800 p-5">
              <p className="text-sm leading-6 text-gray-400">
                The public repository can be cloned, customized, and deployed by any developer.
              </p>
              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-500 hover:text-accent-600"
              >
                {githubRepoUrl}
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            </div>
          </section>

          <section id="setup" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Setup checklist</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Step number="1" title="Clone and install">
                Clone the repository, then install dependencies in both backend and frontend folders.
              </Step>
              <Step number="2" title="Create Firebase project">
                Enable Firebase Authentication, create a service account key, and enable Cloud Firestore.
              </Step>
              <Step number="3" title="Add AI provider keys">
                Add at least one Gemini key. Add Groq keys only if you want a fallback provider.
              </Step>
              <Step number="4" title="Run checks">
                Use the backend check scripts before starting development or deploying.
              </Step>
            </div>
          </section>

          <section id="env" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Environment variables</h2>
            <div className="rounded border border-builder-border bg-builder-800 p-5">
              <CodeBlock>{`cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env`}</CodeBlock>
            </div>
            <div className="overflow-hidden border border-builder-border bg-builder-800">
              {envRows.map(([file, name, description]) => (
                <div key={`${file}-${name}`} className="grid gap-2 border-b border-builder-border px-5 py-4 last:border-b-0 lg:grid-cols-[150px_240px_1fr]">
                  <span className="text-xs font-semibold text-gray-500">{file}</span>
                  <code className="text-xs font-semibold text-accent-500">{name}</code>
                  <p className="text-sm leading-6 text-gray-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="run" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Run locally</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded border border-builder-border bg-builder-800 p-5">
                <h3 className="text-sm font-semibold text-white">Backend</h3>
                <CodeBlock>{`cd backend
npm install
npm run check:firebase
npm run check:ai-keys
npm run dev`}</CodeBlock>
              </div>
              <div className="rounded border border-builder-border bg-builder-800 p-5">
                <h3 className="text-sm font-semibold text-white">Frontend</h3>
                <CodeBlock>{`cd frontend
npm install
npm run dev`}</CodeBlock>
              </div>
            </div>
          </section>

          <section id="deploy" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Deployment notes</h2>
            <div className="grid gap-4">
              <InfoCard icon={CommandLineIcon} title="Backend hosting">
                Deploy the backend as a Node server or serverless function. In production, prefer FIREBASE_SERVICE_ACCOUNT instead of deploying a JSON key file.
              </InfoCard>
              <InfoCard icon={GlobeAltIcon} title="Frontend hosting">
                Deploy the Vite frontend to Firebase Hosting, Vercel, or another static host. Set VITE_BACKEND_URL to the production backend URL before building.
              </InfoCard>
              <InfoCard icon={ShieldCheckIcon} title="CORS">
                Set FRONTEND_URL in the backend environment to every frontend origin that should call the API.
              </InfoCard>
            </div>
          </section>

          <section id="use" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Using the app</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded border border-builder-border bg-builder-800 p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <CodeBracketIcon className="h-5 w-5 text-accent-500" />
                  Widget embed
                </h3>
                <CodeBlock>{`<script
  src="https://your-frontend-domain.com/widget.js"
  data-bot-id="BOT_ID">
</script>`}</CodeBlock>
              </div>
              <div className="rounded border border-builder-border bg-builder-800 p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <GlobeAltIcon className="h-5 w-5 text-accent-500" />
                  Hosted chat
                </h3>
                <CodeBlock>{`https://your-frontend-domain.com/chat/BOT_ID`}</CodeBlock>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Docs;
