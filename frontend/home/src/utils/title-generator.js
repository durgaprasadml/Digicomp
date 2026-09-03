/**
 * Utility to generate a short, clean, human-friendly conversation title
 * from the user's first message.
 */
export function generateConversationTitle(message) {
  if (!message || !message.trim()) {
    return 'New Chat';
  }

  let clean = message
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
    .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/gi, '')
    .replace(/<analysis>[\s\S]*?(?:<\/analysis>|$)/gi, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[^\w\s₹$€£%+\-./]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lower = clean.toLowerCase();

  // 1. Check for specific price queries
  const priceMatch = clean.match(/(?:under|below|less than|<)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (priceMatch) {
    const price = priceMatch[1];
    if (lower.includes('esp32')) return `ESP32 Under ₹${price}`;
    if (lower.includes('arduino uno')) return `Arduino Uno Under ₹${price}`;
    if (lower.includes('arduino')) return `Arduino Under ₹${price}`;
    if (lower.includes('motor driver')) return `Motor Driver Under ₹${price}`;
    if (lower.includes('sensor')) return `Sensor Under ₹${price}`;
    if (lower.includes('chassis')) return `Robot Chassis Under ₹${price}`;
  }

  // 2. Check for "What is / Explain / Tell me about [component]?"
  const basicsMatch = clean.match(/(?:what\s+is\s+(?:an?|the)?|explain\s+(?:an?|the)?|tell\s+me\s+about\s+(?:an?|the)?|how\s+does\s+(?:an?|the)?)\s*([a-zA-Z0-9\s-]+?)(?:\?|$|\.|,)/i);
  if (basicsMatch) {
    const subject = basicsMatch[1].trim();
    if (subject.length > 0 && subject.length <= 25) {
      const subjectTitle = toTitleCase(subject);
      const cleanedSubject = subjectTitle.replace(/\s+(Work|Works|Function|Functions|Used for)$/i, '').trim();
      if (cleanedSubject.toLowerCase().includes('basics')) {
        return truncateTitle(cleanedSubject, 36);
      }
      return truncateTitle(`${cleanedSubject} Basics`, 36);
    }
  }

  // 3. Known project keywords
  if (lower.includes('obstacle') && (lower.includes('robot') || lower.includes('avoiding'))) {
    return 'Obstacle Avoiding Robot';
  }
  if (lower.includes('3d printer')) {
    return '3D Printer Project';
  }
  if (lower.includes('smart irrigation') || (lower.includes('irrigation') && lower.includes('system'))) {
    return 'Smart Irrigation System';
  }
  if (lower.includes('irrigation') || lower.includes('plant watering')) {
    return 'Smart Irrigation Project';
  }
  if (lower.includes('weather station')) {
    return 'Weather Station Project';
  }
  if (lower.includes('line follower')) {
    return 'Line Follower Robot';
  }
  if (lower.includes('home automation')) {
    return 'Home Automation Project';
  }

  // 4. Strip common conversational intent prefixes
  const prefixRegex = /^(i\s+want\s+to\s+build\s+(?:an?|the)?|i\s+want\s+to\s+make\s+(?:an?|the)?|i\s+need\s+(?:an?|the)?|can\s+you\s+help\s+me\s+(?:with|build|make)?|can\s+you\s+show\s+me|can\s+i\s+use|how\s+do\s+i\s+build|how\s+to\s+build|how\s+to\s+make|give\s+me\s+(?:a|the)?|show\s+me\s+(?:a|the)?|recommend\s+(?:a|the)?|what\s+do\s+i\s+need\s+for\s+(?:a|an|the)?|what\s+are\s+the\s+best)\s+/i;
  
  let candidate = clean.replace(prefixRegex, '').trim();
  if (!candidate || candidate.length < 3) {
    candidate = clean;
  }

  candidate = candidate.replace(/[?!.:;]+$/, '').trim();
  const formatted = toTitleCase(candidate);
  return truncateTitle(formatted, 38);
}

function toTitleCase(str) {
  const acronyms = new Set(['ESP32', 'ESP8266', 'OLED', 'LCD', 'I2C', 'SPI', 'UART', 'PWM', 'DC', 'CNC', '3D', 'L298N', 'A4988', 'HC-SR04', 'DHT22', 'SG90', 'NEMA17', 'LM2596', 'LDR', 'LED', 'USB', 'BLE', 'RF', 'IR', 'WiFi', 'AI', 'INR']);

  return str
    .split(' ')
    .map((word) => {
      const upper = word.toUpperCase();
      if (acronyms.has(upper)) return upper;
      if (word.length <= 1) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function truncateTitle(str, maxLength = 36) {
  if (str.length <= maxLength) return str;
  const cut = str.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 15) {
    return cut.slice(0, lastSpace) + '...';
  }
  return cut.trim() + '...';
}
