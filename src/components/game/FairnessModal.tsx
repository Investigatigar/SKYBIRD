import React, { useState } from 'react';
import { GameRound } from '../../types';
import { ShieldCheck, X, Copy, Check, Calculator, Lock } from 'lucide-react';
import { verifyRoundFairness, hashServerSeed } from '../../services/provablyFair';

interface FairnessModalProps {
  round: GameRound | null;
  onClose: () => void;
}

export const FairnessModal: React.FC<FairnessModalProps> = ({ round, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Custom Validator Inputs
  const [testServerSeed, setTestServerSeed] = useState(round?.serverSeed || '');
  const [testServerHash, setTestServerHash] = useState(round?.serverSeedHash || '');
  const [testClientSeed, setTestClientSeed] = useState(round?.clientSeed || 'skybird_global_seed_2026');
  const [testNonce, setTestNonce] = useState(round?.nonce || 1089);
  const [testResult, setTestResult] = useState<{ isValidHash: boolean; calculatedCrashPoint: number } | null>(null);

  if (!round) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRunVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const result = verifyRoundFairness(
      testServerSeed,
      testServerHash || hashServerSeed(testServerSeed),
      testClientSeed,
      Number(testNonce)
    );
    setTestResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/40 p-6 relative">
        {/* Close Button */}
        <button
          id="btn-close-fairness"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-cyber font-bold text-white flex items-center gap-2">
              VERIFICAÇÃO PROVABLY FAIR
            </h3>
            <p className="text-xs text-slate-400">
              Criptografia transparente SHA-256 e integridade matemática auditável.
            </p>
          </div>
        </div>

        {/* Selected Round Data */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <span className="text-xs text-slate-500 block">Identificador da Rodada</span>
              <span className="font-cyber font-bold text-white text-base">
                #{round.roundNumber} ({round.id})
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Crash Point Oficial</span>
              <span className="font-cyber font-bold text-emerald-400 text-lg">
                {round.crashPoint.toFixed(2)}x
              </span>
            </div>
          </div>

          {/* Server Seed Hash (Public before flight) */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Server Seed Hash (SHA-256 Divulgado Pré-Voo)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(round.serverSeedHash, 'hash')}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'hash' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="font-mono text-xs text-slate-300 break-all select-all bg-slate-900/60 p-2 rounded border border-slate-800">
              {round.serverSeedHash}
            </p>
          </div>

          {/* Server Seed (Revealed after flight) */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                Server Seed Original (Revelado Pós-Voo)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(round.serverSeed, 'seed')}
                className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'seed' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'seed' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="font-mono text-xs text-slate-300 break-all select-all bg-slate-900/60 p-2 rounded border border-slate-800">
              {round.serverSeed}
            </p>
          </div>

          {/* Client Seed & Nonce */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">Client Seed</span>
              <p className="font-mono text-xs text-slate-300 truncate">{round.clientSeed}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">Nonce</span>
              <p className="font-mono text-xs text-slate-300">{round.nonce}</p>
            </div>
          </div>
        </div>

        {/* Live Cryptographic Calculator */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Simulador / Validador Independente
            </h4>
          </div>

          <form onSubmit={handleRunVerification} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Server Seed Original</label>
                <input
                  type="text"
                  value={testServerSeed}
                  onChange={(e) => setTestServerSeed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Client Seed</label>
                <input
                  type="text"
                  value={testClientSeed}
                  onChange={(e) => setTestClientSeed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28">
                <label className="text-slate-400 block mb-1">Nonce</label>
                <input
                  type="number"
                  value={testNonce}
                  onChange={(e) => setTestNonce(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white outline-none focus:border-cyan-500"
                />
              </div>

              <button
                id="btn-verify-fairness-calc"
                type="submit"
                className="flex-1 mt-5 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider transition cursor-pointer"
              >
                VERIFICAR RESULTADO
              </button>
            </div>
          </form>

          {testResult && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${testResult.isValidHash ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="text-xs text-slate-300">
                  {testResult.isValidHash ? 'Hash SHA-256 Verificado com Sucesso' : 'Hash Divergente'}
                </span>
              </div>
              <div className="text-right font-cyber font-bold text-sm text-cyan-300">
                Resultado: {testResult.calculatedCrashPoint.toFixed(2)}x
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
