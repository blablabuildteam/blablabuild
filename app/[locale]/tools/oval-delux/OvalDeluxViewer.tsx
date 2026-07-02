'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Load StepViewer client-side only (uses WebGL + WASM)
const StepViewer = dynamic(() => import('@/components/StepViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-bla-lime border-t-transparent" />
    </div>
  ),
});

const MODELS = [
  { id: 'H1000', label: 'H1000', src: '/models/OD-H1000-00.00.00.STEP' },
  { id: 'H1320', label: 'H1320', src: '/models/OD-H1320-00.00.00.STEP' },
  { id: 'H1640', label: 'H1640', src: '/models/OD-H1640-00.00.00.STEP' },
];

export default function OvalDeluxViewer() {
  const [activeModel, setActiveModel] = useState(MODELS[0]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0b0e] text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/8 px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <span className="font-host text-[17px] font-bold tracking-tight">
            <span className="font-light text-white/50">blabla</span>build
          </span>
          <div className="h-4 w-px bg-white/15" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Oval Delux</span>
        </div>
        <span className="rounded-full border border-red-400/25 bg-red-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-red-400">
          Confidential
        </span>
      </header>

      {/* Main — viewer + sidebar */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* 3D Viewer */}
        <div className="relative flex-1" style={{ minHeight: '60vw', maxHeight: '80vh' }}>
          <StepViewer
            key={activeModel.id}
            src={activeModel.src}
            className="h-full w-full"
            autoRotate
          />
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6 border-t border-white/8 p-6 md:w-72 md:border-l md:border-t-0 md:p-8">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">Product</p>
            <h1 className="mt-1 font-host text-2xl font-light text-white">
              Oval <span className="font-medium">Delux</span>
            </h1>
          </div>

          {/* Model selector */}
          <div>
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Variant</p>
            <div className="flex flex-col gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModel(m)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    activeModel.id === m.id
                      ? 'border-bla-lime/40 bg-bla-lime/10 text-bla-lime'
                      : 'border-white/8 text-white/55 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="font-medium">{m.label}</span>
                  <span className="font-mono text-[10px] text-current opacity-60">
                    {m.id === activeModel.id ? 'active' : 'select'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls hint */}
          <div className="mt-auto rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Controls</p>
            <ul className="space-y-1.5 font-mono text-[10px] text-white/40">
              <li>🖱 Drag to rotate</li>
              <li>📱 One finger to rotate</li>
              <li>🔍 Scroll / pinch to zoom</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
