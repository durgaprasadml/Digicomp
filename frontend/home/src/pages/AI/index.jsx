import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from '@typeroute/router';
import { toast } from '@heroui/react';
import {
  Send,
  Bot,
  User,
  ShoppingCart,
  Check,
  ExternalLink,
  Cpu,
  Plus,
  ArrowDown,
  History,
  Sparkles,
  Zap,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

import { UserStore } from '../../stores/UserStore';
import { CartStore } from '../../stores/CartStore';
import { PageStore } from '../../stores/PageStore';
import { login as loginRoute, home as homeRoute, product as productRoute } from '../../routes';

import {
  sendChatMessageStream,
  fetchConversations,
  fetchConversationById,
  renameConversation,
  deleteConversation,
  saveMessageToConversation,
  cleanFinalAssistantAnswer,
} from '../../utils/ai-api';
import { generateConversationTitle } from '../../utils/title-generator';
import { generateWelcomeMessage } from '../../utils/greeting';

import ChatHistorySidebar from './ChatHistorySidebar';
import AIProcessingIndicator from './AIProcessingIndicator';
import MarkdownRenderer from './MarkdownRenderer';

function generateNewConvId() {
  return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

const WELCOME_SUGGESTIONS = [
  {
    icon: Cpu,
    title: 'What is an ESP32?',
    desc: 'Dual-core specs, pinout & wireless capabilities',
    prompt: 'What is an ESP32?',
  },
  {
    icon: Zap,
    title: 'Build an obstacle avoiding robot',
    desc: 'Microcontrollers, motor drivers, sensors & chassis',
    prompt: 'Help me build an obstacle avoiding robot',
  },
  {
    icon: Search,
    title: 'Find sensors under ₹200',
    desc: 'Ultrasonic, infrared, temperature & ambient sensors',
    prompt: 'Find sensors under ₹200',
  },
  {
    icon: Layers,
    title: 'Wi-Fi + Bluetooth boards',
    desc: 'Explore ESP32, ESP8266 & RP2040 Pico W boards',
    prompt: 'I need a Wi-Fi + Bluetooth board',
  },
  {
    icon: Sparkles,
    title: 'Components for a CNC project',
    desc: 'Stepper motors, drivers, power supplies & controllers',
    prompt: 'Recommend components for a CNC project',
  },
  {
    icon: Cpu,
    title: 'Raspberry Pi Pico vs ESP32',
    desc: 'Architecture, pin count & performance comparison',
    prompt: 'How do I choose between Raspberry Pi Pico and ESP32?',
  },
];

export default function AIPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { user, isInitialized } = UserStore.use();
  const { currency = '₹' } = PageStore.use() || {};

  // Parse URL search params
  const urlParams = new URLSearchParams(search || (typeof window !== 'undefined' ? window.location.search : ''));
  const queryParam = urlParams.get('query') || urlParams.get('product') || urlParams.get('s') || '';
  const chatParam = urlParams.get('chat') || urlParams.get('id') || '';

  // Auth gate check - only trigger once UserStore has initialized
  useEffect(() => {
    if (isInitialized && !user?.is_logged_in) {
      const currentDest = typeof window !== 'undefined'
        ? (window.location.pathname + window.location.search)
        : '/ai';
      navigate({ to: loginRoute, state: { from: currentDest } });
    }
  }, [isInitialized, user?.is_logged_in, navigate]);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(() => chatParam || generateNewConvId());
  const [activeTitle, setActiveTitle] = useState('New Chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const getInitialMessages = useCallback(() => {
    if (queryParam) {
      return [
        {
          id: 'welcome-query',
          sender: 'assistant',
          text: `Tell me what you'd like to know about ${queryParam}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    }
    return [
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: generateWelcomeMessage({
          userName: user?.first_name || (user?.email ? user.email.split('@')[0] : null),
          isReturningUser: conversations.length > 0,
        }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  }, [queryParam, user?.first_name, user?.email, conversations.length]);

  const [messages, setMessages] = useState(getInitialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');
  const [addedProductIds, setAddedProductIds] = useState({});
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const activeRequestRef = useRef(false);
  const initialFetchDone = useRef(false);
  const isInitialMountRef = useRef(true);
  const userIsNearBottomRef = useRef(true);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Check if conversation has any user messages
  const hasUserMessages = messages.some((m) => m.sender === 'user');

  // 1. Initial page load scroll
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, []);

  // 2. Fetch conversations list
  const refreshConversationsList = useCallback(async () => {
    const list = await fetchConversations();
    setConversations(list);
    return list;
  }, []);

  useEffect(() => {
    refreshConversationsList();
  }, [refreshConversationsList]);

  // 3. Load specific conversation
  const loadConversationData = useCallback(async (convId) => {
    const conv = await fetchConversationById(convId);
    if (conv && conv.messages && conv.messages.length > 0) {
      setMessages(conv.messages);
      setActiveTitle(conv.title || 'New Chat');
      setActiveConversationId(conv.id);
    } else {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: generateWelcomeMessage({
            userName: user?.first_name || (user?.email ? user.email.split('@')[0] : null),
            isReturningUser: conversations.length > 0,
            productParam: queryParam,
          }),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setActiveTitle('New Chat');
      setActiveConversationId(convId);
    }
  }, [user?.first_name, user?.email, conversations.length, queryParam]);

  // Update initial greeting when user data updates
  useEffect(() => {
    if (!queryParam && !chatParam) {
      setMessages((prev) => {
        if (prev.length === 1 && prev[0].id === 'welcome-1') {
          const freshText = generateWelcomeMessage({
            userName: user?.first_name || (user?.email ? user.email.split('@')[0] : null),
            isReturningUser: conversations.length > 0,
          });
          if (prev[0].text !== freshText) {
            return [{ ...prev[0], text: freshText }];
          }
        }
        return prev;
      });
    }
  }, [user?.first_name, user?.email, conversations.length, queryParam, chatParam]);

  useEffect(() => {
    if (chatParam) {
      loadConversationData(chatParam);
    }
  }, [chatParam, loadConversationData]);

  // Scroll detection - strictly preserves position if user scrolls up
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNear = distanceFromBottom < 100;
    userIsNearBottomRef.current = isNear;
    setShowScrollBottomBtn(!isNear);
  };

  const scrollToContainerBottom = (force = false) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (force || userIsNearBottomRef.current) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: force ? 'smooth' : 'auto',
      });
      if (force) {
        userIsNearBottomRef.current = true;
        setShowScrollBottomBtn(false);
      }
    }
  };

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    // Only auto-scroll if user is near bottom
    if (userIsNearBottomRef.current) {
      scrollToContainerBottom(false);
    }
  }, [messages, isLoading]);

  const handleSendRef = useRef(null);

  // Handle prefilled query param (e.g. from SearchBox "Ask AI")
  useEffect(() => {
    if (queryParam && !initialFetchDone.current && !activeRequestRef.current) {
      initialFetchDone.current = true;
      handleSendRef.current?.(queryParam);
    }
  }, [queryParam]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Min 44px, max 140px
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 140)}px`;
    }
  }, [inputValue]);

  // Conversation Actions
  const handleNewChat = () => {
    if (activeRequestRef.current) return;
    const newId = generateNewConvId();
    setActiveConversationId(newId);
    setActiveTitle('New Chat');
    setMessages([
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: generateWelcomeMessage({
          userName: user?.first_name || (user?.email ? user.email.split('@')[0] : null),
          isReturningUser: conversations.length > 0,
        }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputValue('');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('chat');
      url.searchParams.delete('id');
      url.searchParams.delete('query');
      url.searchParams.delete('product');
      url.searchParams.delete('s');
      window.history.replaceState({}, '', url.pathname);
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    textareaRef.current?.focus();
  };

  const handleSelectConversation = async (id) => {
    if (id === activeConversationId || activeRequestRef.current) return;
    setActiveConversationId(id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('chat', id);
      window.history.replaceState({}, '', url.toString());
    }
    await loadConversationData(id);
    setTimeout(() => scrollToContainerBottom(true), 50);
  };

  const handleRenameConversation = async (id, newTitle) => {
    const ok = await renameConversation(id, newTitle);
    if (ok) {
      if (id === activeConversationId) {
        setActiveTitle(newTitle);
      }
      await refreshConversationsList();
    }
    return ok;
  };

  const handleDeleteConversation = async (id) => {
    const ok = await deleteConversation(id);
    if (ok) {
      const remaining = await refreshConversationsList();
      if (id === activeConversationId) {
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0].id);
        } else {
          handleNewChat();
        }
      }
    }
    return ok;
  };

  // Send message
  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || activeRequestRef.current || isLoading) return;

    activeRequestRef.current = true;
    setIsLoading(true);
    setActiveQuery(text);
    setInputValue('');

    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }

    const convId = activeConversationId;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now() + 1}`;

    const userMsg = {
      id: userMsgId,
      conversation_id: convId,
      sender: 'user',
      text,
      timestamp: now,
    };

    const aiMsgPlaceholder = {
      id: aiMsgId,
      conversation_id: convId,
      sender: 'assistant',
      text: '',
      timestamp: now,
    };

    // Auto-generate short title on first message
    const isFirstUserMessage = !messages.some((m) => m.sender === 'user');
    if (isFirstUserMessage || activeTitle === 'New Chat') {
      const generatedTitle = generateConversationTitle(text);
      setActiveTitle(generatedTitle);
      renameConversation(convId, generatedTitle)
        .then(() => refreshConversationsList())
        .catch((e) => console.warn('Failed to save title:', e));
    }

    saveMessageToConversation(convId, {
      id: userMsgId,
      role: 'user',
      content: text,
    }).catch((err) => console.warn('Failed to persist user message:', err));

    const history = messages
      .filter((m) => !m.text.startsWith('⚠️ Error:') && m.text.trim())
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    setMessages((prev) => [...prev, userMsg, aiMsgPlaceholder]);
    userIsNearBottomRef.current = true;
    setShowScrollBottomBtn(false);
    setTimeout(() => scrollToContainerBottom(true), 50);

    try {
      const res = await sendChatMessageStream(
        text,
        history,
        (token) => {
          const displayable = cleanFinalAssistantAnswer(token);
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, text: displayable } : m))
          );
        },
        (products) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, products } : m))
          );
        },
        undefined,
        convId
      );

      const finalCleanAnswer = cleanFinalAssistantAnswer(res.answer) || 'I could not process your request. Please try again.';
      const finalProducts = res.products && res.products.length > 0 ? res.products : undefined;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: finalCleanAnswer,
                products: finalProducts,
              }
            : m
        )
      );

      saveMessageToConversation(convId, {
        id: aiMsgId,
        role: 'assistant',
        content: finalCleanAnswer,
        products: finalProducts,
      })
        .then(() => refreshConversationsList())
        .catch((e) => console.warn('Failed to persist assistant message:', e));
    } catch (err) {
      console.error('Chat request failed:', err);
      let errorText = "Sorry, DigiComp AI couldn't connect right now. Please try again.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, text: errorText }
            : m
        )
      );
    } finally {
      activeRequestRef.current = false;
      setIsLoading(false);
      setActiveQuery('');
    }
  };
  handleSendRef.current = handleSend;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await CartStore.addToCart(product.id, 1);
      setAddedProductIds((prev) => ({ ...prev, [product.id]: true }));
      toast.success(`Added ${product.name} to cart`);
      setTimeout(() => {
        setAddedProductIds((prev) => ({ ...prev, [product.id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  };

  // If user session is initializing, show sleek loading state
  if (!isInitialized) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent animate-pulse">
            <Bot className="w-6 h-6" />
          </div>
          <span className="text-xs text-muted">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show authentication prompt
  if (isInitialized && !user?.is_logged_in) {
    const currentDest = typeof window !== 'undefined'
      ? (window.location.pathname + window.location.search)
      : '/ai';

    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-surface border border-border shadow-2xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-inner">
            <Bot className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Sign in to DigiComp AI</h2>
            <p className="text-xs text-muted leading-relaxed">
              Log in to your DigiComp account to access the AI electronics assistant, technical recommendations, and your chat history.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => navigate({ to: loginRoute, state: { from: currentDest } })}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-xs tracking-wider uppercase shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              Log in / Sign up
            </button>
            <button
              onClick={() => navigate({ to: homeRoute })}
              className="w-full py-2 rounded-xl text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] bg-background overflow-hidden select-text">
      {/* Left Chat History Sidebar */}
      <ChatHistorySidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main AI Workspace */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden bg-background">
        {/* Compact AI Header */}
        <header className="bg-surface/90 backdrop-blur-md border-b border-border/80 px-4 py-2.5 shrink-0 z-20 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile History Drawer Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-default/60 text-muted hover:text-foreground transition-colors cursor-pointer"
              title="Open chat history"
              aria-label="Open chat history"
            >
              <History className="w-4 h-4" />
            </button>

            {/* AI Emblem */}
            <div className="relative w-8 h-8 rounded-xl bg-accent/10 border border-accent/25 text-accent flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4.5 h-4.5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success ring-2 ring-surface" />
            </div>

            {/* AI Title & Status */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground tracking-tight">DigiComp AI</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success border border-success/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-muted truncate">
                {activeTitle && activeTitle !== 'New Chat' ? activeTitle : 'Electronics & Product Assistant'}
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleNewChat}
              className="text-xs text-foreground/90 hover:text-accent flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-default/60 hover:bg-default font-medium border border-border/60 cursor-pointer transition-all shadow-xs"
              title="Start a new conversation"
            >
              <Plus className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </header>

        {/* Message Stream Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 px-3 sm:px-6 py-6 overflow-y-auto scrollbar-thin space-y-6"
        >
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Centered Welcome State when conversation is empty */}
            {!hasUserMessages && (
              <div className="py-6 sm:py-10 flex flex-col items-center text-center space-y-6 animate-fade-in-up">
                {/* Tech Badge / Icon */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl bg-surface border border-accent/30 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                    <Sparkles className="w-8 h-8 animate-pulse text-accent" />
                  </div>
                  <div className="absolute -inset-1 rounded-3xl bg-accent/15 blur-md -z-10" />
                </div>

                {/* Welcome Title & Subtitle */}
                <div className="space-y-2 max-w-lg">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    DigiComp AI
                  </h1>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    Your engineering and electronics assistant. Ask about components, projects, compatibility, pricing, specifications, or DigiComp products.
                  </p>
                </div>

                {/* Capability Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-muted">
                  <span className="px-3 py-1 rounded-full bg-surface border border-border/80 shadow-xs flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-accent" /> Microcontrollers & SoCs
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface border border-border/80 shadow-xs flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-accent" /> Robotics & Sensors
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface border border-border/80 shadow-xs flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-accent" /> Circuit Compatibility
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface border border-border/80 shadow-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-accent" /> DigiComp Catalog & Stock
                  </span>
                </div>

                {/* Suggested Prompts Cards Grid */}
                <div className="w-full pt-4">
                  <div className="text-left text-xs font-bold text-muted uppercase tracking-wider mb-3 px-1">
                    Suggested Engineering Inquiries
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
                    {WELCOME_SUGGESTIONS.map((s, idx) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSend(s.prompt)}
                          disabled={isLoading}
                          className="group p-4 rounded-2xl bg-surface border border-border/80 hover:border-accent/50 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between gap-2 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="w-7 h-7 rounded-lg bg-default/60 group-hover:bg-accent/10 group-hover:text-accent transition-colors flex items-center justify-center text-muted">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] text-muted font-mono opacity-60 group-hover:opacity-100">
                              Prompt ↗
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground group-hover:text-accent transition-colors">
                              {s.title}
                            </div>
                            <div className="text-[11px] text-muted mt-0.5 line-clamp-2">
                              {s.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {hasUserMessages &&
              messages
                .filter(
                  (msg) =>
                    !(
                      msg.sender === 'assistant' &&
                      !msg.text &&
                      (!msg.products || msg.products.length === 0)
                    )
                )
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 sm:gap-3.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fade-in-up`}
                  >
                    {/* AI Avatar */}
                    {msg.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-surface text-accent flex items-center justify-center shrink-0 border border-border shadow-xs mt-1">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                    )}

                    {/* Bubble Content Container */}
                    <div
                      className={`space-y-3.5 max-w-[85%] sm:max-w-2xl ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-accent to-[var(--color-accent-hover,var(--accent))] text-white rounded-tr-xs shadow-sm'
                            : 'bg-surface border border-border/90 text-foreground rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <MarkdownRenderer content={msg.text} isUser={msg.sender === 'user'} />
                        <div
                          className={`text-[10px] mt-2.5 font-mono ${
                            msg.sender === 'user' ? 'text-white/75 text-right' : 'text-muted'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>

                      {/* Matching DigiComp Product Cards */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <Cpu className="w-4 h-4 text-accent" />
                            <span>Matching DigiComp Products ({msg.products.length}):</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.products.map((product) => {
                              const isAdded = addedProductIds[product.id];
                              return (
                                <div
                                  key={product.id}
                                  className="bg-surface border border-border hover:border-accent/40 rounded-2xl p-3.5 shadow-xs transition-all flex flex-col justify-between gap-3 group"
                                >
                                  <div className="flex gap-3">
                                    <div className="w-16 h-16 bg-default/15 border border-border rounded-xl p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                      <img
                                        src={
                                          product.image_url ||
                                          product.image ||
                                          '/wp-content/themes/dc/assets/img/logo.svg'
                                        }
                                        alt={product.name}
                                        className="object-contain max-h-full max-w-full transition-transform group-hover:scale-105 duration-200"
                                      />
                                    </div>
                                    <div className="space-y-1 min-w-0 flex-1">
                                      <span className="text-[10px] font-bold tracking-wider text-accent uppercase">
                                        {product.category || 'Hardware'}
                                      </span>
                                      <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                                        {product.name}
                                      </h4>
                                      <div className="flex items-center justify-between pt-0.5">
                                        <span className="text-sm font-extrabold text-foreground">
                                          {currency}
                                          {product.price}
                                        </span>
                                        <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                                          In Stock ({product.stock_quantity ?? product.stock ?? 0})
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-2 border-t border-border/70">
                                    <Link
                                      to={productRoute}
                                      params={{ slug: product.slug || product.sku || product.id }}
                                      className="flex-1 px-3 py-1.5 bg-default/70 hover:bg-default text-foreground text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <span>View Product</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>

                                    <button
                                      onClick={() => handleAddToCart(product)}
                                      disabled={isAdded}
                                      className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        isAdded
                                          ? 'bg-success text-white'
                                          : 'bg-accent hover:opacity-90 text-white shadow-xs'
                                      }`}
                                    >
                                      {isAdded ? (
                                        <>
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Added!</span>
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingCart className="w-3.5 h-3.5" />
                                          <span>Add to Cart</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* User Avatar */}
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                        <User className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                ))}

            {/* Animated Loading Indicator */}
            {isLoading && <AIProcessingIndicator active={isLoading} query={activeQuery} />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Scroll to Latest Button */}
        {showScrollBottomBtn && (
          <button
            onClick={() => scrollToContainerBottom(true)}
            className="absolute bottom-28 right-6 sm:right-10 z-30 bg-surface/90 hover:bg-surface text-foreground hover:text-accent px-3.5 py-2 rounded-full shadow-xl border border-border backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer animate-bounce"
            title="Scroll to latest messages"
          >
            <ArrowDown className="w-3.5 h-3.5 text-accent" />
            <span>Scroll to latest</span>
          </button>
        )}

        {/* Composer (Input Area) */}
        <div className="bg-surface/90 backdrop-blur-md border-t border-border/80 p-3 sm:p-4 shrink-0 z-20 shadow-sm">
          <div className="mx-auto max-w-4xl space-y-2.5">
            {/* Quick Suggestions row when conversation is active */}
            {hasUserMessages && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="text-muted font-medium shrink-0 flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3 h-3 text-accent" /> Suggested:
                </span>
                {['ESP32 pinout', 'Sensors under ₹200', 'Motor driver choice', 'Wi-Fi boards in stock'].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    disabled={isLoading}
                    className="shrink-0 px-2.5 py-1 bg-default/60 hover:bg-default hover:border-accent text-muted hover:text-foreground rounded-full border border-border/80 transition-colors text-[11px] cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input Composer Box */}
            <div className="relative flex items-end gap-2 bg-background border border-border/90 rounded-2xl p-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all shadow-inner">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask DigiComp AI about electronics, projects, components, compatibility, or pricing..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent resize-none border-none outline-none px-3 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted/70 leading-relaxed max-h-36 overflow-y-auto scrollbar-thin"
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isLoading || !inputValue.trim()}
                className="p-2.5 sm:px-4 sm:py-2.5 bg-accent hover:opacity-90 disabled:opacity-30 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                title="Send message (Enter)"
                aria-label="Send message"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline text-xs">Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted px-1">
              <span className="hidden sm:inline">Press <kbd className="px-1 py-0.5 rounded bg-default border border-border font-mono">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-default border border-border font-mono">Shift + Enter</kbd> for newline</span>
              <span className="ml-auto text-muted/60">DigiComp Engineering AI Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
