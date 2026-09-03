/**
 * Greeting Engine for DigiComp AI
 */

export function getCleanUserName(name) {
  if (!name || typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (
    lower === 'undefined' ||
    lower === 'null' ||
    lower === 'user' ||
    lower === 'anonymous' ||
    lower.includes('@')
  ) {
    return null;
  }

  return trimmed;
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

export function generateWelcomeMessage(options = {}) {
  const { userName, isReturningUser = false, productParam, date = new Date() } = options;

  if (productParam && productParam.trim()) {
    return `Tell me what you'd like to know about the ${productParam.trim()}.`;
  }

  const cleanName = getCleanUserName(userName);

  if (!cleanName) {
    if (isReturningUser) {
      return `Welcome back to DigiComp AI! 👋\nWhat would you like to work on today?`;
    }
    return `Welcome to DigiComp AI! 👋\nWhat would you like to learn, build, or find today?`;
  }

  if (isReturningUser) {
    return `Welcome back, ${cleanName}! 👋\nWhat would you like to work on today?`;
  }

  const timeGreeting = getTimeGreeting(date);
  return `${timeGreeting}, ${cleanName}! 👋\nWelcome to DigiComp AI. What would you like to learn, build, or find today?`;
}
