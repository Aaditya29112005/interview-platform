'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Mic, 
  Play, 
  Clock, 
  Volume2, 
  Database, 
  TrendingUp, 
  Cpu, 
  BookOpen, 
  CheckCircle, 
  Shield, 
  ChevronRight,
  Terminal,
  Grid
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'tokens'>('preview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const categories = [
    { id: 'all', name: 'All Components' },
    { id: 'buttons', name: 'Buttons' },
    { id: 'cards', name: 'Cards' },
    { id: 'widgets', name: 'Interactive Widgets' },
  ];

  // Component definitions with mock code and renderers
  const designElements = [
    {
      id: 'glass-card',
      category: 'cards',
      name: 'Glass Card',
      description: 'Backdrop blur surface card with dynamic lighting glows on cursor hover.',
      code: `<div className="rounded-2xl border border-zinc-800 bg-[#0E1225]/45 p-6 backdrop-blur-md shadow-2xl hover:border-[#6C7DFF]/30 transition-all duration-300">
  <h4 className="text-sm font-bold text-white">Glass Card Header</h4>
  <p className="text-xs text-[#A1A9C0] mt-1">Premium visual card surface</p>
</div>`,
      render: () => (
        <div className="rounded-2xl border border-zinc-800 bg-[#0E1225]/45 p-6 backdrop-blur-md shadow-2xl hover:border-[#6C7DFF]/30 transition-all duration-300">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#00D9FF]" />
            <span>Glass Card Element</span>
          </h4>
          <p className="text-xs text-[#A1A9C0] mt-2 leading-relaxed">
            Beautiful semi-transparent glass panel utilizing modern backdrop blur vectors.
          </p>
        </div>
      )
    },
    {
      id: 'gradient-btn',
      category: 'buttons',
      name: 'Gradient Glow Button',
      description: 'Primary button featuring color gradients and subtle halo glow shadows.',
      code: `<button className="rounded-xl bg-gradient-to-r from-[#6C7DFF] to-[#7F5AF0] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#6C7DFF]/15 transition hover:brightness-110">
  Start Your Interview →
</button>`,
      render: () => (
        <button className="rounded-xl bg-gradient-to-r from-[#6C7DFF] to-[#7F5AF0] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#6C7DFF]/15 transition hover:brightness-110">
          Start Your Interview →
        </button>
      )
    },
    {
      id: 'ai-orb',
      category: 'widgets',
      name: 'AI Core Orb',
      description: 'Interactive breathing brand asset simulating AI thinking cycles.',
      code: `<div className="h-20 w-20 rounded-full border border-[#00D9FF] bg-[#0E1225] flex items-center justify-center shadow-lg shadow-[#00D9FF]/20 animate-pulse">
  <Brain className="h-5 w-5 text-[#00D9FF]" />
</div>`,
      render: () => (
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full border-2 border-[#00D9FF] bg-gradient-to-br from-[#0E1225] to-[#00D9FF]/10 flex items-center justify-center shadow-lg shadow-[#00D9FF]/20 relative overflow-hidden animate-[pulse_2s_infinite]">
            <Brain className="h-5 w-5 text-[#00D9FF]" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Active Orb: Listening</div>
            <div className="text-[10px] text-[#A1A9C0]">State cycles continuously</div>
          </div>
        </div>
      )
    },
    {
      id: 'stats-card',
      category: 'cards',
      name: 'Analytics Stats Card',
      description: 'Dashboard metrics widget displaying scores and positive status check labels.',
      code: `<div className="rounded-2xl border border-zinc-800 bg-[#0E1225] p-5 space-y-2">
  <div className="text-[10px] font-bold text-[#A1A9C0] uppercase tracking-wider">Candidate Score</div>
  <div className="text-2xl font-black text-white font-mono">92%</div>
</div>`,
      render: () => (
        <div className="rounded-2xl border border-zinc-800 bg-[#0E1225] p-5 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-[#6C7DFF]/5 rounded-bl-full" />
          <div className="text-[10px] font-bold text-[#A1A9C0] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-[#6C7DFF]" />
            <span>Candidate Score</span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-white font-mono">92%</span>
            <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.5 rounded">Ready</span>
          </div>
        </div>
      )
    },
    {
      id: 'waveform',
      category: 'widgets',
      name: 'Microphone Waveform',
      description: 'Holographic waveform reacting to microphone verbal signals.',
      code: `<div className="flex items-center gap-1">
  <span className="h-6 w-1 rounded bg-[#00D9FF] animate-[bounce_1s_infinite_delay-100]" />
  <span className="h-9 w-1 rounded bg-[#6C7DFF] animate-[bounce_1.2s_infinite]" />
</div>`,
      render: () => (
        <div className="flex items-center gap-1.5 h-12 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 w-36 justify-center">
          <span className="h-4 w-1 rounded bg-[#00D9FF] animate-[pulse_0.8s_infinite]" />
          <span className="h-8 w-1 rounded bg-[#6C7DFF] animate-[pulse_1.2s_infinite]" />
          <span className="h-6 w-1 rounded bg-[#7F5AF0] animate-[pulse_1s_infinite]" />
          <span className="h-8 w-1 rounded bg-[#6C7DFF] animate-[pulse_1.4s_infinite]" />
          <span className="h-3 w-1 rounded bg-[#00D9FF] animate-[pulse_0.6s_infinite]" />
        </div>
      )
    },
    {
      id: 'floating-dock',
      category: 'widgets',
      name: 'Floating Command Dock',
      description: 'Premium floating navigational dock bar with translucent backdrops.',
      code: `<div className="flex items-center gap-3 rounded-full border border-zinc-800 bg-[#0E1225]/80 px-4 py-2.5 backdrop-blur-lg">
  <button className="text-[#A1A9C0] hover:text-white transition">🔍</button>
</div>`,
      render: () => (
        <div className="flex items-center gap-3.5 rounded-full border border-zinc-800 bg-[#0E1225]/85 px-4.5 py-2 backdrop-blur-lg shadow-xl shadow-black/40">
          <button className="h-7 w-7 rounded-full bg-[#6C7DFF]/10 text-[#6C7DFF] flex items-center justify-center hover:scale-110 transition"><Brain className="h-3.5 w-3.5" /></button>
          <button className="h-7 w-7 rounded-full bg-zinc-900 text-[#A1A9C0] flex items-center justify-center hover:scale-110 transition"><Mic className="h-3.5 w-3.5" /></button>
          <button className="h-7 w-7 rounded-full bg-zinc-900 text-[#A1A9C0] flex items-center justify-center hover:scale-110 transition"><Clock className="h-3.5 w-3.5" /></button>
        </div>
      )
    }
  ];

  const filteredElements = selectedCategory === 'all' 
    ? designElements 
    : designElements.filter(el => el.category === selectedCategory);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#050816] pb-16 pt-8">
      {/* Mesh Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1020_1px,transparent_1px),linear-gradient(to_bottom,#0b1020_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Terminal className="h-7 w-7 text-[#6C7DFF]" />
              <span>Design System Commands Gallery</span>
            </h1>
            <p className="mt-1 text-sm text-[#A1A9C0]">
              Explore the premium, modular component libraries built for the InterviewOS brand architecture.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex bg-[#0E1225] p-1.5 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'preview' ? 'bg-[#6C7DFF] text-white' : 'text-[#A1A9C0] hover:text-white'
              }`}
            >
              Component Previews
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'tokens' ? 'bg-[#6C7DFF] text-white' : 'text-[#A1A9C0] hover:text-white'
              }`}
            >
              Design Tokens
            </button>
          </div>
        </div>

        {activeTab === 'preview' ? (
          <div className="space-y-8">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    selectedCategory === cat.id
                      ? 'bg-[#6C7DFF]/15 border-[#6C7DFF] text-white'
                      : 'border-zinc-850 bg-[#0E1225]/40 text-[#A1A9C0] hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Grid Layout of Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredElements.map((element) => (
                <div key={element.id} className="rounded-2xl border border-zinc-800 bg-[#0E1225]/45 p-6 space-y-5 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white capitalize">{element.name}</h3>
                    <p className="text-xs text-[#A1A9C0] leading-relaxed">{element.description}</p>
                  </div>

                  {/* Render Area */}
                  <div className="h-32 bg-[#050816] rounded-xl border border-zinc-900 flex items-center justify-center p-6">
                    {element.render()}
                  </div>

                  {/* Code Area */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-2xs font-semibold text-zinc-550">
                      <span>TAILWIND / JSX</span>
                      <button
                        onClick={() => handleCopy(element.code, element.id)}
                        className="text-[#6C7DFF] hover:underline"
                      >
                        {copiedCode === element.id ? 'Copied! ✓' : 'Copy Template Code'}
                      </button>
                    </div>
                    <pre className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 font-mono text-[10px] text-zinc-400 overflow-x-auto leading-normal">
                      {element.code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tokens Table Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-zinc-800 bg-[#0E1225]/45 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Grid className="h-4 w-4 text-[#6C7DFF]" />
                <span>Primary Color Tokens</span>
              </h3>
              <div className="divide-y divide-zinc-900 text-xs">
                {[
                  { name: 'Background', hex: '#050816', css: 'bg-[#050816]' },
                  { name: 'Surface Panel', hex: '#0E1225', css: 'bg-[#0E1225]' },
                  { name: 'Brand Primary', hex: '#6C7DFF', css: 'bg-[#6C7DFF]' },
                  { name: 'Brand Accent', hex: '#7F5AF0', css: 'bg-[#7F5AF0]' },
                  { name: 'Cyan Highlight', hex: '#00D9FF', css: 'bg-[#00D9FF]' },
                  { name: 'Success Green', hex: '#00E676', css: 'bg-[#00E676]' },
                ].map((token) => (
                  <div key={token.name} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-md border border-zinc-800 ${token.css}`} />
                      <span className="font-semibold text-zinc-300">{token.name}</span>
                    </div>
                    <code className="font-mono text-2xs text-[#A1A9C0]">{token.hex}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#0E1225]/45 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-[#7F5AF0]" />
                <span>Brand Typography & Spacing Rules</span>
              </h3>
              <div className="space-y-4 text-xs leading-relaxed text-[#A1A9C0]">
                <p>
                  Our layout standard leverages structured spacing guidelines to ensure clean whitespace ratios (Linear & Apple design principles).
                </p>
                <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-900 font-mono text-2xs space-y-2 text-zinc-400">
                  <div>// Neue Montreal / Geist Sans Font Family</div>
                  <div className="text-white">font-family: &apos;Inter&apos;, sans-serif;</div>
                  <div className="pt-2">// Premium card border rules</div>
                  <div className="text-white">border: 1px solid rgba(255, 255, 255, 0.08);</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
