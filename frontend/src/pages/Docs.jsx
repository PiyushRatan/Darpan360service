import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { SEO } from '../utils/seo';

const githubRepoUrl = import.meta.env.VITE_GITHUB_REPO_URL || 'https://github.com/PiyushRatan/Darpan360service';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'managed-service', label: 'Managed service' },
  { id: 'client-brief', label: 'Client brief' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'installation', label: 'Installation' },
  { id: 'operations', label: 'Operations' },
  { id: 'open-source', label: 'Open source' }
];

const clientBrief = [
  ['Business profile', 'Company name, services, locations, working hours, and preferred contact routes.'],
  ['Customer questions', 'FAQs, objections, common requests, pricing questions, and support topics.'],
  ['Rules and boundaries', 'What the assistant can answer, what it must avoid, and when to send a visitor to a human.'],
  ['Knowledge material', 'Website copy, service pages, policies, product notes, menus, brochures, and internal answer sheets.'],
  ['Brand settings', 'Primary color, bot name, avatar or logo, and the websites where the bot can appear.']
];

const workflow = [
  ['01', 'Review the business', 'Understand the client services, visitor intent, and the questions the chatbot should handle.'],
  ['02', 'Build the assistant brief', 'Convert client material into clear instructions, knowledge content, and escalation rules.'],
  ['03', 'Configure the bot', 'Create the bot in the dashboard, set the brand color, add allowed domains, and paste the knowledge base.'],
  ['04', 'Test before launch', 'Ask realistic questions, test wrong-domain access, check mobile behavior, and confirm the handoff path.'],
  ['05', 'Install and maintain', 'Add the hosted link or widget script, then update content as the client business changes.']
];

const operationRows = [
  ['Bot name', 'Internal label for identifying the client or website.'],
  ['System prompt', 'The assistant role, tone, rules, and answer boundaries.'],
  ['Knowledge base', 'The facts the chatbot should use when answering visitor questions.'],
  ['Allowed domains', 'The approved sites where the public widget is allowed to run.'],
  ['Brand color and avatar', 'Basic client-facing styling for the chat header and widget.']
];

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="border border-builder-border bg-builder-800 p-5">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-builder-border bg-builder-900 text-accent-500">
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
  <pre className="overflow-x-auto border border-builder-border bg-builder-950 p-4 text-xs leading-6 text-gray-300">
    <code>{children}</code>
  </pre>
);

const Docs = () => {
  return (
    <div className="min-h-screen bg-builder-900 text-gray-200">
      <SEO
        title="Darpan360 Service Guide | Managed AI Chatbot Deployment"
        description="A practical service guide for configuring, installing, and maintaining Darpan360 AI chatbots for business websites."
      />

      <header className="border-b border-builder-border bg-builder-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold text-white">
            <ArrowLeftIcon className="h-4 w-4 text-gray-500" />
            Darpan360 Service Guide
          </Link>
          <Link to="/dashboard" className="btn-primary px-4 py-2 text-sm">Open Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-6 space-y-1 border border-builder-border bg-builder-800 p-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-builder-900 hover:text-white"
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
                Set up client chatbots without exposing the technical stack.
              </h1>
              <p className="mt-5 text-base leading-7 text-gray-400">
                Darpan360 is operated as a managed setup workflow. You collect the client business knowledge,
                configure the assistant, install it on the website, and keep it updated. The client receives a
                working chatbot, not a list of deployment chores.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <InfoCard icon={DocumentTextIcon} title="Client content in">
                Business knowledge, policies, service details, and FAQs become a structured assistant brief.
              </InfoCard>
              <InfoCard icon={ServerStackIcon} title="Managed setup out">
                You configure the dashboard, install the website widget, and test behavior before handoff.
              </InfoCard>
              <InfoCard icon={ShieldCheckIcon} title="Controlled public access">
                Allowed domains reduce misuse and keep each bot tied to approved client websites.
              </InfoCard>
            </div>
          </section>

          <section id="managed-service" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">How to position the service</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-builder-border bg-builder-800 p-5">
                <h3 className="text-sm font-semibold text-white">What you sell</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-400">
                  <li>Chatbot setup for the client website</li>
                  <li>Business-specific knowledge configuration</li>
                  <li>Website widget or hosted chat installation</li>
                  <li>Testing and refinement before launch</li>
                  <li>Ongoing updates when client information changes</li>
                </ul>
              </div>
              <div className="border border-builder-border bg-builder-800 p-5">
                <h3 className="text-sm font-semibold text-white">What you do not need to hand over</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-400">
                  <li>Provider API keys</li>
                  <li>Firebase Admin setup</li>
                  <li>Backend hosting details</li>
                  <li>Prompt engineering process</li>
                  <li>Deployment and maintenance responsibility</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="client-brief" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Client brief checklist</h2>
            <div className="overflow-hidden border border-builder-border bg-builder-800">
              {clientBrief.map(([name, description]) => (
                <div key={name} className="grid gap-2 border-b border-builder-border px-5 py-4 last:border-b-0 md:grid-cols-[220px_1fr]">
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <p className="text-sm leading-6 text-gray-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="workflow" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Delivery workflow</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {workflow.map(([number, title, text]) => (
                <div key={title} className="border-l border-builder-border pl-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">{number}</div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="installation" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Website installation options</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard icon={GlobeAltIcon} title="Hosted chat link">
                Use this for navigation links, buttons, QR codes, email signatures, or campaign pages that should
                open a full chat view.
              </InfoCard>
              <div className="border border-builder-border bg-builder-800 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <CodeBracketIcon className="h-5 w-5 text-accent-500" />
                  Floating website widget
                </div>
                <CodeBlock>{`<script
  src="https://your-domain.com/widget.js"
  data-bot-id="CLIENT_BOT_ID">
</script>`}</CodeBlock>
              </div>
            </div>
          </section>

          <section id="operations" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Dashboard operations</h2>
            <div className="overflow-hidden border border-builder-border bg-builder-800">
              {operationRows.map(([name, description]) => (
                <div key={name} className="grid gap-2 border-b border-builder-border px-5 py-4 last:border-b-0 md:grid-cols-[220px_1fr]">
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <p className="text-sm leading-6 text-gray-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="open-source" className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Open-source path</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-builder-border bg-builder-800 p-5">
                <h3 className="text-sm font-semibold text-white">For developers</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  The public repository can be copied and self-hosted by technical users who want to manage
                  deployment, Firebase, provider keys, and maintenance themselves.
                </p>
                <a
                  href={githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-500 hover:text-accent-600"
                >
                  View GitHub repository
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              </div>
              <InfoCard icon={WrenchScrewdriverIcon} title="For service clients">
                Keep the managed offer focused on implementation, installation, and updates. The client should not
                need to operate the developer setup.
              </InfoCard>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Docs;
