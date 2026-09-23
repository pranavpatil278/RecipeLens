import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, MessageSquare } from 'lucide-react';
import { AssistantMessage, Recipe } from '../types';
import { apiClient } from '../services/apiClient';

interface RecipeAssistantProps {
  recipe: Recipe;
  currentStep?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeAssistant: React.FC<RecipeAssistantProps> = ({
  recipe,
  currentStep,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'init_msg',
      sender: 'assistant',
      text: `Hello Chef! I'm your RecipeLens AI guide for "${recipe.title}". I'm aware of all ${recipe.ingredients.length} ingredients and steps. What can I clarify for you?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    'Can I replace this ingredient?',
    'How do I know when this step is done?',
    'Can I make this less spicy?',
    'Why is this step necessary?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    const userMsg: AssistantMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await apiClient.askAssistant(recipe.recipeId, trimmed, currentStep);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'Apologies, I hit a brief communication hiccup. Try repeating your question.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="RecipeLens AI Chef Assistant"
      className="fixed inset-0 z-50 bg-[#263A20]/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF7F0] border border-[#263A20]/20 rounded-t-3xl sm:rounded-3xl w-full max-w-lg h-[85vh] sm:h-[620px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#263A20]/10 flex items-center justify-between bg-[#EDE5DA]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#263A20] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#A3B89D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#263A20]">
                  RecipeLens Assistant
                </h3>
                {currentStep && (
                  <span className="text-[10px] bg-[#263A20]/10 text-[#263A20] font-semibold px-2 py-0.5 rounded-full">
                    Step {currentStep} Focus
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#263A20]/65 truncate max-w-[220px] sm:max-w-xs">
                Context: {recipe.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Assistant"
            className="w-8 h-8 rounded-full border border-[#263A20]/20 flex items-center justify-center text-[#263A20] hover:bg-[#263A20]/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-[#263A20] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-[#263A20] text-white rounded-br-xs'
                      : 'bg-[#EDE5DA] text-[#263A20] border border-[#263A20]/10 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      isMe ? 'text-white/60 text-right' : 'text-[#263A20]/50'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isMe && (
                  <div className="w-7 h-7 rounded-full bg-[#FAF7F0] border border-[#263A20]/20 text-[#263A20] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2.5 items-center text-xs text-[#263A20]/60">
              <div className="w-7 h-7 rounded-full bg-[#263A20] text-white flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-[#EDE5DA] px-3.5 py-2.5 rounded-2xl border border-[#263A20]/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#263A20]/60 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#263A20]/60 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#263A20]/60 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-3 border-t border-[#263A20]/10 bg-[#FAF7F0] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              className="text-[11px] bg-[#EDE5DA]/80 hover:bg-[#EDE5DA] text-[#263A20] border border-[#263A20]/15 px-3 py-1.5 rounded-full shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="w-3 h-3 text-[#263A20]/60" />
              {q}
            </button>
          ))}
        </div>

        {/* Input Composer */}
        <div className="p-3.5 bg-[#FAF7F0] border-t border-[#263A20]/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about pan temp, texture, timing..."
              className="flex-1 bg-[#FAF7F0] border border-[#263A20]/25 rounded-full px-4 py-2.5 text-xs text-[#263A20] placeholder:text-[#263A20]/45 focus:outline-hidden focus:border-[#263A20]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-[#263A20] hover:bg-[#1C2C17] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
