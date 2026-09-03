import { UserStore } from '../stores/UserStore';

const AI_API_BASE = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000';
const TIMEOUT_SECONDS = parseInt(import.meta.env.VITE_AI_TIMEOUT_SECONDS || '120', 10) || 120;

/**
 * Ensures authentication with the AI backend for the currently logged-in DigiComp user.
 */
export async function getAuthHeaders() {
  const { user } = UserStore.get() || {};
  const headers = {
    'Content-Type': 'application/json',
  };

  if (user?.is_logged_in) {
    const userEmail = user.email || `user-${user.id}@digicomp.local`;
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || userEmail.split('@')[0];
    const userId = user.id ? `wp-${user.id}` : `wp-${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Pass DigiComp user info headers
    headers['X-Digicomp-User-Id'] = userId;
    headers['X-Digicomp-User-Email'] = userEmail;
    headers['X-Digicomp-User-Name'] = userName;

    // Check if we have an active session token stored locally
    let token = typeof localStorage !== 'undefined' ? localStorage.getItem('digicomp_ai_session') : null;

    if (!token) {
      // Auto-authenticate or login with backend
      try {
        const loginRes = await fetch(`${AI_API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, password: `digicomp_${userId}` }),
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          token = data.token;
        } else if (loginRes.status === 401 || loginRes.status === 404) {
          // Create user account on AI backend
          const signupRes = await fetch(`${AI_API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: userName,
              email: userEmail,
              password: `digicomp_${userId}`,
            }),
          });
          if (signupRes.ok) {
            const signupData = await signupRes.json();
            token = signupData.token;
          }
        }

        if (token && typeof localStorage !== 'undefined') {
          localStorage.setItem('digicomp_ai_session', token);
        }
      } catch (err) {
        console.warn('AI backend auto-auth notice:', err);
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Cleans assistant output to strictly remove any internal reasoning, thinking tags,
 * planning phrases, tool markers, or raw JSON.
 */
export function cleanFinalAssistantAnswer(rawContent) {
  if (!rawContent) return '';

  let cleaned = String(rawContent);

  // 1. Remove thinking / analysis tags
  cleaned = cleaned.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '');
  cleaned = cleaned.replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/gi, '');
  cleaned = cleaned.replace(/<analysis>[\s\S]*?(?:<\/analysis>|$)/gi, '');
  cleaned = cleaned.replace(/<\/?think>|<\/?thinking>|<\/?analysis>/gi, '');

  // 2. Remove tool call markers / raw JSON / artifacts
  cleaned = cleaned.replace(/SEARCH_PRODUCTS:\s*[^\n]+/gi, '');
  cleaned = cleaned.replace(/search_digicomp_products[^\n]*/gi, '');
  cleaned = cleaned.replace(/MAX_PRICE:\s*\d+/gi, '');
  cleaned = cleaned.replace(/^ANSWER:\s*/i, '');
  cleaned = cleaned.replace(/^Possible response:\s*/i, '');
  cleaned = cleaned.replace(/\{[\s\S]*?"(?:tool|query|max_price)"[\s\S]*?\}/gi, '');

  // 3. Filter out lines containing internal reasoning indicators
  const reasoningRegex = /\b(the user (is|wants|needs|asked|looking|might)|they('ll|'re| will| might| need| want| are)|let me (start|check|think|search|recall|first|see|use|know if you)|i (need|should|will|must|have|might|can|would|'ll) (to )?(check|search|find|use|look|recall|suggest|recommend|call|query)|first,?\s*i need|okay,?\s*the user|okay,?\s*let me|okay,?\s*i need|alright,?\s*the user|my role is|system prompt|maybe they need|i should check|if they want|search function|search query|tool call|calling tool|thinking about|let's analyze|thought:|action:|plan:|make sure to (mention|include|search)|the function allows|the query should be|max_price should be)\b/i;

  const lines = cleaned.split('\n');
  const cleanLines = [];
  let consecutiveEmpty = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (consecutiveEmpty < 1 && cleanLines.length > 0) {
        cleanLines.push('');
        consecutiveEmpty++;
      }
      continue;
    }
    consecutiveEmpty = 0;

    if (reasoningRegex.test(trimmed)) {
      const sentences = line.split(/(?<=[.?!])\s+/);
      const cleanSentences = sentences.filter(
        (s) => s.trim() && !reasoningRegex.test(s) && !/^(the|and|or|so|then|there's|let me know if you)$/i.test(s.trim())
      );
      if (cleanSentences.length > 0) {
        cleanLines.push(cleanSentences.join(' ').trim());
      }
    } else {
      cleanLines.push(line);
    }
  }

  let result = cleanLines.join('\n').trim();
  result = result.replace(/\s+(?:the|and|or|so|then|maybe|there's|let me know if you|let me know if|let me)\.?$/i, '').trim();
  return result || cleaned;
}

export async function sendChatMessage(message, history = [], conversationId = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_SECONDS * 1000);
  const url = `${AI_API_BASE}/api/ai/chat`;

  try {
    const headers = await getAuthHeaders();
    const payload = {
      conversationId: conversationId || undefined,
      conversation_id: conversationId || undefined,
      message,
      history,
      stream: false,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const serverErrMsg = errorData.error || errorData.detail || `Server error (${response.status})`;
      throw new Error(serverErrMsg);
    }

    const data = await response.json();
    const rawAnswer = data.answer || data.message || '';
    const cleanAnswer = cleanFinalAssistantAnswer(rawAnswer);

    return {
      answer: cleanAnswer,
      products: Array.isArray(data.products) ? data.products : [],
      requestId: data.requestId,
      conversationId: data.conversationId,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${TIMEOUT_SECONDS} seconds.`);
    }
    if (err instanceof TypeError && err.message?.includes('fetch')) {
      throw new Error("Sorry, I couldn't connect to DigiComp AI. Please try again.");
    }
    throw err;
  }
}

export async function sendChatMessageStream(
  message,
  history = [],
  onToken,
  onProducts,
  onStatus,
  conversationId
) {
  const res = await sendChatMessage(message, history, conversationId);

  if (res.answer) {
    onToken?.(res.answer);
  }
  if (res.products && res.products.length > 0) {
    onProducts?.(res.products);
  }

  return res;
}

export async function fetchConversations(searchQuery = '') {
  try {
    const headers = await getAuthHeaders();
    const queryParam = searchQuery && searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : '';
    const res = await fetch(`${AI_API_BASE}/api/ai/conversations${queryParam}`, {
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch conversations (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return [];
  }
}

export async function fetchConversationById(id) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${AI_API_BASE}/api/ai/conversations/${encodeURIComponent(id)}`, {
      headers,
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch conversation (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Error fetching conversation ${id}:`, err);
    return null;
  }
}

export async function createConversation(id = null, title = 'New Chat') {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${AI_API_BASE}/api/ai/conversations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, title }),
    });
    if (!res.ok) {
      throw new Error(`Failed to create conversation (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating conversation:', err);
    return null;
  }
}

export async function renameConversation(id, title) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${AI_API_BASE}/api/ai/conversations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ title }),
    });
    return res.ok;
  } catch (err) {
    console.error(`Error renaming conversation ${id}:`, err);
    return false;
  }
}

export async function deleteConversation(id) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${AI_API_BASE}/api/ai/conversations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch (err) {
    console.error(`Error deleting conversation ${id}:`, err);
    return false;
  }
}

export async function saveMessageToConversation(conversationId, message) {
  try {
    const headers = await getAuthHeaders();
    const product_ids = message.product_ids || (message.products ? message.products.map((p) => p.id) : undefined);
    const content = message.role === 'assistant' ? cleanFinalAssistantAnswer(message.content) : message.content;

    const res = await fetch(`${AI_API_BASE}/api/ai/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: message.id,
        role: message.role,
        content,
        product_ids,
        created_at: message.created_at,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to save message (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Error saving message to conversation ${conversationId}:`, err);
    return null;
  }
}
