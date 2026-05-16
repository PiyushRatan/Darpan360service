import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { SEO } from '../utils/seo';
import { auth } from '../config/firebase';
import { useAuth } from '../context/useAuth';

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

const creatorCreditUrl = 'https://piyushratan.in/work/darpan360';
const revealViewport = { once: true, amount: 0.32 };
const revealEase = [0.22, 1, 0.36, 1];

const getInitials = (user) => {
  const source = user?.displayName || user?.email || 'Operator';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'O';
};

const Reveal = ({ children, className = '', delay = 0, y = 24 }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ duration: 0.62, ease: revealEase, delay }}
    >
      {children}
    </motion.div>
  );
};

const StackedServiceCard = ({ item, index, total, progress }) => {
  const shouldReduceMotion = useReducedMotion();
  const start = Math.max(0, (index - 0.5) / total);
  const middle = Math.min(1, (index + 0.15) / total);
  const end = Math.min(1, (index + 1) / total);
  const y = useTransform(progress, [start, end], [index * 28, index * 8]);
  const scale = useTransform(progress, [start, end], [1, 1 - index * 0.018]);
  const opacity = useTransform(progress, [start, middle, end], [0.72, 1, 1]);
  const Icon = item.icon;

  return (
    <motion.article
      style={{
        top: `calc(5rem + ${index * 18}px)`,
        zIndex: index + 1,
        ...(shouldReduceMotion ? {} : { y, scale, opacity })
      }}
      className="border border-builder-border bg-builder-800 p-5 shadow-sm transition-colors hover:border-gray-600 lg:sticky"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-builder-border bg-builder-900 text-accent-500">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            Service layer {String(index + 1).padStart(2, '0')}
          </div>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-gray-400">{item.text}</p>
        </div>
      </div>
    </motion.article>
  );
};

const ServiceStackSection = () => {
  const sectionRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  return (
    <section ref={sectionRef} className="border-y border-builder-border bg-builder-900 py-16 lg:py-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:min-h-[185vh] lg:grid-cols-[0.78fr_1.22fr]">
        <div className="lg:sticky lg:top-24 lg:self-start lg:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <div className="mb-5 h-px w-16 bg-accent-500" aria-hidden="true" />
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                What the service delivers
              </h2>
              <p className="mt-5 text-sm leading-7 text-gray-400">
                A client does not need to understand API keys, hosting, prompts, or Firebase. The value is a configured assistant installed on their website and maintained by you.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Managed delivery sequence
              </p>
            </div>
          </Reveal>
        </div>

        <div className="space-y-4 lg:py-24">
          {deliveryItems.map((item, index) => (
            <StackedServiceCard
              key={item.title}
              item={item}
              index={index}
              total={deliveryItems.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

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
  const shouldReduceMotion = useReducedMotion();
  const heroRef = React.useRef(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 70]);
  const heroOpacity = useTransform(heroProgress, [0, 0.85], [1, 0.52]);

  return (
    <div className="min-h-screen bg-builder-900 text-gray-200 selection:bg-accent-500 selection:text-white">
      {!shouldReduceMotion && (
        <motion.div
          className="fixed left-0 top-0 z-[80] h-0.5 w-full origin-left bg-accent-500"
          style={{ scaleX: scrollYProgress }}
          aria-hidden="true"
        />
      )}

      <SEO
        title="Darpan360 | Managed AI Chatbot Setup for Business Websites"
        description="Darpan360 helps service providers launch business-specific AI chatbots with managed setup, website installation, domain control, and ongoing refinement."
      />

      <header className="sticky top-0 z-40 border-b border-builder-border bg-builder-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">Darpan360</Link>
          <nav className="flex items-center gap-4">
            <Link to="/docs" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">Service Guide</Link>
            {isSignedIn ? (
              <LandingProfileMenu currentUser={currentUser} dbUser={dbUser} />
            ) : (
              <Link to="/login" className="btn-primary px-5 text-sm">Operator Sign In</Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section ref={heroRef} className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_420px] lg:items-center">
          <motion.div
            style={shouldReduceMotion ? undefined : { y: heroY, opacity: heroOpacity }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: revealEase }}
          >
            <div className="overflow-hidden">
              <motion.p
                initial={shouldReduceMotion ? false : { y: 22 }}
                animate={shouldReduceMotion ? undefined : { y: 0 }}
                transition={{ duration: 0.7, ease: revealEase, delay: 0.05 }}
                className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-500"
              >
                Managed chatbot deployment
              </motion.p>
            </div>
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
              <Link to={isSignedIn ? '/dashboard' : '/login'} className="btn-secondary px-6 py-3 text-base">
                {isSignedIn ? 'Open Dashboard' : 'Operator Sign In'}
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={shouldReduceMotion ? false : { opacity: 0, y: 34, rotateX: -4 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.75, ease: revealEase, delay: 0.18 }}
            className="border border-builder-border bg-builder-800 p-6"
          >
            <div className="flex items-center justify-between border-b border-builder-border pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Client launch file</div>
                <h2 className="mt-1 text-lg font-semibold text-white">What you collect</h2>
              </div>
              <BookOpenIcon className="h-6 w-6 text-accent-500" />
            </div>
            <div className="mt-5 space-y-3">
              {clientChecklist.map((item, index) => (
                <motion.div
                  key={item}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.48, ease: revealEase, delay: 0.28 + index * 0.055 }}
                  className="flex items-center justify-between border border-builder-border bg-builder-900 px-4 py-3"
                >
                  <span className="text-sm text-gray-300">{item}</span>
                  <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden="true" />
                </motion.div>
              ))}
            </div>
          </motion.aside>
        </section>

        <ServiceStackSection />

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[360px_1fr]">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-white">A repeatable launch workflow</h2>
            <p className="mt-4 text-sm leading-6 text-gray-400">
              The system is designed for repeated client deployments. Build once, configure per business, then keep improving each assistant from one operator dashboard.
            </p>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {processSteps.map(([number, title, text], index) => (
              <Reveal key={title} delay={index * 0.08} y={18}>
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
                {isSignedIn ? 'Configure a client bot' : 'Operator Sign In'}
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
              {isSignedIn ? 'Dashboard' : 'Operator Sign In'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
