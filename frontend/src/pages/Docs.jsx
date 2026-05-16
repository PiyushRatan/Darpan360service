import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { SEO } from '../utils/seo';

const githubRepoUrl = import.meta.env.VITE_GITHUB_REPO_URL || 'https://github.com/PiyushRatan/Darpan360service';
const creatorCreditUrl = 'https://piyushratan.in/work/darpan360';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'managed-service', label: 'Managed service' },
  { id: 'client-brief', label: 'Client brief' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'premium-motion', label: 'Premium motion' },
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
  ['Assistant setup', 'The visible role, tone, language style, and capability settings for the client bot.'],
  ['Reference data', 'The approved business information used to keep answers aligned with the client brief.'],
  ['Allowed domains', 'The approved sites where the public widget is allowed to run.'],
  ['Brand color and avatar', 'Basic client-facing styling for the chat header and widget.']
];

const horizontalScrollUses = [
  ['Timelines', 'Show process stages as a left-to-right story while the page scroll remains natural.'],
  ['Product showcases', 'Move through features, plans, screenshots, or client examples with stronger pacing.'],
  ['Portfolios', 'Let each case study feel like a frame in a premium presentation.'],
  ['Storytelling sections', 'Use horizontal movement when the content has a clear sequence or reveal order.']
];

const InfoCard = ({ icon, title, children }) => (
  <div className="border border-builder-border bg-builder-800 p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-builder-border bg-builder-900 text-accent-500">
        {React.createElement(icon, { className: 'h-5 w-5' })}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-400">{children}</p>
      </div>
    </div>
  </div>
);

const CodeBlock = ({ children }) => (
  <pre className="max-w-full overflow-x-auto border border-builder-border bg-builder-950 p-3 text-[11px] leading-6 text-gray-300 sm:p-4 sm:text-xs">
    <code>{children}</code>
  </pre>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{children}</h2>
);

const Docs = () => {
  return (
    <div className="min-h-screen bg-builder-900 text-gray-200">
      <SEO
        title="Darpan360 Service Guide | Managed AI Chatbot Deployment"
        description="A practical service guide for configuring, installing, and maintaining Darpan360 AI chatbots for business websites."
      />

      <header className="border-b border-builder-border bg-builder-900/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-3 text-sm font-semibold text-white">
            <ArrowLeftIcon className="h-4 w-4 shrink-0 text-gray-500" />
            <span className="truncate">Darpan360 Service Guide</span>
          </Link>
          <Link to="/dashboard" className="btn-primary w-full px-4 py-2 text-sm sm:w-auto">Open Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-3 py-6 sm:px-6 sm:py-10 lg:grid-cols-[240px_1fr] lg:gap-8">
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

        <div className="min-w-0 space-y-8 sm:space-y-12">
          <nav className="lg:hidden">
            <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-2 sm:mx-0 sm:px-0">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="shrink-0 border border-builder-border bg-builder-800 px-3 py-2 text-xs font-semibold text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
                >
                  {section.label}
                </a>
              ))}
            </div>
          </nav>

          <section id="overview" className="border border-builder-border bg-builder-800 p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-5xl">
                Set up client chatbots without exposing the technical stack.
              </h1>
              <p className="mt-4 text-sm leading-7 text-gray-400 sm:mt-5 sm:text-base">
                Darpan360 is operated as a managed setup workflow. You collect the client business knowledge,
                configure the assistant, install it on the website, and keep it updated. The client receives a
                working chatbot, not a list of deployment chores.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:mt-8 md:grid-cols-3 md:gap-4">
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
            <SectionTitle>How to position the service</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <div className="border border-builder-border bg-builder-800 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-white">What you sell</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-400">
                  <li>Chatbot setup for the client website</li>
                  <li>Business-specific knowledge configuration</li>
                  <li>Website widget or hosted chat installation</li>
                  <li>Testing and refinement before launch</li>
                  <li>Ongoing updates when client information changes</li>
                </ul>
              </div>
              <div className="border border-builder-border bg-builder-800 p-4 sm:p-5">
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
            <SectionTitle>Client brief checklist</SectionTitle>
            <div className="overflow-hidden border border-builder-border bg-builder-800">
              {clientBrief.map(([name, description]) => (
                <div key={name} className="grid gap-2 border-b border-builder-border px-4 py-4 last:border-b-0 sm:px-5 md:grid-cols-[220px_1fr]">
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <p className="text-sm leading-6 text-gray-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="workflow" className="space-y-5">
            <SectionTitle>Delivery workflow</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2 md:gap-5">
              {workflow.map(([number, title, text]) => (
                <div key={title} className="border border-builder-border bg-builder-800 p-4 md:border-0 md:border-l md:bg-transparent md:pl-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">{number}</div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="premium-motion" className="space-y-5">
            <SectionTitle>Premium motion pattern: horizontal scroll sections</SectionTitle>
            <div className="border border-builder-border bg-builder-800 p-4 sm:p-5 md:p-6">
              <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center border border-builder-border bg-builder-900 text-accent-500">
                    <ArrowsRightLeftIcon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                    Content moves sideways while the user scrolls down.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    This pattern keeps the browser's normal vertical scroll, but maps that scroll progress to a
                    horizontal content track. It feels premium, immersive, and app-like when used for a sequence
                    that genuinely benefits from side-to-side movement.
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Best used with restraint
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
                    {horizontalScrollUses.map(([title, text], index) => (
                      <article
                        key={title}
                        className="min-w-[240px] snap-start border border-builder-border bg-builder-900 p-4 sm:min-w-[280px]"
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <h4 className="mt-3 text-sm font-semibold text-white">{title}</h4>
                        <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
                      </article>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 text-sm leading-6 text-gray-400 md:grid-cols-3">
                    <div className="border-l border-builder-border pl-4">
                      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Feels</span>
                      Premium, immersive, presentation-like.
                    </div>
                    <div className="border-l border-builder-border pl-4">
                      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Use for</span>
                      Timelines, product stories, portfolios.
                    </div>
                    <div className="border-l border-builder-border pl-4">
                      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Avoid when</span>
                      Simple text would be faster to scan.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="installation" className="space-y-5">
            <SectionTitle>Website installation options</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <InfoCard icon={GlobeAltIcon} title="Hosted chat link">
                Use this for navigation links, buttons, QR codes, email signatures, or campaign pages that should
                open a full chat view.
              </InfoCard>
              <div className="min-w-0 border border-builder-border bg-builder-800 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <CodeBracketIcon className="h-5 w-5 text-accent-500" />
                  Floating website widget
                </div>
                <CodeBlock>{`<script
  src="https://your-domain.com/widget.js"
  data-bot-id="CLIENT_BOT_ID"
  data-avatar-url="https://client-domain.com/logo.png"
  crossorigin="anonymous">
</script>`}</CodeBlock>
              </div>
            </div>
          </section>

          <section id="operations" className="space-y-5">
            <SectionTitle>Dashboard operations</SectionTitle>
            <div className="overflow-hidden border border-builder-border bg-builder-800">
              {operationRows.map(([name, description]) => (
                <div key={name} className="grid gap-2 border-b border-builder-border px-4 py-4 last:border-b-0 sm:px-5 md:grid-cols-[220px_1fr]">
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <p className="text-sm leading-6 text-gray-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="open-source" className="space-y-5">
            <SectionTitle>Open-source path</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <div className="border border-builder-border bg-builder-800 p-4 sm:p-5">
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

      <footer className="border-t border-builder-border bg-builder-900 py-6">
        <div className="mx-auto max-w-7xl px-4 text-xs leading-6 text-gray-500 sm:px-6">
          Darpan360 service guide.
          <a
            href={creatorCreditUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-2 text-gray-400 transition-colors hover:text-white"
          >
            Credit: Piyush Ratan.
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Docs;
