// Centralized Language-Aware Voice Assistant (TTS & STT)

export const BCP47_MAP = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',

  // Name based fallbacks
  English: 'en-IN',
  Telugu: 'te-IN',
  Hindi: 'hi-IN',
  Tamil: 'ta-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Marathi: 'mr-IN',
  Bengali: 'bn-IN',
  Gujarati: 'gu-IN',
  Punjabi: 'pa-IN',
  Odia: 'or-IN'
};

/**
 * Get BCP-47 language tag for a language code or name
 */
export function getBcp47(langKey) {
  if (!langKey) return 'en-IN';
  return BCP47_MAP[langKey] || BCP47_MAP[langKey.toLowerCase()] || 'en-IN';
}

/**
 * Perform Text-To-Speech using SpeechSynthesis with exact/regional voice matching
 */
export function speak(text, langKey, onEnd) {
  if (!('speechSynthesis' in window) || !text) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const targetLang = getBcp47(langKey);
  const langPrefix = targetLang.split('-')[0].toLowerCase();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLang;
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  
  // 1. Try exact match (e.g. te-IN or te_IN)
  let selectedVoice = voices.find(v => 
    v.lang.replace('_', '-').toLowerCase() === targetLang.toLowerCase()
  );

  // 2. Try language prefix match (e.g. any 'te' voice)
  if (!selectedVoice) {
    selectedVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith(langPrefix)
    );
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Create a Web Speech Recognition instance tuned for selected language
 */
export function createSpeechRecognizer(langKey, onResult, onError, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  const targetLang = getBcp47(langKey);
  
  recognition.lang = targetLang;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) onResult(transcript.trim());
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  if (onEnd) {
    recognition.onend = onEnd;
  }

  return recognition;
}
