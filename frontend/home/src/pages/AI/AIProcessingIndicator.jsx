import React, { useState, useEffect, useMemo } from 'react';
import { Bot, Sparkles, Search, Layers, Cpu } from 'lucide-react';

export function classifyQuery(query) {
  if (!query || typeof query !== 'string') return 'general';
  const q = query.toLowerCase().trim();
  if (!q) return 'general';

  const projectPatterns = [
    /\b(build|make|create|develop|construct|diy|project|robot|robotics|smart|system|automation|automate|iot|circuit|wiring|schematic|interfac(e|ing)|connect(ing)?|line follower|obstacle avoid(ing|er)?|quadcopter|drone|tracker|transmitter|receiver)\b/i,
    /\b(how to build|how to make|how to connect|how to wire|guide to|tutorial for|components? for)\b/i,
  ];

  const productPricePatterns = [
    /\b(under|below|around|within|budget|price|cost|rate|cheap|cheapest|affordable)\b/i,
    /₹|\brs\.?|\binr\b/i,
    /\b(buy|purchase|order|shop|store|in stock|stock|available|catalog|discount|deal|specs|datasheet)\b/i,
    /\b(i need|i want|looking for|recommend|suggest|find me|search for|give me)\b/i,
  ];

  const questionPatterns = [
    /^(hi|hello|hey|greetings|howdy|good (morning|afternoon|evening))\b/i,
    /^(what is|what are|what's|explain|who (is|was|invented)|why (is|are|do|does)|how (does|do|works?)|difference between|compare|tell me about|definition of|can you explain)\b/i,
    /\?$/,
  ];

  if (projectPatterns.some((p) => p.test(q))) return 'project';
  if (productPricePatterns.some((p) => p.test(q))) return 'product';
  if (questionPatterns.some((p) => p.test(q))) return 'question';
  return 'general';
}

export function getStatusSteps(category) {
  switch (category) {
    case 'question':
      return [
        { text: 'Understanding your question...', icon: 'sparkles' },
        { text: 'Analyzing electronics concepts...', icon: 'cpu' },
        { text: 'Preparing explanation...', icon: 'layers' },
        { text: 'Finalizing your answer...', icon: 'ready' },
      ];
    case 'product':
      return [
        { text: 'Understanding requirements...', icon: 'sparkles' },
        { text: 'Searching DigiComp catalog...', icon: 'search' },
        { text: 'Checking price and availability...', icon: 'layers' },
        { text: 'Matching components...', icon: 'cpu' },
        { text: 'Preparing recommendations...', icon: 'ready' },
      ];
    case 'project':
      return [
        { text: 'Understanding project scope...', icon: 'sparkles' },
        { text: 'Identifying required hardware...', icon: 'cpu' },
        { text: 'Finding matching DigiComp parts...', icon: 'search' },
        { text: 'Checking inventory...', icon: 'layers' },
        { text: 'Preparing build recommendations...', icon: 'ready' },
      ];
    default:
      return [
        { text: 'Understanding your request...', icon: 'sparkles' },
        { text: 'Analyzing requirements...', icon: 'cpu' },
        { text: 'Searching DigiComp catalog...', icon: 'search' },
        { text: 'Preparing your response...', icon: 'ready' },
      ];
  }
}

export default function AIProcessingIndicator({
  active = true,
  mode,
  query,
  statusOverride,
  intervalMs = 1800,
}) {
  const normalizedCategory = useMemo(() => {
    if (mode && ['product', 'project', 'question', 'general'].includes(mode)) {
      return mode;
    }
    return classifyQuery(query);
  }, [mode, query]);

  const steps = useMemo(() => getStatusSteps(normalizedCategory), [normalizedCategory]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!active || steps.length <= 1) return;
    setStepIndex(0);
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, steps, intervalMs]);

  if (!active) return null;

  const currentStep = steps[stepIndex % steps.length] || steps[0];
  const displayText = statusOverride || currentStep.text;

  return (
    <div className="flex gap-3 items-start animate-fade-in-up">
      <div className="w-8 h-8 rounded-lg bg-surface border border-border text-accent flex items-center justify-center shrink-0 shadow-xs">
        <Bot className="w-4.5 h-4.5 animate-pulse" />
      </div>
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface border border-border text-xs text-muted shadow-xs">
        <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
        <span className="font-medium text-foreground">{displayText}</span>
      </div>
    </div>
  );
}
