import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ShieldAlert, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { store } from '../../services/store';
import { audioManager } from '../../services/audioManager';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
  onOpenAdminLogin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onSuccess,
  onOpenAdminLogin
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (tab === 'register') {
      if (!name.trim()) return setErrorMsg('Por favor informe seu nome.');
      if (!email.includes('@')) return setErrorMsg('Email inválido.');
      if (password.length < 6) return setErrorMsg('A senha deve possuir pelo menos 6 caracteres.');
      if (password !== confirmPassword) return setErrorMsg('As senhas não coincidem.');
      if (!acceptedTerms) return setErrorMsg('Você deve aceitar os Termos de Serviço.');

      // Create new player user in store
      const newUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        role: 'player' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      store.setCurrentUser(newUser);
      audioManager.playNotification();
      onSuccess();
      onClose();
    } else if (tab === 'login') {
      if (!email || !password) return setErrorMsg('Preencha email e senha.');
      
      // If email has admin keyword, notify user to use dedicated admin page
      if (email.toLowerCase().includes('admin')) {
        setErrorMsg('Contas administrativas devem efetuar login exclusivamente na Página de Login Admin.');
        return;
      }

      // Player login
      store.switchRole('player');
      audioManager.playNotification();
      onSuccess();
      onClose();
    } else {
      setErrorMsg('');
      alert('Instruções de recuperação de senha enviadas para ' + email);
      setTab('login');
    }
  };

  const handleQuickDemoPlayer = () => {
    store.switchRole('player');
    audioManager.playNotification();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 relative">
        {/* Close */}
        <button
          id="btn-close-auth"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-cyber font-bold tracking-wider transition cursor-pointer ${
              tab === 'login' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            ENTRAR
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-cyber font-bold tracking-wider transition cursor-pointer ${
              tab === 'register' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            CRIAR CONTA
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {tab === 'register' && (
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Nome Completo</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-cyan-500">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-white outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Email do Jogador</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-cyan-500">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Senha</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-cyan-400 hover:underline text-[11px]"
                  >
                    Esqueci a senha
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-cyan-500">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white outline-none"
                />
              </div>
            </div>
          )}

          {tab === 'register' && (
            <>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Confirmar Senha</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-cyan-500">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-white outline-none"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-slate-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500"
                />
                <span className="text-[11px] leading-tight">
                  Li e aceito os <strong>Termos de Serviço</strong> e a <strong>Política de Privacidade</strong> (+18 anos).
                </span>
              </label>
            </>
          )}

          <button
            id="btn-auth-submit"
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-cyber font-bold text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/30 transition cursor-pointer mt-2"
          >
            {tab === 'login' ? 'ENTRAR NA CONTA' : tab === 'register' ? 'CRIAR MINHA CONTA' : 'RECUPERAR SENHA'}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={handleQuickDemoPlayer}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition border border-cyan-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Acesso Rápido com Jogador Demo</span>
          </button>

          {onOpenAdminLogin && (
            <div className="text-center pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1.5 mx-auto font-medium transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Acesso Administrativo? Ir para a Página de Login Admin →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
