import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Search, Database, Layers } from 'lucide-react';

const STATUS_ROTATION = [
  { text: 'Preparing your answer...', icon: Sparkles },
  { text: 'Finding relevant products...', icon: Search },
  { text: 'Checking DigiComp catalog...', icon: Database },
  { text: 'Comparing components...', icon: Cpu },
  { text: 'Analyzing specifications...', icon: Layers },
];

export default function AIProcessingIndicator({
  active = true,
  intervalMs = 1800,
}) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    setStepIndex(0);
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STATUS_ROTATION.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, intervalMs]);

  if (!active) return null;

  const current = STATUS_ROTATION[stepIndex];
  const StepIcon = current.icon;

  return (
    <div className="flex gap-3.5 items-start animate-fade-in-up">
      {/* AI Emblem */}
      <div className="relative w-8 h-8 rounded-xl bg-surface border border-accent/30 text-accent flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <Sparkles className="w-4 h-4 animate-spin-slow text-accent" />
        <span className="absolute -inset-0.5 rounded-xl bg-accent/20 blur-[2px] -z-10 animate-pulse" />
      </div>

      {/* Activity Card */}
      <div className="min-w-[240px] max-w-sm rounded-2xl bg-surface/90 border border-border/90 shadow-sm p-3.5 space-y-2.5 backdrop-blur-xs">
        {/* Header: DigiComp AI ● WORKING */}
        <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <span className="text-accent">✦</span>
            <span>DigiComp AI</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            <span>WORKING</span>
          </div>
        </div>

        {/* Rotating dynamic message */}
        <div className="flex items-center gap-2 text-xs text-foreground/90 font-medium transition-all duration-300 min-h-[20px]">
          <StepIcon className="w-3.5 h-3.5 text-accent shrink-0 animate-pulse" />
          <span className="truncate">{current.text}</span>
        </div>

        {/* Subtle shimmer line */}
        <div className="h-0.5 w-full bg-default/40 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-accent to-transparent w-1/2 animate-[move_1.5s_infinite_linear] rounded-full" />
        </div>
      </div>
    </div>
  );
}
