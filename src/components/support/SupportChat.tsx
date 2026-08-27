import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Headphones,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { store } from '../../services/store';
import { audioManager } from '../../services/audioManager';
import { User, SupportMessage, AdminSettings } from '../../types';

interface SupportChatProps {
  currentUser: User;
  onClose?: () => void;
  autoRequestExpress?: boolean;
}

export const SupportChat: React.FC<SupportChatProps> = ({
  currentUser,
  autoRequestExpress = false
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>(store.getSupportMessages(currentUser.id));
  const [inputText, setInputText] = useState('');
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(store.getAdminSettings());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setMessages(store.getSupportMessages(currentUser.id));
      setAdminSettings(store.getAdminSettings());
    });
    return () => unsub();
  }, [currentUser.id]);

  useEffect(() => {
    if (autoRequestExpress) {
      handleRequestExpressLink();
    }
  }, [autoRequestExpress]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    store.sendSupportMessage(inputText.trim(), false);
    setInputText('');
    audioManager.playButtonClick();
  };

  const handleRequestExpressLink = () => {
    store.sendSupportMessage('Solicito a geração de um link Express para depósito.', true);
    audioManager.playButtonClick();
  };

  const getStatusBadge = () => {
    switch (adminSettings.supportStatus) {
      case 'online':
        return {
          label: 'Suporte Online',
          color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
          dot: 'bg-emerald-400'
        };
      case 'busy':
        return {
          label: 'Suporte Ocupado',
          color: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
          dot: 'bg-amber-400'
        };
      case 'offline':
        return {
          label: 'Suporte Offline',
          color: 'text-slate-400 bg-slate-900 border-slate-700',
          dot: 'bg-slate-500'
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="w-full max-w-4xl mx-auto h-[620px] glass-panel rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cyber font-bold text-white text-base flex items-center gap-2">
              SUPORTE SKYBIRD 24/7
            </h3>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.color} mt-0.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
              <span>{status.label}</span>
            </div>
          </div>
        </div>

        {/* Express Quick Link Trigger */}
        <button
          id="btn-chat-request-express"
          type="button"
          onClick={handleRequestExpressLink}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Solicitar Link Express</span>
          <span className="sm:hidden">Link Express</span>
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isAdmin = msg.senderRole === 'admin';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  {msg.senderName}
                </span>
                {isAdmin && (
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                    OFICIAL
                  </span>
                )}
                <span className="text-[10px] text-slate-500">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div
                className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-lg shadow-cyan-950/50'
                    : isAdmin
                    ? 'bg-slate-900 border border-cyan-500/30 text-slate-200 rounded-tl-none shadow-lg'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>

                {msg.isExpressLinkRequest && (
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-950/70 border border-cyan-500/40 text-[11px] text-cyan-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Solicitação de Link Express Registrada</span>
                  </div>
                )}

                {msg.expressLink && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-emerald-500/50 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Link Express Oficial Gerado</span>
                    </div>
                    <p className="text-[11px] text-slate-300 break-all font-mono bg-slate-900 p-2 rounded border border-slate-800">
                      {msg.expressLink}
                    </p>
                    <a
                      href={msg.expressLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-lg transition"
                    >
                      <span>ABRIR PAGAMENTO EXPRESS</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center gap-3">
        <input
          type="text"
          placeholder="Digite sua mensagem para o suporte..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500 transition"
        />
        <button
          id="btn-send-support-msg"
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
