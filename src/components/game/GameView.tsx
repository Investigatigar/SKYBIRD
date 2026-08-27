import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { AltitudeStage, GameRound, GraphicQuality, User } from '../../types';
import { store } from '../../services/store';
import { audioManager } from '../../services/audioManager';
import { SkybirdCanvas } from './SkybirdCanvas';
import { MultiplierDisplay } from './MultiplierDisplay';
import { BettingPanel } from './BettingPanel';
import { RoundHistory } from './RoundHistory';
import { LiveBetsList } from './LiveBetsList';
import { FairnessModal } from './FairnessModal';
import { Volume2, VolumeX, HelpCircle, PlusCircle, ShieldCheck, Sparkles, X } from 'lucide-react';

interface GameViewProps {
  currentUser: User;
  onOpenDeposit: () => void;
  onOpenSupport: () => void;
}

export const GameView: React.FC<GameViewProps> = ({ currentUser, onOpenDeposit }) => {
  const [currentRound, setCurrentRound] = useState<GameRound>(store.getCurrentRound());
  const [wallet, setWallet] = useState(store.getWallet(currentUser.id));
  const [pastRounds, setPastRounds] = useState<GameRound[]>(store.getPastRounds());
  const [activeBets, setActiveBets] = useState(store.getActiveBets());
  const [currency, setCurrency] = useState<'USD' | 'EUR'>(store.getDisplayCurrency());

  // Game Engine State
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [countdown, setCountdown] = useState<number>(3);

  // Panel 1 State
  const [hasActiveBet1, setHasActiveBet1] = useState<boolean>(false);
  const [betAmount1, setBetAmount1] = useState<number>(0);
  const [autoBetEnabled1, setAutoBetEnabled1] = useState<boolean>(false);
  const [autoCashOutEnabled1, setAutoCashOutEnabled1] = useState<boolean>(false);
  const [autoCashOutMultiplier1, setAutoCashOutMultiplier1] = useState<number>(2.0);
  const [hasCashedOut1, setHasCashedOut1] = useState<boolean>(false);
  const [cashedOutMultiplier1, setCashedOutMultiplier1] = useState<number | null>(null);
  const [cashedOutPayout1, setCashedOutPayout1] = useState<number | null>(null);

  // Panel 2 State (Aviator Dual Betting)
  const [showSecondPanel, setShowSecondPanel] = useState<boolean>(false);
  const [hasActiveBet2, setHasActiveBet2] = useState<boolean>(false);
  const [betAmount2, setBetAmount2] = useState<number>(0);
  const [autoBetEnabled2, setAutoBetEnabled2] = useState<boolean>(false);
  const [autoCashOutEnabled2, setAutoCashOutEnabled2] = useState<boolean>(false);
  const [autoCashOutMultiplier2, setAutoCashOutMultiplier2] = useState<number>(2.0);
  const [hasCashedOut2, setHasCashedOut2] = useState<boolean>(false);
  const [cashedOutMultiplier2, setCashedOutMultiplier2] = useState<number | null>(null);
  const [cashedOutPayout2, setCashedOutPayout2] = useState<number | null>(null);

  // Settings & Modals
  const [quality, setQuality] = useState<GraphicQuality>('HIGH');
  const [isMuted, setIsMuted] = useState<boolean>(audioManager.getConfig().muted);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [selectedFairnessRound, setSelectedFairnessRound] = useState<GameRound | null>(null);

  const loopTimerRef = useRef<number | null>(null);
  const runStartRef = useRef<number>(0);
  const multiplierRef = useRef<number>(1.00);

  // High frequency atomic refs for Panel 1
  const hasActiveBet1Ref = useRef<boolean>(false);
  const hasCashedOut1Ref = useRef<boolean>(false);
  const autoBetEnabled1Ref = useRef<boolean>(false);
  const autoCashOutEnabled1Ref = useRef<boolean>(false);
  const autoCashOutMultiplier1Ref = useRef<number>(2.0);
  const lastBetAmount1Ref = useRef<number>(25);

  // High frequency atomic refs for Panel 2
  const hasActiveBet2Ref = useRef<boolean>(false);
  const hasCashedOut2Ref = useRef<boolean>(false);
  const autoBetEnabled2Ref = useRef<boolean>(false);
  const autoCashOutEnabled2Ref = useRef<boolean>(false);
  const autoCashOutMultiplier2Ref = useRef<number>(2.0);
  const lastBetAmount2Ref = useRef<number>(25);

  // Sync refs with state
  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);

  useEffect(() => {
    hasActiveBet1Ref.current = hasActiveBet1;
  }, [hasActiveBet1]);

  useEffect(() => {
    hasCashedOut1Ref.current = hasCashedOut1;
  }, [hasCashedOut1]);

  useEffect(() => {
    autoBetEnabled1Ref.current = autoBetEnabled1;
  }, [autoBetEnabled1]);

  useEffect(() => {
    autoCashOutEnabled1Ref.current = autoCashOutEnabled1;
  }, [autoCashOutEnabled1]);

  useEffect(() => {
    autoCashOutMultiplier1Ref.current = autoCashOutMultiplier1;
  }, [autoCashOutMultiplier1]);

  useEffect(() => {
    hasActiveBet2Ref.current = hasActiveBet2;
  }, [hasActiveBet2]);

  useEffect(() => {
    hasCashedOut2Ref.current = hasCashedOut2;
  }, [hasCashedOut2]);

  useEffect(() => {
    autoBetEnabled2Ref.current = autoBetEnabled2;
  }, [autoBetEnabled2]);

  useEffect(() => {
    autoCashOutEnabled2Ref.current = autoCashOutEnabled2;
  }, [autoCashOutEnabled2]);

  useEffect(() => {
    autoCashOutMultiplier2Ref.current = autoCashOutMultiplier2;
  }, [autoCashOutMultiplier2]);

  // Sync with store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setWallet(store.getWallet(currentUser.id));
      setPastRounds(store.getPastRounds());
      setActiveBets(store.getActiveBets());
      setCurrency(store.getDisplayCurrency());
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  const getAltitudeStage = (mult: number): AltitudeStage => {
    if (mult < 1.50) return 'STAGE_1_BLUE_SKY';
    if (mult < 2.50) return 'STAGE_2_HIGH_CLOUDS';
    if (mult < 4.50) return 'STAGE_3_RAIN_LIGHTNING';
    if (mult < 8.00) return 'STAGE_4_STORM_DEBRIS';
    if (mult < 15.00) return 'STAGE_5_MESOSPHERE';
    return 'STAGE_6_COSMIC_SPACE';
  };

  const altitudeStage = getAltitudeStage(multiplier);

  // Handle cashout action for Panel 1 or Panel 2
  const handleCashOut = useCallback((panelId: number = 1) => {
    const isP1 = panelId === 1;
    const activeRef = isP1 ? hasActiveBet1Ref : hasActiveBet2Ref;
    const cashedRef = isP1 ? hasCashedOut1Ref : hasCashedOut2Ref;

    if (!activeRef.current || cashedRef.current) return;

    try {
      const currentMult = multiplierRef.current || 1.00;
      const result = store.cashOut(currentMult, panelId);

      cashedRef.current = true;
      if (isP1) {
        setHasCashedOut1(true);
        setCashedOutMultiplier1(result.multiplier);
        setCashedOutPayout1(result.payout);
      } else {
        setHasCashedOut2(true);
        setCashedOutMultiplier2(result.multiplier);
        setCashedOutPayout2(result.payout);
      }

      audioManager.playCashOut();

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#22c55e', '#06b6d4', '#f59e0b', '#ec4899', '#3b82f6']
      });
    } catch (e) {
      console.warn('Cash out error:', e);
    }
  }, []);

  // Place bet action
  const handlePlaceBet = useCallback((amount: number, autoCashOut: number | null, panelId: number = 1) => {
    try {
      store.placeBet(amount, autoCashOut, panelId);

      if (panelId === 1) {
        hasActiveBet1Ref.current = true;
        hasCashedOut1Ref.current = false;
        lastBetAmount1Ref.current = amount;

        setHasActiveBet1(true);
        setBetAmount1(amount);
        setHasCashedOut1(false);
        setCashedOutMultiplier1(null);
        setCashedOutPayout1(null);
      } else {
        hasActiveBet2Ref.current = true;
        hasCashedOut2Ref.current = false;
        lastBetAmount2Ref.current = amount;

        setHasActiveBet2(true);
        setBetAmount2(amount);
        setHasCashedOut2(false);
        setCashedOutMultiplier2(null);
        setCashedOutPayout2(null);
      }

      audioManager.playButtonClick();
    } catch (err: unknown) {
      console.warn('Falha ao registrar aposta:', err);
    }
  }, []);

  // Auto Bet Trigger at round start (COUNTDOWN / WAITING)
  const triggerAutoBets = useCallback(() => {
    const currentWal = store.getWallet(currentUser.id);

    // Panel 1 Auto Bet
    if (autoBetEnabled1Ref.current && !hasActiveBet1Ref.current) {
      const amt1 = lastBetAmount1Ref.current || (currency === 'EUR' ? 20 : 25);
      if (currentWal.availableBalance >= amt1) {
        const autoCash = autoCashOutEnabled1Ref.current ? autoCashOutMultiplier1Ref.current : null;
        handlePlaceBet(amt1, autoCash, 1);
      }
    }

    // Panel 2 Auto Bet
    if (showSecondPanel && autoBetEnabled2Ref.current && !hasActiveBet2Ref.current) {
      const amt2 = lastBetAmount2Ref.current || (currency === 'EUR' ? 20 : 25);
      const updatedWal = store.getWallet(currentUser.id);
      if (updatedWal.availableBalance >= amt2) {
        const autoCash2 = autoCashOutEnabled2Ref.current ? autoCashOutMultiplier2Ref.current : null;
        handlePlaceBet(amt2, autoCash2, 2);
      }
    }
  }, [currentUser.id, currency, showSecondPanel, handlePlaceBet]);

  // Main Game Loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (currentRound.status === 'WAITING') {
      // Trigger Auto-Bet during WAITING
      triggerAutoBets();

      const timer = setTimeout(() => {
        store.setRoundStatus('COUNTDOWN');
        setCurrentRound({ ...currentRound, status: 'COUNTDOWN' });
        setCountdown(3);
        audioManager.playCountdown(false);
      }, 1200);
      return () => clearTimeout(timer);
    }

    if (currentRound.status === 'COUNTDOWN') {
      // Trigger Auto-Bet during COUNTDOWN if not placed yet
      triggerAutoBets();

      intervalId = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            const startedAt = Date.now();
            store.setRoundStatus('RUNNING', startedAt);
            setCurrentRound({ ...currentRound, status: 'RUNNING', startedAt });
            multiplierRef.current = 1.00;
            setMultiplier(1.00);
            runStartRef.current = startedAt;
            audioManager.playCountdown(true);
            return 0;
          }
          audioManager.playCountdown(false);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }

    if (currentRound.status === 'RUNNING') {
      runStartRef.current = currentRound.startedAt || Date.now();

      const runFrame = () => {
        const elapsedSec = (Date.now() - runStartRef.current) / 1000;
        const growthRate = 0.075;
        const calculatedMult = Math.round((Math.exp(growthRate * elapsedSec)) * 100) / 100;

        // Dynamically check if all real players are out and extend flight if so
        store.extendFlightIfRealPlayersOut(calculatedMult);
        const activeRound = store.getCurrentRound();
        const activeCrashPoint = activeRound.crashPoint;

        if (calculatedMult >= activeCrashPoint) {
          const finalPoint = activeCrashPoint;
          setMultiplier(finalPoint);
          multiplierRef.current = finalPoint;
          audioManager.playCrash();
          store.endRound(finalPoint);
          setCurrentRound({ ...activeRound, status: 'CRASHED', crashPoint: finalPoint });

          setTimeout(() => {
            const nextRound = store.initNextRound();
            setCurrentRound(nextRound);
            multiplierRef.current = 1.00;
            setMultiplier(1.00);

            // Reset Panel 1
            hasActiveBet1Ref.current = false;
            hasCashedOut1Ref.current = false;
            setHasActiveBet1(false);
            setHasCashedOut1(false);
            setCashedOutMultiplier1(null);
            setCashedOutPayout1(null);

            // Reset Panel 2
            hasActiveBet2Ref.current = false;
            hasCashedOut2Ref.current = false;
            setHasActiveBet2(false);
            setHasCashedOut2(false);
            setCashedOutMultiplier2(null);
            setCashedOutPayout2(null);
          }, 3200);
          return;
        }

        setMultiplier(calculatedMult);
        multiplierRef.current = calculatedMult;
        const stage = getAltitudeStage(calculatedMult);
        audioManager.updateFlightIntensity(calculatedMult, stage);
        store.triggerBotCashouts(calculatedMult);

        // Auto Cashout check Panel 1
        if (
          hasActiveBet1Ref.current &&
          !hasCashedOut1Ref.current &&
          autoCashOutEnabled1Ref.current &&
          calculatedMult >= autoCashOutMultiplier1Ref.current
        ) {
          handleCashOut(1);
        }

        // Auto Cashout check Panel 2
        if (
          hasActiveBet2Ref.current &&
          !hasCashedOut2Ref.current &&
          autoCashOutEnabled2Ref.current &&
          calculatedMult >= autoCashOutMultiplier2Ref.current
        ) {
          handleCashOut(2);
        }

        loopTimerRef.current = requestAnimationFrame(runFrame);
      };

      loopTimerRef.current = requestAnimationFrame(runFrame);

      return () => {
        if (loopTimerRef.current) cancelAnimationFrame(loopTimerRef.current);
      };
    }
  }, [currentRound.status, currentRound.crashPoint, currentRound.startedAt, triggerAutoBets, handleCashOut]);

  const toggleCurrency = () => {
    const next: 'USD' | 'EUR' = currency === 'USD' ? 'EUR' : 'USD';
    store.setDisplayCurrency(next);
    setCurrency(next);
    audioManager.playButtonClick();
  };

  const toggleSound = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-2.5 select-none font-sans">
      {/* Top Game Bar (Header info) */}
      <div className="flex items-center justify-between px-2 sm:px-1 py-1">
        {/* Left: Aviator Live Indicator & Round # */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>AVIATOR SKYBIRD</span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Rodada #{currentRound.roundNumber}
          </span>
        </div>

        {/* Right: Currency Toggle, How to Play & Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Currency Switcher (USD / EUR) */}
          <button
            type="button"
            onClick={toggleCurrency}
            title="Alternar Moeda (USD / EUR)"
            className="px-2.5 py-1 rounded-lg bg-[#18202d] hover:bg-[#222c3e] border border-[#28354c] text-xs font-mono font-bold text-cyan-300 transition cursor-pointer"
          >
            {currency === 'EUR' ? '€ (EUR)' : '$ (USD)'}
          </button>

          {/* How to play button */}
          <button
            id="btn-how-to-play"
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className="p-1.5 rounded-lg bg-[#18202d] hover:bg-[#222c3e] border border-[#28354c] text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Como Jogar?</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'Ativar Som' : 'Desativar Som'}
            className="p-1.5 rounded-lg bg-[#18202d] hover:bg-[#222c3e] border border-[#28354c] text-slate-300 hover:text-white transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Add 2nd Bet Panel Toggle */}
          {!showSecondPanel && (
            <button
              id="btn-add-second-bet"
              type="button"
              onClick={() => setShowSecondPanel(true)}
              className="px-2.5 py-1 rounded-lg bg-[#1a2538] hover:bg-[#233148] border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ 2ª Aposta</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Aviator Frame: Grid (Left Sidebar + Center Canvas & Bet Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
        {/* Left Column: Tabbed Bets (Todas | Minhas | Top) - Col 4 on Desktop */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <LiveBetsList
            bets={activeBets}
            currentMultiplier={multiplier}
            currency={currency}
          />
        </div>

        {/* Right / Center Main Game Console - Col 8 on Desktop */}
        <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col gap-2">
          {/* Framed Canvas Container with Integrated Top History Ribbon */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#263143] bg-[#0b0e14] shadow-2xl flex flex-col">
            {/* Top Multiplier History Bar */}
            <RoundHistory
              rounds={pastRounds}
              onSelectRound={(round) => setSelectedFairnessRound(round)}
            />

            {/* Well-proportioned flight viewport (clean Bantu Bet ratio, never overflowing) */}
            <div className="relative w-full h-[260px] sm:h-[330px] lg:h-[360px] overflow-hidden bg-gradient-to-b from-[#0e131d] via-[#090c12] to-[#05070a]">
              {/* Three.js Canvas */}
              <SkybirdCanvas
                status={currentRound.status}
                multiplier={multiplier}
                altitudeStage={altitudeStage}
                quality={quality}
              />

              {/* Multiplier HUD Overlay */}
              <MultiplierDisplay
                status={currentRound.status}
                multiplier={multiplier}
                crashPoint={currentRound.crashPoint}
                altitudeStage={altitudeStage}
                countdown={countdown}
                cashedOutMultiplier={cashedOutMultiplier1}
                cashedOutPayout={cashedOutPayout1}
                onOpenFairness={() => setSelectedFairnessRound(currentRound)}
              />
            </div>
          </div>

          {/* Betting Panels Container: Single or Dual Panels */}
          <div className={`grid ${showSecondPanel ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {/* Betting Panel 1 */}
            <BettingPanel
              panelId={1}
              status={currentRound.status}
              currentMultiplier={multiplier}
              userBalance={wallet.availableBalance}
              hasActiveBet={hasActiveBet1}
              betAmount={betAmount1}
              hasCashedOut={hasCashedOut1}
              cashedOutMultiplier={cashedOutMultiplier1}
              cashedOutPayout={cashedOutPayout1}
              currency={currency}
              autoBetEnabled={autoBetEnabled1}
              onToggleAutoBet={setAutoBetEnabled1}
              autoCashOutEnabled={autoCashOutEnabled1}
              onToggleAutoCashOut={setAutoCashOutEnabled1}
              autoCashOutMultiplier={autoCashOutMultiplier1}
              onChangeAutoCashOutMultiplier={setAutoCashOutMultiplier1}
              onPlaceBet={handlePlaceBet}
              onCashOut={handleCashOut}
              onOpenDeposit={onOpenDeposit}
            />

            {/* Betting Panel 2 (Dual Bet) */}
            {showSecondPanel && (
              <BettingPanel
                panelId={2}
                status={currentRound.status}
                currentMultiplier={multiplier}
                userBalance={wallet.availableBalance}
                hasActiveBet={hasActiveBet2}
                betAmount={betAmount2}
                hasCashedOut={hasCashedOut2}
                cashedOutMultiplier={cashedOutMultiplier2}
                cashedOutPayout={cashedOutPayout2}
                currency={currency}
                autoBetEnabled={autoBetEnabled2}
                onToggleAutoBet={setAutoBetEnabled2}
                autoCashOutEnabled={autoCashOutEnabled2}
                onToggleAutoCashOut={setAutoCashOutEnabled2}
                autoCashOutMultiplier={autoCashOutMultiplier2}
                onChangeAutoCashOutMultiplier={setAutoCashOutMultiplier2}
                onPlaceBet={handlePlaceBet}
                onCashOut={handleCashOut}
                onOpenDeposit={onOpenDeposit}
                onRemovePanel={() => setShowSecondPanel(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* How to Play Modal (Bantu Bet Aviator Rules) */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#121722] border border-[#28354c] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#212b3d]">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Como Jogar o Aviator</span>
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="p-1 rounded-lg hover:bg-[#1f2838] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-[#171e2c] border border-[#263348]">
                <strong className="text-emerald-400 font-bold block mb-1">1. Faça sua Aposta</strong>
                Escolha o valor desejado antes da decolagem e clique no botão verde <span className="font-bold text-emerald-400">"APOSTA"</span>. Você pode apostar em até 2 painéis simultaneamente!
              </div>

              <div className="p-3 rounded-xl bg-[#171e2c] border border-[#263348]">
                <strong className="text-cyan-300 font-bold block mb-1">2. Acompanhe a Decolagem</strong>
                O avião decola e o multiplicador cresce exponencialmente a partir de 1.00x em direção às alturas.
              </div>

              <div className="p-3 rounded-xl bg-[#171e2c] border border-[#263348]">
                <strong className="text-amber-300 font-bold block mb-1">3. Encerre a Aposta (Cash Out)</strong>
                Clique no botão amarelo/verde <span className="font-bold text-amber-300">"SACAR"</span> antes que o avião voe para longe! O seu prêmio é calculado multiplicando sua aposta pelo coeficiente exato do momento.
              </div>

              <div className="p-3 rounded-xl bg-[#171e2c] border border-[#263348]">
                <strong className="text-fuchsia-400 font-bold block mb-1">4. Auto Aposta e Auto Saque</strong>
                Ative a aba "Auto" para ligar a <strong>Auto Aposta</strong> (aposta a cada nova rodada automaticamente) e o <strong>Auto Saque</strong> para retirar lucros no multiplicador definido.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-slate-950 text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
            >
              Entendido, Vamos Jogar!
            </button>
          </div>
        </div>
      )}

      {/* Provably Fair Modal */}
      {selectedFairnessRound && (
        <FairnessModal
          round={selectedFairnessRound}
          onClose={() => setSelectedFairnessRound(null)}
        />
      )}
    </div>
  );
};
