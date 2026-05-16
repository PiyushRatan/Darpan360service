import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  BoltIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { SEO } from '../utils/seo';
import { auth } from '../config/firebase';
import { useAuth } from '../context/useAuth';

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

const integrationRows = [
  ['Website widget', 'Hosted chat', 'Domain lock', 'Firebase auth', 'Lead capture', 'Operator dashboard'],
  ['Knowledge brief', 'Tone rules', 'Escalation paths', 'Service FAQs', 'Install script', 'Launch QA']
];

const intelligenceCards = [
  {
    label: '01 / Intake',
    title: 'Business context becomes assistant memory',
    text: 'Collect the rules that matter: services, pricing logic, policies, contact routes, and the exact tone the client wants visitors to hear.',
    metric: '6 inputs'
  },
  {
    label: '02 / Control',
    title: 'Every bot gets guardrails before launch',
    text: 'Approved domains, fallback instructions, escalation paths, and managed prompts keep the public experience focused.',
    metric: 'Domain safe'
  },
  {
    label: '03 / Deploy',
    title: 'Install once, refine continuously',
    text: 'A hosted page or widget gets the bot live quickly, while the dashboard stays ready for edits after real visitor questions arrive.',
    metric: 'Live loop'
  }
];

const launchSteps = [
  {
    label: 'Client packet',
    title: 'Collect the source of truth',
    text: 'Services, FAQs, policy limits, pricing rules, contacts, and working hours become the starting dataset.'
  },
  {
    label: 'Assistant build',
    title: 'Shape the answer system',
    text: 'The setup prompt, fallback rules, tone, approved domains, and widget configuration are prepared together.'
  },
  {
    label: 'Website install',
    title: 'Move from demo to live site',
    text: 'The bot launches through a hosted chat page or embeddable widget, then gets tested in the real website flow.'
  },
  {
    label: 'Refinement loop',
    title: 'Improve after real visitor behavior',
    text: 'New questions expose gaps, and the operator dashboard keeps every client bot current without rebuilding.'
  }
];

const workflowSteps = [
  {
    kicker: 'Knowledge packet',
    title: 'Client content is shaped into a controlled brief',
    text: 'FAQs, services, contact paths, policy language, and boundaries become a clean setup file instead of scattered notes.'
  },
  {
    kicker: 'Assistant setup',
    title: 'The bot is configured with tone, scope, and safety',
    text: 'Prompts, allowed domains, widget settings, and fallback behavior are tuned before any visitor sees the chatbot.'
  },
  {
    kicker: 'Live refinement',
    title: 'Real questions create the improvement loop',
    text: 'Visitor patterns reveal missing answers, unclear service details, and new updates that can be added from the operator dashboard.'
  }
];

const creatorCreditUrl = 'https://piyushratan.in/work/darpan360';

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return prefersReducedMotion;
};

const getInitials = (user) => {
  const source = user?.displayName || user?.email || 'Operator';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'O';
};

const Reveal = ({ children, className = '' }) => (
  <div data-reveal className={className}>
    {children}
  </div>
);

const MagneticLink = ({ to, children, className = '' }) => (
  <Link to={to} data-magnetic className={className}>
    {children}
  </Link>
);

const IntegrationMarquee = () => {
  const repeatedRows = integrationRows.map((row) => [...row, ...row, ...row]);

  return (
    <section className="overflow-hidden border-y border-builder-border bg-builder-900 py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          <span className="h-px w-10 bg-accent-500" aria-hidden="true" />
          Launch system modules
        </div>
      </div>
      <div className="space-y-3">
        {repeatedRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex w-max gap-3 ${rowIndex === 0 ? 'animate-marquee' : 'animate-marquee-reverse'}`}
          >
            {row.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="border border-builder-border bg-builder-800/70 px-4 py-2 text-sm font-medium text-gray-300 shadow-sm transition-colors hover:border-accent-500/50 hover:text-white"
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

const IntelligenceCard = ({ card, index }) => (
  <article
    data-stack-card
    data-tilt-card
    className="group min-h-[260px] border border-builder-border bg-builder-800 p-6 shadow-sm transition-colors hover:border-gray-600"
    style={{ top: `calc(6rem + ${index * 20}px)`, zIndex: index + 1 }}
  >
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">{card.label}</span>
        <span className="border border-builder-border bg-builder-900 px-2 py-1 text-xs font-semibold text-gray-400 transition-colors group-hover:text-white">
          {card.metric}
        </span>
      </div>
      <h3 className="mt-8 text-xl font-semibold tracking-tight text-white">{card.title}</h3>
      <p className="mt-4 text-sm leading-6 text-gray-400">{card.text}</p>
      <div className="mt-auto pt-8 text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
        Setup stage {String(index + 1).padStart(2, '0')}
      </div>
    </div>
  </article>
);

const LaunchControlSection = () => (
  <section data-stack-section="launch" className="overflow-hidden border-b border-builder-border bg-builder-900 px-6 py-16 lg:py-0">
    <div data-stack-pin className="mx-auto grid max-w-7xl gap-10 lg:min-h-screen lg:grid-cols-[0.82fr_1.18fr]">
      <div className="lg:sticky lg:top-24 lg:self-start lg:py-24">
        <Reveal className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Built like a launch control room
          </h2>
          <p className="mt-5 text-sm leading-7 text-gray-400">
            Intake, guardrails, deployment, and improvement stay connected as one managed operating system for every client bot.
          </p>
        </Reveal>
      </div>

      <div className="space-y-4 lg:py-24">
        {intelligenceCards.map((card, index) => (
          <IntelligenceCard key={card.title} card={card} index={index} />
        ))}
      </div>
    </div>
  </section>
);

const ClientLaunchSection = () => (
  <section data-sequence-section className="border-b border-builder-border bg-builder-900 py-16 lg:py-24">
    <div className="mx-auto w-full max-w-7xl px-6">
      <div className="grid gap-10 lg:grid-cols-[390px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <Reveal>
            <div>
              <div className="mb-5 h-px w-16 bg-accent-500" aria-hidden="true" />
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Client launch sequence
              </h2>
              <p className="mt-5 text-sm leading-7 text-gray-400">
                Move from raw business knowledge to a live assistant with a clear setup path, installation step, and refinement loop.
              </p>
            </div>
          </Reveal>
        </div>

        <div>
          <div className="space-y-4">
            {launchSteps.map((item, index) => (
              <Reveal key={item.title}>
                <article
                  data-sequence-card
                  data-tilt-card
                  className="group relative border border-builder-border bg-builder-800 p-6 shadow-sm transition-colors hover:border-gray-500 lg:p-8"
                >
                  <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:24px_24px]" aria-hidden="true" />
                  <div className="relative grid gap-5 lg:grid-cols-[150px_1fr] lg:items-start">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">
                        {String(index + 1).padStart(2, '0')} / {item.label}
                      </span>
                      <div className="mt-5 grid grid-cols-4 gap-2.5" aria-hidden="true">
                        {launchSteps.map((_, markerIndex) => (
                          <span
                            key={markerIndex}
                            className={`h-1.5 border border-builder-border transition-colors duration-500 ${markerIndex <= index ? 'bg-accent-500' : 'bg-builder-900'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-white">{item.title}</h3>
                      <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400">{item.text}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ServiceCard = ({ item, index }) => {
  const Icon = item.icon;

  return (
    <article
      data-tilt-card
      className="group border border-builder-border bg-builder-800 p-6 shadow-xl transition-colors hover:border-gray-500"
      style={{ top: `calc(6.5rem + ${index * 22}px)`, zIndex: index + 1 }}
    >
      <div className="flex items-start gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-builder-border bg-builder-900 text-accent-500 shadow-inner group-hover:border-accent-500/30 transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500/80">
              Module {String(index + 1).padStart(2, '0')}
            </div>
            <div className="h-px w-4 bg-builder-border" aria-hidden="true" />
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-600 group-hover:text-gray-400 transition-colors">
              Managed Service
            </div>
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-gray-400">{item.text}</p>
        </div>
      </div>
    </article>
  );
};

const ServiceStackSection = () => (
  <section className="relative isolate z-10 overflow-hidden border-y border-builder-border bg-builder-900 px-6 py-16 lg:py-24">
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <Reveal className="max-w-2xl">
          <div className="mb-6 h-px w-16 bg-accent-500" aria-hidden="true" />
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            What the service delivers
          </h2>
          <p className="mt-6 text-base leading-8 text-gray-400">
            A client does not need to understand API keys, hosting, prompts, or Firebase. The value is a fully configured, domain-restricted assistant installed on their website and maintained by your agency.
          </p>
          <div className="mt-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            <span className="h-2 w-2 rounded-full bg-accent-500" />
            Managed delivery sequence
          </div>
        </Reveal>
      </div>

      <div className="space-y-4">
        {deliveryItems.map((item, index) => (
          <ServiceCard key={item.title} item={item} index={index} />
        ))}
      </div>
    </div>
  </section>
);

const WorkflowStorySection = () => (
  <section data-workflow-section className="overflow-hidden border-y border-builder-border bg-builder-900">
    <div data-workflow-pin className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:min-h-screen lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-0">
      <div className="space-y-6">
        <Reveal>
          <div className="mb-5 h-px w-16 bg-accent-500" aria-hidden="true" />
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            AI workflow from intake to live answers
          </h2>
          <p className="mt-5 text-sm leading-7 text-gray-400">
            A client request moves through intake, setup, website installation, and continuous tuning.
          </p>
        </Reveal>

        {workflowSteps.map((step) => (
          <Reveal key={step.title}>
            <article data-workflow-copy className="group border-l border-builder-border bg-builder-900 py-3 pl-5 transition-colors hover:border-accent-500">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">{step.kicker}</div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">{step.text}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <div>
        <div data-workflow-mockup className="relative overflow-hidden border border-builder-border bg-builder-800 p-5 shadow-sm">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:18px_18px]" aria-hidden="true" />
          <div className="relative border border-builder-border bg-builder-900 p-5">
            <div className="flex items-center justify-between border-b border-builder-border pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Live orchestration</div>
                <h3 className="mt-1 text-lg font-semibold text-white">Client bot pipeline</h3>
              </div>
              <SparklesIcon className="h-6 w-6 text-accent-500" />
            </div>

            <div className="relative mt-8 min-h-[360px]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 360" fill="none" aria-hidden="true">
                <path d="M82 66 C190 46 196 162 278 144 C364 126 352 260 450 238" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                <path
                  data-workflow-path
                  d="M82 66 C190 46 196 162 278 144 C364 126 352 260 450 238"
                  stroke="url(#workflowGradient)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="workflowGradient" x1="72" x2="458" y1="62" y2="242" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#06b6d4" />
                    <stop offset="1" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>

              {[
                { title: 'Intake', subtitle: 'FAQs + policy', position: 'left-[4%] top-[6%]', Icon: DocumentTextIcon },
                { title: 'Configure', subtitle: 'Prompt + domain', position: 'left-[39%] top-[30%]', Icon: ShieldCheckIcon },
                { title: 'Deploy', subtitle: 'Widget + updates', position: 'right-[2%] top-[58%]', Icon: BoltIcon }
              ].map(({ title, subtitle, position, Icon }) => (
                <div
                  key={title}
                  data-workflow-node
                  className={`absolute ${position} w-36 border border-builder-border bg-builder-800 p-4 shadow-sm`}
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center border border-builder-border bg-builder-900 text-accent-500">
                    {React.createElement(Icon, { className: 'h-5 w-5' })}
                  </div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-gray-500">{subtitle}</div>
                </div>
              ))}

              <div data-workflow-answer className="absolute bottom-0 left-0 right-0 border border-builder-border bg-builder-900/90 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Visitor question</div>
                    <p className="mt-1 text-sm text-gray-300">"Do you provide emergency appointments after hours?"</p>
                  </div>
                  <PlayCircleIcon className="h-8 w-8 shrink-0 text-accent-500" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {['Search brief', 'Answer safely', 'Offer contact'].map((item) => (
                    <div key={item} data-workflow-action className="border border-builder-border bg-builder-800 px-2 py-2 text-center text-[11px] font-medium text-gray-400">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const LandingProfileMenu = ({ currentUser, dbUser }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const displayName = currentUser?.displayName || currentUser?.email || 'Operator';

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await auth.signOut();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 border border-builder-border bg-builder-800 px-2.5 py-2 text-sm font-medium text-white transition-colors hover:bg-builder-700"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {currentUser?.photoURL ? (
          <img src={currentUser.photoURL} alt="" className="h-8 w-8 rounded-full border border-builder-border object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center bg-builder-900 text-xs font-semibold text-accent-500">
            {getInitials(currentUser)}
          </span>
        )}
        <span className="hidden max-w-32 truncate md:inline">{displayName}</span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-64 border border-builder-border bg-builder-800 p-2 shadow-xl"
        >
          <div className="border-b border-builder-border px-3 py-3">
            <div className="truncate text-sm font-semibold text-white">{displayName}</div>
            <div className="mt-1 truncate text-xs text-gray-500">{currentUser?.email}</div>
            {dbUser?.role === 'admin' && (
              <div className="mt-2 inline-flex border border-accent-500/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-accent-500">
                Admin
              </div>
            )}
          </div>

          <Link
            to="/dashboard"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="mt-2 flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-builder-900 hover:text-white"
          >
            <UserCircleIcon className="h-5 w-5 text-gray-500" />
            Dashboard
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-gray-300 transition-colors hover:bg-builder-900 hover:text-white"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const Landing = () => {
  const { currentUser, dbUser } = useAuth();
  const isSignedIn = Boolean(currentUser);
  const rootRef = React.useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.9
    });
    const updateLenis = (time) => lenis.raf(time * 1000);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      if (prefersReducedMotion) {
        gsap.set(root.querySelectorAll('[data-reveal], [data-hero-line], [data-sequence-card], [data-stack-card], [data-workflow-node], [data-workflow-answer], [data-workflow-action]'), {
          clearProps: 'all',
          opacity: 1
        });
        return undefined;
      }

      gsap.set('[data-hero-line]', { autoAlpha: 0, y: 28 });
      gsap.set('[data-hero-card]', { autoAlpha: 0, y: 34, rotationX: -4 });
      gsap.set('[data-checklist-item]', { autoAlpha: 0, x: 18 });
      gsap.set('[data-reveal]', { autoAlpha: 0, y: 26 });
      gsap.set('[data-sequence-card]', { autoAlpha: 0, y: 42, scale: 0.985 });

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('[data-hero-line]', { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.08 })
        .to('[data-hero-card]', { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.8 }, 0.16)
        .to('[data-checklist-item]', { autoAlpha: 1, x: 0, duration: 0.42, stagger: 0.055 }, 0.34);

      gsap.to('[data-progress-bar]', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2
        }
      });

      gsap.to('[data-hero-copy]', {
        y: 70,
        autoAlpha: 0.55,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-hero-section]',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.to('[data-site-header]', {
        backgroundColor: 'rgba(30, 30, 30, 0.94)',
        borderColor: 'rgba(51, 51, 51, 1)',
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 20,
          end: 160,
          scrub: true
        }
      });

      gsap.to('[data-nav-inner]', {
        paddingTop: 12,
        paddingBottom: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 20,
          end: 160,
          scrub: true
        }
      });

      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.to(element, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 82%',
            once: true
          }
        });
      });

      gsap.utils.toArray('[data-sequence-section]').forEach((section) => {
        const cards = gsap.utils.toArray(section.querySelectorAll('[data-sequence-card]'));
        if (cards.length === 0) return;

        gsap.to(cards, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.72,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
            once: true
          }
        });
      });

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const createStackTimeline = (section) => {
          const cards = gsap.utils.toArray(section.querySelectorAll('[data-stack-card]'));

          gsap.set(cards, {
            autoAlpha: 0,
            y: (index) => 96 + index * 18,
            scale: 1.02
          });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${Math.max(900, cards.length * 400)}`,
              pin: section.querySelector('[data-stack-pin]'),
              pinSpacing: true,
              scrub: 1,
              anticipatePin: 1,
              preventOverlaps: true,
              invalidateOnRefresh: true
            }
          });

          cards.forEach((card, index) => {
            timeline.to(card, {
              autoAlpha: 1,
              y: index * 12,
              scale: 1 - index * 0.018,
              duration: 1,
              ease: 'power2.out'
            }, index * 0.48);
          });

          if (cards.length > 0) {
            timeline.to(cards[cards.length - 1], {
              y: (cards.length - 1) * 12,
              duration: 0.35,
              ease: 'none'
            }, '>');
          }
        };

        gsap.utils.toArray('[data-stack-section]').forEach((section) => {
          createStackTimeline(section);
        });

        const workflowSection = root.querySelector('[data-workflow-section]');
        const workflowPath = root.querySelector('[data-workflow-path]');
        if (workflowSection && workflowPath) {
          const workflowNodes = gsap.utils.toArray(workflowSection.querySelectorAll('[data-workflow-node]'));
          const workflowAnswer = workflowSection.querySelector('[data-workflow-answer]');
          const workflowActions = gsap.utils.toArray(workflowSection.querySelectorAll('[data-workflow-action]'));
          const pathLength = workflowPath.getTotalLength();
          gsap.set(workflowPath, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength
          });
          gsap.set([...workflowNodes, workflowAnswer, ...workflowActions].filter(Boolean), {
            autoAlpha: 0,
            scale: 0.78,
            y: 18
          });

          gsap.timeline({
            scrollTrigger: {
              trigger: workflowSection,
              start: 'top top',
              end: '+=1150',
              pin: workflowSection.querySelector('[data-workflow-pin]'),
              pinSpacing: true,
              scrub: 1,
              anticipatePin: 1,
              preventOverlaps: true,
              invalidateOnRefresh: true
            }
          })
            .to(workflowPath, { strokeDashoffset: 0, duration: 1.4, ease: 'none' })
            .to(workflowNodes, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.22, ease: 'back.out(1.4)' }, 0.12)
            .to(workflowAnswer, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.92)
            .to(workflowActions, { autoAlpha: 1, scale: 1, y: 0, duration: 0.35, stagger: 0.12, ease: 'power2.out' }, 1.12)
            .to(workflowActions, { y: 0, duration: 0.28, ease: 'none' }, '>');
        }

        const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => cancelAnimationFrame(refreshFrame);
      });

      mm.add('(pointer: fine)', () => {
        const cleanups = [];

        gsap.utils.toArray('[data-magnetic]').forEach((element) => {
          const xTo = gsap.quickTo(element, 'x', { duration: 0.32, ease: 'power3.out' });
          const yTo = gsap.quickTo(element, 'y', { duration: 0.32, ease: 'power3.out' });
          const move = (event) => {
            const rect = element.getBoundingClientRect();
            xTo((event.clientX - rect.left - rect.width / 2) * 0.16);
            yTo((event.clientY - rect.top - rect.height / 2) * 0.22);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };

          element.addEventListener('pointermove', move);
          element.addEventListener('pointerleave', leave);
          cleanups.push(() => {
            element.removeEventListener('pointermove', move);
            element.removeEventListener('pointerleave', leave);
          });
        });

        gsap.utils.toArray('[data-tilt-card]').forEach((element) => {
          const rotateX = gsap.quickTo(element, 'rotationX', { duration: 0.35, ease: 'power3.out' });
          const rotateY = gsap.quickTo(element, 'rotationY', { duration: 0.35, ease: 'power3.out' });
          const move = (event) => {
            const rect = element.getBoundingClientRect();
            const relX = (event.clientX - rect.left) / rect.width - 0.5;
            const relY = (event.clientY - rect.top) / rect.height - 0.5;
            rotateX(relY * -5);
            rotateY(relX * 5);
          };
          const leave = () => {
            rotateX(0);
            rotateY(0);
          };

          gsap.set(element, { transformPerspective: 900, transformOrigin: 'center' });
          element.addEventListener('pointermove', move);
          element.addEventListener('pointerleave', leave);
          cleanups.push(() => {
            element.removeEventListener('pointermove', move);
            element.removeEventListener('pointerleave', leave);
          });
        });

        return () => cleanups.forEach((cleanup) => cleanup());
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-x-hidden bg-builder-900 text-gray-200 selection:bg-accent-500 selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] noise-layer" aria-hidden="true" />
      <div
        data-progress-bar
        className="fixed left-0 top-0 z-[80] h-0.5 w-full origin-left scale-x-0 bg-accent-500"
        aria-hidden="true"
      />

      <SEO
        title="Darpan360 | Managed AI Chatbot Setup for Business Websites"
        description="Darpan360 helps service providers launch business-specific AI chatbots with managed setup, website installation, domain control, and ongoing refinement."
      />

      <header data-site-header className="sticky top-0 z-40 border-b border-builder-border bg-builder-900/72 backdrop-blur-xl">
        <div data-nav-inner className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">Darpan360</Link>
          <nav className="flex items-center gap-4">
            <Link to="/docs" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">Service Guide</Link>
            {isSignedIn ? (
              <LandingProfileMenu currentUser={currentUser} dbUser={dbUser} />
            ) : (
              <Link to="/login" className="btn-primary px-5 text-sm">Sign In</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section data-hero-section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_420px] lg:items-center">
          <div data-hero-copy>
            <p data-hero-line className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-500">
              Managed chatbot deployment
            </p>
            <h1 data-hero-line className="mt-5 max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl">
              Install business-specific AI chat on client websites.
            </h1>
            <p data-hero-line className="mt-7 max-w-2xl text-lg leading-8 text-gray-400">
              Darpan360 is built for service providers who configure, install, and maintain AI chatbots for businesses. Clients provide their content. You handle setup, testing, website installation, and ongoing updates.
            </p>
            <div data-hero-line className="mt-10 flex flex-col gap-3 sm:flex-row">
              <MagneticLink to="/docs" className="btn-primary px-6 py-3 text-base">
                View Service Guide
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </MagneticLink>
              <MagneticLink to={isSignedIn ? '/dashboard' : '/login'} className="btn-secondary px-6 py-3 text-base">
                {isSignedIn ? 'Open Dashboard' : 'Sign In'}
              </MagneticLink>
            </div>
          </div>

          <aside data-hero-card className="border border-builder-border bg-builder-800 p-6">
            <div className="flex items-center justify-between border-b border-builder-border pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Client launch file</div>
                <h2 className="mt-1 text-lg font-semibold text-white">What you collect</h2>
              </div>
              <BookOpenIcon className="h-6 w-6 text-accent-500" />
            </div>
            <div className="mt-5 space-y-3">
              {clientChecklist.map((item) => (
                <div
                  key={item}
                  data-checklist-item
                  className="flex items-center justify-between border border-builder-border bg-builder-900 px-4 py-3"
                >
                  <span className="text-sm text-gray-300">{item}</span>
                  <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden="true" />
                </div>
              ))}
            </div>
          </aside>
        </section>

        <IntegrationMarquee />
        <LaunchControlSection />
        <ClientLaunchSection />
        <ServiceStackSection />
        <WorkflowStorySection />

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[360px_1fr]">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-white">A repeatable launch workflow</h2>
            <p className="mt-4 text-sm leading-6 text-gray-400">
              The system is designed for repeated client deployments. Build once, configure per business, then keep improving each assistant from one operator dashboard.
            </p>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {processSteps.map(([number, title, text]) => (
              <Reveal key={title}>
                <article className="border-l border-builder-border pl-5 transition-colors hover:border-accent-500">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">{number}</div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-t border-builder-border bg-builder-800 py-14">
          <Reveal className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_420px] lg:items-center">
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
              <Link to={isSignedIn ? '/dashboard' : '/login'} className="btn-primary px-5 py-3">
                {isSignedIn ? 'Configure a client bot' : 'Sign In'}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-builder-border bg-builder-900 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            Darpan360 managed AI chatbot deployments.
            <a
              href={creatorCreditUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 text-gray-400 transition-colors hover:text-white"
            >
              Built by Piyush Ratan.
            </a>
          </p>
          <div className="flex gap-4">
            <Link to="/docs" className="hover:text-white">Service Guide</Link>
            <Link to={isSignedIn ? '/dashboard' : '/login'} className="hover:text-white">
              {isSignedIn ? 'Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
