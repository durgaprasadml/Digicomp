import React from 'react';
import { useLocation, Link, useNavigate } from '@typeroute/router';
import { Sparkles } from 'lucide-react';
import { UserStore } from '../stores/UserStore';
import { ai as aiRoute, login as loginRoute } from '../routes';

export default function FloatingAIButton() {
  const { path } = useLocation();
  const navigate = useNavigate();
  const { user } = UserStore.use();

  // Hide on /ai, /login, or /signup page
  if (path === '/ai' || path.startsWith('/ai') || path === '/login' || path === '/signup') {
    return null;
  }

  const handleClick = (e) => {
    e.preventDefault();
    if (!user?.is_logged_in) {
      navigate({ to: loginRoute, state: { from: '/ai' } });
    } else {
      navigate({ to: aiRoute });
    }
  };

  return (
    <button
      onClick={handleClick}
      id="floating-ask-ai-button"
      className="fixed bottom-[154px] md:bottom-[150px] lg:bottom-[86px] right-8 z-40 flex items-center gap-2 px-3.5 py-2 bg-surface/90 hover:bg-surface text-foreground rounded-full shadow-xl hover:shadow-2xl border border-border hover:border-accent/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group cursor-pointer"
      aria-label="Ask DigiComp AI"
    >
      <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center group-hover:opacity-90 transition-opacity">
        <Sparkles className="w-3 h-3" />
      </div>
      <span className="text-xs font-semibold tracking-wide pr-0.5">Ask DigiComp AI</span>
    </button>
  );
}
