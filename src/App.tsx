import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Wallet as WalletIcon,
  Headphones,
  ShieldAlert,
  Gamepad2,
  Home,
  LogOut,
  UserCheck,
  PlusCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Lock
} from 'lucide-react';
import { store } from './services/store';
import { audioManager } from './services/audioManager';
import { User, Wallet } from './types';

// Views & Components
import { LandingPage } from './components/landing/LandingPage';
import { GameView } from './components/game/GameView';
import { WalletView } from './components/wallet/WalletView';
import { SupportChat } from './components/support/SupportChat';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { DepositModal } from './components/wallet/DepositModal';
import { WithdrawalModal } from './components/wallet/WithdrawalModal';
import { AuthModal } from './components/auth/AuthModal';

export function App() {
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());
  const [wallet, setWallet] = useState<Wallet>(store.getWallet(currentUser.id));
  const [currentView, setCurrentView] = useState<'landing' | 'game' | 'wallet' | 'support' | 'admin' | 'admin-login'>('landing');

  // Modal States
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [autoRequestExpress, setAutoRequestExpress] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(audioManager.getConfig().muted);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      const u = store.getCurrentUser();
      setCurrentUser(u);
      setWallet(store.getWallet(u.id));
    });
    return () => unsub();
  }, []);

  // Hash Navigation Handler (supports bookmarking #admin-login, #admin, etc.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin-login') {
        setCurrentView('admin-login');
      } else if (hash === '#admin') {
        setCurrentView('admin');
      } else if (hash === '#game') {
        setCurrentView('game');
      } else if (hash === '#wallet') {
        setCurrentView('wallet');
      } else if (hash === '#support') {
        setCurrentView('support');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleStartGame = () => {
    setCurrentView('game');
  };

  const handleOpenSupportExpress = () => {
    setAutoRequestExpress(true);
    setCurrentView('support');
  };

  const toggleSound = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Bar (when not in landing page and not in dedicated admin login) */}
      {currentView !== 'landing' && currentView !== 'admin-login' && (
        <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setCurrentView('landing')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-cyan-400 transform -rotate-45" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-cyber font-black text-xl tracking-wider text-white">
                  SKY<span className="text-cyan-400">BIRD</span>
                </span>
                <span className="text-[8px] uppercase tracking-widest text-cyan-400/80 -mt-1 font-mono">
                  3D Crash Game
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                id="nav-tab-game"
                onClick={() => {
                  audioManager.playButtonClick();
                  setCurrentView('game');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  currentView === 'game'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Jogar</span>
              </button>

              <button
                id="nav-tab-wallet"
                onClick={() => {
                  audioManager.playButtonClick();
                  setCurrentView('wallet');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  currentView === 'wallet'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <WalletIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Carteira</span>
              </button>

              <button
                id="nav-tab-support"
                onClick={() => {
                  audioManager.playButtonClick();
                  setAutoRequestExpress(false);
                  setCurrentView('support');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  currentView === 'support'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span className="hidden sm:inline">Suporte</span>
              </button>

              {currentUser.role === 'admin' ? (
                <button
                  id="nav-tab-admin"
                  onClick={() => {
                    audioManager.playButtonClick();
                    setCurrentView('admin');
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                      : 'text-amber-400 hover:bg-amber-950/40 border border-amber-500/30'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Admin Console</span>
                </button>
              ) : (
                <button
                  id="nav-tab-admin-login"
                  onClick={() => {
                    audioManager.playButtonClick();
                    setCurrentView('admin-login');
                  }}
                  title="Acessar Página de Login Administrativo"
                  className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-300 hover:bg-amber-950/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
            </nav>

            {/* Right: Balance Pill & Profile/Logout */}
            <div className="flex items-center gap-3">
              {/* Balance & Deposit Button */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-inner">
                <div className="px-3 py-1 text-right">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                    Saldo USD
                  </span>
                  <span className="font-cyber font-black text-xs sm:text-sm text-emerald-400">
                    ${wallet.availableBalance.toFixed(2)}
                  </span>
                </div>
                <button
                  id="btn-header-deposit"
                  type="button"
                  onClick={() => {
                    audioManager.playButtonClick();
                    setIsDepositOpen(true);
                  }}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-xs flex items-center gap-1 transition shadow-md shadow-cyan-500/30 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">DEPOSITAR</span>
                </button>
              </div>

              {/* Profile / Admin Status Badge */}
              {currentUser.role === 'admin' ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1.5 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline">ADMIN ATIVO</span>
                  </span>
                  <button
                    id="btn-header-logout-admin"
                    type="button"
                    onClick={() => {
                      audioManager.playButtonClick();
                      store.logoutAdmin();
                      setCurrentView('admin-login');
                    }}
                    title="Desconectar do perfil de Administrador"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playButtonClick();
                    setCurrentView('admin-login');
                  }}
                  title="Ir para o Login de Administrador"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-[11px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline uppercase">{currentUser.role}</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* View Content Renderer */}
      <main className={`flex-1 w-full flex flex-col ${currentView === 'admin-login' || currentView === 'landing' ? 'p-0' : 'p-3 sm:p-6'}`}>
        {currentView === 'landing' && (
          <LandingPage
            onStartGame={handleStartGame}
            onOpenAuth={handleOpenAuth}
            onOpenSupport={() => setCurrentView('support')}
            onOpenAdminLogin={() => setCurrentView('admin-login')}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={() => setCurrentView('admin')}
            onBackToApp={() => setCurrentView('game')}
          />
        )}

        {currentView === 'game' && (
          <GameView
            currentUser={currentUser}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenSupport={() => setCurrentView('support')}
          />
        )}

        {currentView === 'wallet' && (
          <WalletView
            currentUser={currentUser}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenSupportExpress={handleOpenSupportExpress}
          />
        )}

        {currentView === 'support' && (
          <SupportChat
            currentUser={currentUser}
            autoRequestExpress={autoRequestExpress}
          />
        )}

        {currentView === 'admin' && (
          currentUser.role === 'admin' ? (
            <AdminDashboard
              currentUser={currentUser}
              onExitAdmin={() => setCurrentView('game')}
              onLogoutAdmin={() => {
                store.logoutAdmin();
                setCurrentView('admin-login');
              }}
            />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => setCurrentView('admin')}
              onBackToApp={() => setCurrentView('game')}
            />
          )
        )}
      </main>

      {/* Global Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onOpenSupportExpress={handleOpenSupportExpress}
      />

      <WithdrawalModal
        isOpen={isWithdrawOpen}
        availableBalance={wallet.availableBalance}
        onClose={() => setIsWithdrawOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setCurrentView('game')}
        onOpenAdminLogin={() => {
          setIsAuthOpen(false);
          setCurrentView('admin-login');
        }}
      />
    </div>
  );
}

export default App;

