import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  X,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

function groupConversations(conversations) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOfSevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const groups = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    Older: [],
  };

  for (const conv of conversations) {
    const updatedTime = new Date(conv.updated_at || conv.created_at).getTime();
    if (isNaN(updatedTime)) {
      groups.Older.push(conv);
    } else if (updatedTime >= startOfToday) {
      groups.Today.push(conv);
    } else if (updatedTime >= startOfYesterday) {
      groups.Yesterday.push(conv);
    } else if (updatedTime >= startOfSevenDaysAgo) {
      groups['Previous 7 Days'].push(conv);
    } else {
      groups.Older.push(conv);
    }
  }

  const result = [];
  const groupOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Older'];

  for (const label of groupOrder) {
    if (groups[label].length > 0) {
      result.push({
        label,
        conversations: groups[label],
      });
    }
  }

  return result;
}

export default function ChatHistorySidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const editInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const lastMsgMatch = (c.last_message || '').toLowerCase().includes(q);
        return titleMatch || lastMsgMatch;
      })
    : conversations;

  const grouped = groupConversations(filteredConversations);

  const handleStartRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = async (id, e) => {
    if (e) e.preventDefault();
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    await onRenameConversation(id, editTitle.trim());
    setEditingId(null);
  };

  const handleDeletePrompt = (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    setMenuOpenId(null);
  };

  const handleConfirmDelete = async (id, e) => {
    e.stopPropagation();
    await onDeleteConversation(id);
    setDeletingId(null);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border select-none">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between gap-2">
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-accent text-white font-medium text-xs shadow-xs hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-2 rounded-lg text-muted hover:text-foreground hover:bg-default transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        <button
          onClick={onCloseMobile}
          className="md:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-default transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Filter */}
      {conversations.length > 3 && (
        <div className="px-3 py-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-default/40 border border-border rounded-lg pl-8 pr-3 py-1 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-muted hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin">
        {conversations.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-muted">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No chat history yet.</p>
            <p className="text-[10px] mt-1 text-muted/80">Start asking DigiComp AI!</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted">
            No chats matching "{searchQuery}".
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-muted uppercase tracking-wider">
                {group.label}
              </div>
              {group.conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isEditing = conv.id === editingId;
                const isDeleting = conv.id === deletingId;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      if (!isEditing && !isDeleting) {
                        onSelectConversation(conv.id);
                        onCloseMobile();
                      }
                    }}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                        : 'text-foreground/80 hover:bg-default hover:text-foreground'
                    }`}
                  >
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(conv.id, e)}
                        className="flex items-center gap-1 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 bg-background border border-accent rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none"
                        />
                        <button type="submit" className="p-1 text-success hover:opacity-80">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 text-muted hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : isDeleting ? (
                      <div
                        className="flex items-center justify-between w-full bg-danger/10 px-2 py-1 rounded text-[11px] text-danger"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Delete chat?</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleConfirmDelete(conv.id, e)}
                            className="font-bold hover:underline"
                          >
                            Yes
                          </button>
                          <span>/</span>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="hover:underline text-foreground"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 truncate pr-2">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-accent' : 'text-muted'}`} />
                          <span className="truncate">{conv.title || 'New Chat'}</span>
                        </div>

                        <div className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                            }}
                            className="p-1 rounded text-muted hover:text-foreground hover:bg-default"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {menuOpenId === conv.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-surface border border-border shadow-xl p-1 z-30 flex flex-col text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleStartRename(conv, e)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-default text-left text-foreground"
                              >
                                <Edit2 className="w-3 h-3 text-muted" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={(e) => handleDeletePrompt(conv.id, e)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-danger/10 text-left text-danger"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-0 overflow-hidden' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
