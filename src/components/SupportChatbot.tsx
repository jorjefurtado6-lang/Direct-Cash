import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { askSupportBot, ChatMessage } from '../lib/geminiSupport';
import { Bot, Send, X, Sparkles, MessageCircle, Lock, RefreshCw, ShieldCheck, UserCheck, HelpCircle, ChevronDown, Copy, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SUPPORT_WHATSAPP_NUMBER, SUPPORT_WHATSAPP_DISPLAY } from '../utils/constants';

interface SupportChatbotProps {
  user: User;
  isOpenDefault?: boolean;
  onClose?: () => void;
  isWidgetMode?: boolean;
}

export default function SupportChatbot({ user, isOpenDefault = false, onClose, isWidgetMode = true }: SupportChatbotProps) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: `Olá, **${user.name || 'Membro'}**! 👋\n\nSou a **DirectAI**, sua assistente inteligente exclusiva para **Membros Ativos** do Direct Cash.\n\nComo posso te ajudar hoje com suas doações, rede ou comprovantes PIX?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isActiveMember = Boolean(user.isActive);

  const quickQuestions = [
    "Como funciona a doação de R$ 50?",
    "Como confirmar um PIX recebido?",
    "Como usar o Kit WhatsApp?",
    "Quais são os 5 níveis de ganhos?",
    "Direct Cash é seguro?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isTyping) return;

    if (!textToSend) {
      setInput('');
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessages: ChatMessage[] = [
      ...messages,
      { sender: 'user', text: queryText, time: timeStr }
    ];

    setMessages(newMessages);
    setIsTyping(true);

    try {
      const botResponse = await askSupportBot(queryText, newMessages);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Desculpe, ocorreu um pequeno ruído na conexão. Se precisar de atendimento emergencial, entre em contato via WhatsApp suporte abaixo.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: `Conversa reiniciada!\n\nOlá, **${user.name}**! Como posso te ajudar agora?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // WhatsApp Support redirect link
  const openHumanSupport = () => {
    const msg = encodeURIComponent(`Olá Suporte Direct Cash! Sou o membro ativo ${user.name} (${user.pixKey}) e preciso de auxílio com minha conta.`);
    window.open(`https://api.whatsapp.com/send?phone=${SUPPORT_WHATSAPP_NUMBER}&text=${msg}`, '_blank');
  };

  if (isWidgetMode && !isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-r from-[#32BCAD] to-emerald-500 hover:from-[#269689] hover:to-emerald-600 text-slate-950 p-3.5 sm:p-4 rounded-full shadow-[0_0_25px_rgba(50,188,173,0.4)] flex items-center gap-3 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot size={24} className="text-slate-950" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full border-2 border-slate-900 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full border-2 border-slate-900"></span>
          </div>

          <span className="font-extrabold text-xs tracking-tight hidden sm:inline-block pr-1">
            Suporte VIP IA
          </span>

          {/* Active Member Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-xl border border-slate-700 whitespace-nowrap shadow-xl">
            {isActiveMember ? '✨ Suporte DirectAI Ativo' : '🔒 Exclusivo para Membros Ativos'}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={isWidgetMode ? "fixed bottom-6 right-6 z-50 w-full max-w-md px-4 sm:px-0" : "w-full max-w-2xl mx-auto"}>
      <div className="bg-slate-900/95 border border-[#32BCAD]/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden flex flex-col h-[560px] relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#32BCAD]/15 border border-[#32BCAD]/40 flex items-center justify-center text-[#32BCAD] shadow-[0_0_15px_rgba(50,188,173,0.2)]">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm tracking-tight">DirectAI Suporte</h3>
                {isActiveMember ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                    <UserCheck size={10} />
                    Membro Ativo
                  </span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock size={10} />
                    Bloqueado
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px]">Assistente de inteligência artificial 24/7</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              title="Reiniciar Conversa"
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
            {isWidgetMode && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Locked Banner for Non-Active Members */}
        {!isActiveMember ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-950/80 relative">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
              <Lock size={32} />
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight mb-2">Suporte Exclusivo para Membros Ativos</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mb-6">
              Para liberar o acesso ao **Suporte VIP com Inteligência Artificial** e atendimento direto, realize a ativação de Nível 1 enviando a doação de R$ 50 para seu patrocinador.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full text-left space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                <ShieldCheck size={16} className="text-[#32BCAD]" />
                Benefícios do Membro Ativo:
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>Assistente DirectAI 24h sem limites</li>
                <li>Atendimento prioritário via WhatsApp</li>
                <li>Liberado para receber doações na sua chave PIX</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Active Member Chat Content */
          <>
            {/* Messages Scroll Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed relative group ${
                      msg.sender === 'user'
                        ? 'bg-[#32BCAD] text-slate-950 font-medium rounded-tr-none shadow-[0_4px_15px_rgba(50,188,173,0.2)]'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md'
                    }`}
                  >
                    {/* Formatted Text rendering */}
                    <div className="whitespace-pre-line font-sans">
                      {msg.text.split('\n').map((line, lIdx) => {
                        // Very simple markdown bold parser
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={lIdx} className="mb-0.5">
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} className="font-extrabold">{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Copy button on bot response */}
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => handleCopyMessage(msg.text, idx)}
                        title="Copiar mensagem"
                        className="absolute top-2 right-2 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-900/60 rounded cursor-pointer"
                      >
                        {copiedIndex === idx ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">
                    {msg.time}
                  </span>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none w-fit">
                  <Sparkles size={14} className="text-[#32BCAD] animate-spin" />
                  <span>DirectAI está digitando...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Chips */}
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest shrink-0">Sugestões:</span>
              {quickQuestions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleSend(q)}
                  disabled={isTyping}
                  className="shrink-0 bg-slate-800 hover:bg-[#32BCAD]/10 hover:text-[#32BCAD] hover:border-[#32BCAD]/40 text-slate-300 border border-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua dúvida sobre o Direct Cash..."
                  disabled={isTyping}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#32BCAD] transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-[#32BCAD] hover:bg-[#269689] disabled:opacity-40 text-slate-950 font-bold p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>

              {/* Human Support Escalation */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1">
                <span>Dúvida não resolvida?</span>
                <button
                  type="button"
                  onClick={openHumanSupport}
                  className="text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle size={12} />
                  Falar com Atendente no WhatsApp
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
