import React, { useState, useEffect } from 'react';
import {
  Rocket,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Wallet,
  Headphones,
  CheckCircle,
  Star,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { store } from '../../services/store';
import { audioManager } from '../../services/audioManager';

interface LandingPageProps {
  onStartGame: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenSupport: () => void;
  onOpenAdminLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
  onOpenAuth,
  onOpenSupport,
  onOpenAdminLogin
}) => {
  // Simulator State
  const [simBet, setSimBet] = useState<number>(25);
  const [simMultiplier, setSimMultiplier] = useState<number>(3.2);

  // Animated Demo Multiplier Counter
  const [demoMult, setDemoMult] = useState<number>(1.00);

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoMult((prev) => {
        if (prev >= 5.8) return 1.00;
        return parseFloat((prev + 0.12).toFixed(2));
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const testimonials = store.getTestimonials();
  const simReturn = (simBet * simMultiplier).toFixed(2);

  return (
    <div className="w-full min-h-screen bg-[#05070D] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Glass Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onStartGame}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Rocket className="w-5 h-5 text-cyan-400 transform -rotate-45" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-cyber font-black text-2xl tracking-wider text-white">
                SKY<span className="text-cyan-400">BIRD</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-cyan-400/80 -mt-1 font-mono">
                3D Crash Platform
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#hero" className="hover:text-cyan-400 transition">Jogar</a>
            <a href="#como-funciona" className="hover:text-cyan-400 transition">Como Funciona</a>
            <a href="#simulador" className="hover:text-cyan-400 transition">Simulador</a>
            <a href="#seguranca" className="hover:text-cyan-400 transition">Segurança</a>
            <button onClick={onOpenSupport} className="hover:text-cyan-400 transition cursor-pointer">
              Suporte
            </button>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <button
              id="btn-nav-login"
              onClick={() => {
                audioManager.playButtonClick();
                onOpenAuth('login');
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            >
              ENTRAR
            </button>
            <button
              id="btn-nav-register"
              onClick={() => {
                audioManager.playButtonClick();
                onOpenAuth('register');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
            >
              CRIAR CONTA
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-20 px-4 sm:px-6 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Background glow flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 to-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 flex flex-col gap-6 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold w-fit backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Experiência 3D Cinematográfica em Tempo Real</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-cyber font-black tracking-tight text-white leading-tight">
              VOE MAIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">ALTO.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Quanto mais alto o pássaro cibernético voar, maior será o multiplicador da sua aposta.
              Atravesse tempestades elétricas, escape de destroços e faça <strong>CASH OUT</strong> antes que a altitude atinja o limite.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="btn-hero-play"
                onClick={() => {
                  audioManager.playButtonClick();
                  onStartGame();
                }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-cyber font-black text-lg tracking-wider shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>JOGAR AGORA</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#como-funciona"
                className="px-6 py-4 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-semibold text-sm transition border border-white/10 hover:border-slate-600 flex items-center gap-2"
              >
                <span>COMO FUNCIONA</span>
              </a>
            </div>

            {/* Live demo multiplier ticker demonstration */}
            <div className="mt-4 p-4 rounded-2xl glass-panel border border-cyan-500/20 flex items-center justify-between max-w-lg">
              <div className="flex flex-col">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                  Demonstração Visual Simulada
                </span>
                <span className="text-xs text-slate-400">Multiplicador em ascensão contínua</span>
              </div>
              <div className="flex items-center gap-2 font-cyber font-bold text-3xl text-cyan-300 bg-slate-950/80 px-4 py-1.5 rounded-xl border border-cyan-500/40">
                <span>{demoMult.toFixed(2)}x</span>
                <TrendingUp className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Feature Box */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-cyan-500/30 via-blue-500/10 to-transparent shadow-2xl">
              <div className="w-full h-[420px] rounded-[22px] bg-slate-950 relative overflow-hidden flex flex-col justify-between p-6 border border-white/10">
                {/* Visual Sky Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0e2a47] via-[#09152b] to-[#05070d] pointer-events-none" />
                
                {/* Decorative 3D Bird Graphic */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    SIMULAÇÃO DE VOO 3D
                  </div>
                  <span className="text-xs font-mono text-slate-400">Mach 4.2</span>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                  <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-2xl shadow-cyan-500/20">
                    <Rocket className="w-12 h-12 text-cyan-400 transform -rotate-45" />
                  </div>
                  <span className="text-4xl font-cyber font-black text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                    {demoMult.toFixed(2)}x
                  </span>
                  <span className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
                    Altitude: {Math.floor(demoMult * 2400)} m
                  </span>
                </div>

                {/* Bottom preview bar */}
                <div className="relative z-10 w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Aposta Exemplo: $25.00</span>
                  <span className="font-cyber font-bold text-emerald-400 text-sm">
                    Retorno: ${(25 * demoMult).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 border-y border-white/5 bg-[#080c18]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500">
              Estatísticas da Rede (Dados demonstrativos)
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
              DEMO
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Jogadores Online</span>
              <span className="text-2xl sm:text-3xl font-cyber font-bold text-white">1,482</span>
              <span className="text-[11px] text-emerald-400 block mt-1">● 98.4% Atividade</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Rodadas Realizadas</span>
              <span className="text-2xl sm:text-3xl font-cyber font-bold text-cyan-400">194,280</span>
              <span className="text-[11px] text-slate-400 block mt-1">100% Provably Fair</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Volume Processado</span>
              <span className="text-2xl sm:text-3xl font-cyber font-bold text-emerald-400">$4.82M USD</span>
              <span className="text-[11px] text-slate-400 block mt-1">Transações Instantâneas</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Maior Multiplicador</span>
              <span className="text-2xl sm:text-3xl font-cyber font-bold text-fuchsia-400">984.50x</span>
              <span className="text-[11px] text-slate-400 block mt-1">Recorde Histórico</span>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULADOR DE VOO */}
      <section id="simulador" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>CALCULE O RETORNO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-cyber font-bold text-white">
            SIMULE O SEU VOO
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Escolha o valor da aposta e o multiplicador para ver o retorno potencial de uma rodada com cash out executado.
          </p>
        </div>

        <div className="max-w-3xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          {/* Bet Selector */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Valor da Aposta (USD)
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[5, 10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSimBet(amt)}
                  className={`py-2 rounded-xl font-mono text-sm font-bold transition cursor-pointer ${
                    simBet === amt
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Multiplier Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Multiplicador Alvo
              </label>
              <span className="font-cyber font-bold text-cyan-300 text-lg">
                {simMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="1.10"
              max="50.00"
              step="0.10"
              value={simMultiplier}
              onChange={(e) => setSimMultiplier(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
              <span>1.10x</span>
              <span>10.00x</span>
              <span>25.00x</span>
              <span>50.00x</span>
            </div>
          </div>

          {/* Potential Return Result Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-emerald-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">
                Retorno Potencial Bruto
              </span>
              <span className="text-3xl sm:text-4xl font-cyber font-black text-emerald-400">
                ${simReturn} USD
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Lucro Líquido: +${(Number(simReturn) - simBet).toFixed(2)} USD
              </span>
            </div>

            <button
              onClick={() => {
                audioManager.playButtonClick();
                onStartGame();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-sm tracking-wider transition shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              TESTAR NO JOGO REAL
            </button>
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-4 italic">
            * Simulação ilustrativa. Resultados reais dependem do resultado de cada rodada determinado pelo algoritmo Provably Fair.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <span>PASSO A PASSO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-cyber font-bold text-white">
            COMO FUNCIONA O SKYBIRD
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Três passos simples para iniciar a sua jornada de voo espacial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card-interactive rounded-2xl p-6 relative">
            <span className="text-5xl font-cyber font-black text-cyan-500/20 absolute top-4 right-4">
              01
            </span>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-cyber font-bold text-white mb-2">DEPOSITE</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Escolha o valor da sua carteira em USD via métodos seguros como Airtm ou solicite seu link Express com o suporte.
            </p>
          </div>

          <div className="glass-card-interactive rounded-2xl p-6 relative">
            <span className="text-5xl font-cyber font-black text-cyan-500/20 absolute top-4 right-4">
              02
            </span>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-cyber font-bold text-white mb-2">VOE</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Acompanhe o multiplicador crescer em tempo real enquanto o pássaro sobe do céu até a imensidão do espaço sideral.
            </p>
          </div>

          <div className="glass-card-interactive rounded-2xl p-6 relative">
            <span className="text-5xl font-cyber font-black text-cyan-500/20 absolute top-4 right-4">
              03
            </span>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-cyber font-bold text-white mb-2">CASH OUT</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Faça cash out manual ou configure o Auto Cash Out antes do fim da rodada para garantir os seus ganhos multiplicados.
            </p>
          </div>
        </div>
      </section>

      {/* SEGURANÇA & PROVABLY FAIR */}
      <section id="seguranca" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transparência Inviolável</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-cyber font-bold text-white">
              SISTEMA CRIPTOGRÁFICO PROVABLY FAIR
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              No SKYBIRD, nenhum resultado é manipulado. O crash point de cada rodada é determinado através de funções criptográficas com <strong>Server Seed</strong>, <strong>Client Seed</strong> e <strong>Nonce</strong> antes da decolagem.
            </p>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hash SHA-256 publicado publicamente antes do voo.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Validador matemático integrado em cada histórico de rodada.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sem intervenção manual ou alteração de probabilidades.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-cyan-500/30 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-cyan-400 font-bold">EXEMPLO DE AUDITORIA SHA-256</span>
              <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded text-cyan-300">Válido</span>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block mb-0.5">Server Seed Hash (Público):</span>
                <p className="text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                  7394ab130f14ba67e812903fead3943bc204910398
                </p>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Fórmula de Crash:</span>
                <p className="text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800">
                  crash_point = (100 * 2^52 - h) / (2^52 - h) * 0.97
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-cyber font-bold text-white">
            O QUE DIZEM NOSSOS PILOTOS
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Depoimentos moderados de usuários que utilizam a plataforma SKYBIRD.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-3 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 italic mb-4 leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-cyan-500/40" />
                  <div>
                    <span className="text-xs font-bold text-white block">{t.name}</span>
                    <span className="text-[11px] text-cyan-400 block">{t.role}</span>
                  </div>
                </div>
                {t.multiplierWon && (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                    {t.multiplierWon}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/10 bg-[#03050a] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              <Rocket className="w-4 h-4 transform -rotate-45" />
            </div>
            <span className="font-cyber font-black text-xl text-white">
              SKY<span className="text-cyan-400">BIRD</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400">
            <span>Métodos: Airtm & Express</span>
            <span>•</span>
            <button onClick={onOpenSupport} className="hover:text-cyan-400 transition cursor-pointer">
              Atendimento 24/7
            </button>
            <span>•</span>
            <span>Jogo Responsável (+18)</span>
            {onOpenAdminLogin && (
              <>
                <span>•</span>
                <button
                  id="btn-footer-admin-portal"
                  onClick={() => {
                    audioManager.playButtonClick();
                    onOpenAdminLogin();
                  }}
                  className="text-amber-400/90 hover:text-amber-300 font-semibold flex items-center gap-1 transition cursor-pointer hover:underline"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Portal Admin</span>
                </button>
              </>
            )}
          </div>

          <span className="text-xs text-slate-500">
            © 2026 SKYBIRD Platform. Todos os direitos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
};
