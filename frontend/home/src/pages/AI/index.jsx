import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from '@typeroute/router';
import { Toast, Spinner, toast } from '@heroui/react';
import {
  Send,
  Bot,
  User,
  ArrowLeft,
  ShoppingCart,
  Check,
  ExternalLink,
  Cpu,
  Plus,
  Info,
  ArrowDown,
  History,
  Sparkles,
  Search,
} from 'lucide-react';

import { UserStore } from '../../stores/UserStore';
import { CartStore } from '../../stores/CartStore';
import { PageStore } from '../../stores/PageStore';
import { login as loginRoute, home as homeRoute, shop as shopRoute, product as productRoute } from '../../routes';

import {
  sendChatMessageStream,
  fetchConversations,
  fetchConversationById,
  createConversation,
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

export default function AIPage() {
  const { path, search, state } = useLocation();
  const navigate = useNavigate();
  const { user } = UserStore.use();
  const { currency = '₹' } = PageStore.use() || {};

  // Parse URL search params
  const urlParams = new URLSearchParams(search || (typeof window !== 'undefined' ? window.location.search : ''));
  const queryParam = urlParams.get('query') || urlParams.get('product') || urlParams.get('s') || '';
  const chatParam = urlParams.get('chat') || urlParams.get('id') || '';

  // Auth gate check
  useEffect(() => {
    // If UserStore has resolved and user is not logged in, redirect to login
    if (UserStore.get().user && !UserStore.get().user.is_logged_in) {
      navigate({ to: loginRoute, state: { from: '/ai' } });
    }
  }, [user?.is_logged_in, navigate]);

  const suggestedPrompts = [
    'What is an ESP32?',
    'What is a sensor?',
    'I want to build an obstacle avoiding robot',
    'I need an ESP32 under ₹500',
    'Show me sensors under ₹200',
    'I need a board with Wi-Fi and Bluetooth',
  ];

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
  const inputRef = useRef(null);

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

  // Scroll detection
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
    scrollToContainerBottom(false);
  }, [messages, isLoading]);

  // Handle prefilled query param (e.g. from SearchBox "Ask AI")
  useEffect(() => {
    if (queryParam && !initialFetchDone.current && !activeRequestRef.current) {
      initialFetchDone.current = true;
      handleSend(queryParam);
    }
  }, [queryParam]);

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
    inputRef.current?.focus();
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
      let errorText = err.message || "Sorry, I couldn't connect to DigiComp AI. Please try again.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, text: `⚠️ Error: ${errorText}. Please try again.` }
            : m
        )
      );
    } finally {
      activeRequestRef.current = false;
      setIsLoading(false);
      setActiveQuery('');
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

  // If user is not authenticated, show authentication prompt
  if (user && !user.is_logged_in) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="max-w-md p-8 rounded-2xl bg-surface border border-border shadow-xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Bot className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Sign in to use DigiComp AI</h2>
          <p className="text-sm text-muted leading-relaxed">
            Please log in or create an account to access the DigiComp AI Assistant and your conversation history.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate({ to: loginRoute, state: { from: '/ai' } })}
              className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity cursor-pointer"
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
    <div className="flex-1 flex h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] bg-background overflow-hidden">
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

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden bg-background">
        {/* Chat Header Bar */}
        <div className="bg-surface border-b border-border px-4 py-3 shrink-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="md:hidden p-1.5 rounded-lg bg-default text-muted hover:text-foreground transition-colors"
                title="Open chat history"
              >
                <History className="w-4 h-4" />
              </button>

              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4.5 h-4.5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-foreground truncate">
                    {activeTitle === 'New Chat' ? 'DigiComp AI Assistant' : activeTitle}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/20 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-muted truncate">Electronics, Robotics & Product Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleNewChat}
                className="text-xs text-accent hover:opacity-90 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-default font-semibold cursor-pointer transition-opacity"
                title="Start a new conversation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 px-4 py-6 space-y-6 overflow-y-auto"
        >
          <div className="mx-auto max-w-4xl space-y-6">
            {messages
              .filter((msg) => !(msg.sender === 'assistant' && !msg.text && (!msg.products || msg.products.length === 0)))
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI Avatar */}
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-surface text-accent flex items-center justify-center shrink-0 border border-border shadow-xs mt-1">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`space-y-3 max-w-2xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-accent text-white rounded-tr-xs shadow-xs'
                          : 'bg-surface border border-border text-foreground rounded-tl-xs shadow-xs'
                      }`}
                    >
                      <MarkdownRenderer content={msg.text} isUser={msg.sender === 'user'} />
                      <div
                        className={`text-[10px] mt-2 font-mono ${
                          msg.sender === 'user' ? 'text-white/70 text-right' : 'text-muted'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {/* Product Cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Cpu className="w-4 h-4 text-accent" />
                          <span>Matching DigiComp Products ({msg.products.length}):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.products.map((product) => {
                            const isAdded = addedProductIds[product.id];
                            return (
                              <div
                                key={product.id}
                                className="bg-surface border border-border hover:border-accent/40 rounded-xl p-3.5 shadow-xs transition-all flex flex-col justify-between gap-3 group"
                              >
                                <div className="flex gap-3">
                                  <div className="w-16 h-16 bg-default/10 border border-border rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={product.image_url || product.image || '/wp-content/themes/dc/assets/img/logo.svg'}
                                      alt={product.name}
                                      className="object-contain max-h-full max-w-full"
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
                                        {currency}{product.price}
                                      </span>
                                      <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                                        In Stock ({product.stock_quantity ?? product.stock ?? 0})
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-border">
                                  <Link
                                    to={productRoute}
                                    params={{ slug: product.slug || product.sku || product.id }}
                                    className="flex-1 px-3 py-1.5 bg-default hover:bg-default/80 text-foreground text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1"
                                  >
                                    <span>View Product</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>

                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={isAdded}
                                    className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                    <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <User className="w-4.5 h-4.5" />
                    </div>
                  )}
                </div>
              ))}

            {isLoading && <AIProcessingIndicator query={activeQuery} />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Scroll to Bottom */}
        {showScrollBottomBtn && (
          <button
            onClick={() => scrollToContainerBottom(true)}
            className="absolute bottom-28 right-8 z-20 bg-accent hover:opacity-90 text-white p-2.5 rounded-full shadow-lg border border-white/20 transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold animate-bounce cursor-pointer"
          >
            <ArrowDown className="w-4 h-4" />
            <span>Scroll to latest</span>
          </button>
        )}

        {/* Input Area */}
        <div className="bg-surface border-t border-border p-4 shrink-0 shadow-xs z-10">
          <div className="mx-auto max-w-4xl space-y-3">
            {/* Suggestions */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-muted font-semibold shrink-0 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Suggested:
              </span>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  disabled={isLoading}
                  className="shrink-0 px-3 py-1 bg-default hover:border-accent text-muted hover:text-foreground rounded-full border border-border transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask DigiComp AI about microcontrollers, sensors, projects, or pricing..."
                disabled={isLoading}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />

              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-5 py-3 bg-accent hover:opacity-90 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
