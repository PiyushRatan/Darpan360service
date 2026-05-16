import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { SEO } from '../utils/seo';

const deliveryItems = [
  {
    icon: DocumentTextIcon,
    title: 'Business knowledge mapped',
    text: 'FAQs, service rules, pricing notes, policies, and contact paths are converted into a controlled assistant brief.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Website-ready installation',
    text: 'Each chatbot can run as a hosted chat page or a floating widget added to a client site with one script.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Domain controlled',
    text: 'Allowed-domain rules keep public bots restricted to approved client websites.'
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Maintained after launch',
    text: 'Answers, tone, allowed domains, and knowledge content can be refined as the client business changes.'
  }
];

const processSteps = [
  ['01', 'Client intake', 'Collect services, FAQs, policies, contact routes, brand details, and escalation rules.'],
  ['02', 'Assistant build', 'Create the bot, write the operating prompt, add knowledge, set styling, and lock approved domains.'],
  ['03', 'Site installation', 'Install the widget or hosted chat link and test it on the real client website.'],
  ['04', 'Refinement', 'Review visitor questions, improve unclear answers, and keep the knowledge base current.']
];

const clientChecklist = [
  'Company profile and service list',
  'Frequently asked questions',
  'Pricing or quotation rules',
  'Contact details and working hours',
  'Brand color and avatar/logo',
  'Approved website domains'
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-builder-900 text-gray-200 selection:bg-accent-500 selection:text-white">
      <SEO
        title="Darpan360 | Managed AI Chatbot Setup for Business Websites"
        description="Darpan360 helps service providers launch business-specific AI chatbots with managed setup, website installation, domain control, and ongoing refinement."
      />

      <header className="border-b border-builder-border bg-builder-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">Darpan360</Link>
          <nav className="flex items-center gap-4">
            <Link to="/docs" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">Service Guide</Link>
            <Link to="/login" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">Operator Sign In</Link>
            <Link to="/dashboard" className="btn-primary text-sm px-5">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-500">Managed chatbot deployment</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl">
              Install business-specific AI chat on client websites.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-400">
              Darpan360 is built for service providers who configure, install, and maintain AI chatbots for businesses. Clients provide their content. You handle setup, testing, website installation, and ongoing updates.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to="/docs" className="btn-primary px-6 py-3 text-base">
                View Service Guide
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                Operator Sign In
              </Link>
            </div>
          </div>

          <aside className="border border-builder-border bg-builder-800 p-6">
            <div className="flex items-center justify-between border-b border-builder-border pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Client launch file</div>
                <h2 className="mt-1 text-lg font-semibold text-white">What you collect</h2>
              </div>
              <BookOpenIcon className="h-6 w-6 text-accent-500" />
            </div>
            <div className="mt-5 space-y-3">
              {clientChecklist.map((item) => (
                <div key={item} className="flex items-center justify-between border border-builder-border bg-builder-900 px-4 py-3">
                  <span className="text-sm text-gray-300">{item}</span>
                  <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden="true" />
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="border-y border-builder-border bg-builder-900 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white">What the service delivers</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                A client does not need to understand API keys, hosting, prompts, or Firebase. The value is a configured assistant installed on their website and maintained by you.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {deliveryItems.map(({ icon, title, text }) => (
                <article key={title} className="border border-builder-border bg-builder-800 p-5">
                  <div className="flex h-10 w-10 items-center justify-center border border-builder-border bg-builder-900 text-accent-500">
                    {React.createElement(icon, { className: 'h-5 w-5' })}
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[360px_1fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">A repeatable launch workflow</h2>
            <p className="mt-4 text-sm leading-6 text-gray-400">
              The system is designed for repeated client deployments. Build once, configure per business, then keep improving each assistant from one operator dashboard.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {processSteps.map(([number, title, text]) => (
              <article key={title} className="border-l border-builder-border pl-5">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">{number}</div>
                <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-builder-border bg-builder-800 py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Open-source code, service-ready operation.</h2>
              <p className="mt-4 text-sm leading-6 text-gray-400">
                Developers can copy the public GitHub project. Businesses that want a done-for-them installation can use the managed service workflow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link to="/docs#open-source" className="btn-secondary px-5 py-3">
                <CodeBracketIcon className="mr-2 h-5 w-5" />
                Open-source path
              </Link>
              <Link to="/dashboard" className="btn-primary px-5 py-3">
                Configure a client bot
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-builder-border bg-builder-900 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>Darpan360 managed AI chatbot deployments.</p>
          <div className="flex gap-4">
            <Link to="/docs" className="hover:text-white">Service Guide</Link>
            <Link to="/login" className="hover:text-white">Operator Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
