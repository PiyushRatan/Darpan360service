import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CommandLineIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Landing = () => {
  return (
    <div className="min-h-screen bg-builder-900 text-gray-200 selection:bg-accent-500 selection:text-white">
      
      {/* Absolute Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold tracking-tight text-white">Darpan360</h1>
        <div className="flex gap-4">
          <Link to="/docs" className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2">Docs</Link>
          <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2">Sign In</Link>
          <Link to="/dashboard" className="btn-primary text-sm px-5">Go to Dashboard</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center px-4">
        {/* Subtle background grid pattern to enhance technical feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-builder-800 border border-builder-border rounded-full text-xs font-semibold text-accent-500 mb-8 uppercase tracking-wider">
            <CommandLineIcon className="w-4 h-4" /> V1.0 API Now Available
          </div>

          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight mb-6">
            The AI Gateway For <br className="hidden md:block"/> Serious Businesses.
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Deploy hyper-intelligent, context-aware Bots directly into your application. We abstract the Gemini/Groq rotation logic so you stay at $0 latency and $0 cost.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
              Deploy Your First Bot
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/docs" className="btn-secondary text-lg px-8 py-3">
              Read the Docs
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Structured Features Grid */}
      <section id="features" className="py-20 bg-builder-900 border-t border-builder-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="card border-builder-border bg-builder-800 rounded p-6">
              <div className="w-10 h-10 bg-builder-900 border border-builder-border rounded flex items-center justify-center mb-6 text-accent-500">
                <BoltIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart API Rotator</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our backend instantly hot-swaps between API keys when an HTTP 429 Rate Limit is encountered, guaranteeing 99.9% uptime.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card border-builder-border bg-builder-800 rounded p-6">
              <div className="w-10 h-10 bg-builder-900 border border-builder-border rounded flex items-center justify-center mb-6 text-accent-500">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">IFrame Sandbox</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Deployed widgets load inside an encapsulated IFrame, completely immunizing your bot from the parent website's global CSS conflicts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card border-builder-border bg-builder-800 rounded p-6">
              <div className="w-10 h-10 bg-builder-900 border border-builder-border rounded flex items-center justify-center mb-6 text-accent-500">
                <CommandLineIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Developer Dashboard</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Built strictly for engineers. No fluffy gradients, no annoying marketing popups. Flat shadows, strict margins, zero latency.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Sparse Footer */}
      <footer className="border-t border-builder-border bg-builder-900 py-8 text-center text-sm text-gray-500">
        <p>Built with precision by React & Tailwind.</p>
      </footer>
    </div>
  );
};

export default Landing;
