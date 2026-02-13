import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Language } from '../types';
import { generateAgriAdvice } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { Mic, Send, Volume2, User, Bot, Sparkles } from 'lucide-react';

interface Props {
  language: Language;
}

const VoiceChat: React.FC<Props> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'model',
      text: TRANSLATIONS[language].welcome + "! " + TRANSLATIONS[language].assistant,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    const langMap = {
      [Language.ENGLISH]: 'en-IN',
      [Language.HINDI]: 'hi-IN',
      [Language.MARATHI]: 'mr-IN',
      [Language.TELUGU]: 'te-IN',
      [Language.TAMIL]: 'ta-IN',
      [Language.GUJARATI]: 'gu-IN',
      [Language.BANGLA]: 'bn-IN',
      [Language.URDU]: 'ur-IN',
    };
    
    recognition.lang = langMap[language];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\*\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'en' ? 'en-IN' : language + '-IN'; 
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await generateAgriAdvice(textToSend, language);
    
    const newBotMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newBotMsg]);
    setIsLoading(false);
    
    if (textOverride) {
      speakText(responseText);
    }
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-agri-950 dark:text-agri-100 underline decoration-agri-200 dark:decoration-agri-600 decoration-2 underline-offset-2">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-agri-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-agri-800 transition-colors">
      {/* Header */}
      <div className="bg-agri-600 dark:bg-agri-700 px-6 py-5 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight">Kisan Mitra AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-agri-100">AI Scientist Active</span>
            </div>
          </div>
        </div>
        <div className="bg-white/10 p-2 rounded-xl border border-white/20">
          <Sparkles size={18} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-agri-950/30 scroll-smooth no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
              <div
                className={`px-5 py-4 rounded-3xl shadow-sm relative group transition-all duration-300 ${
                  msg.role === 'user'
                    ? 'bg-agri-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-agri-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-agri-700'
                }`}
              >
                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {renderMessageText(msg.text)}
                </div>
                
                {msg.role === 'model' && (
                  <button 
                    onClick={() => speakText(msg.text)}
                    className="absolute -right-10 bottom-0 p-2 text-gray-400 dark:text-gray-500 hover:text-agri-600 dark:hover:text-agri-400 hover:bg-agri-50 dark:hover:bg-agri-800 rounded-full transition-all"
                    title="Listen to Advice"
                  >
                    <Volume2 size={20} />
                  </button>
                )}
              </div>
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter mt-1 px-1">
                {msg.role === 'user' ? 'You' : 'Mitra'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white dark:bg-agri-800 px-5 py-4 rounded-3xl rounded-tl-none border border-gray-100 dark:border-agri-700 shadow-sm flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-agri-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-agri-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-agri-600 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-agri-900 border-t border-gray-100 dark:border-agri-800 transition-colors">
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-agri-800 p-2 rounded-[2rem] border border-gray-200 dark:border-agri-700 transition-colors">
          <button
            onClick={startListening}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 ring-4 ring-red-100 text-white animate-pulse' 
                : 'bg-white dark:bg-agri-700 text-agri-600 dark:text-agri-400 hover:text-agri-700 shadow-sm border border-gray-100 dark:border-agri-600'
            }`}
          >
            <Mic size={24} strokeWidth={2.5} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? t.listening : "Ask about crops, pests, or market prices..."}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 dark:text-white font-medium placeholder:text-gray-400 py-2"
          />
          
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() && !isLoading}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
              input.trim() 
                ? 'bg-agri-600 dark:bg-agri-500 text-white hover:bg-agri-700 dark:hover:bg-agri-600 hover:shadow-lg' 
                : 'bg-gray-200 dark:bg-agri-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;