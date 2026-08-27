import React, { useState } from 'react';
import { X, Wallet, CheckCircle, ShieldCheck } from 'lucide-react';
import { store } from '../../services/store';
import { audioManager } from '../../services/audioManager';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupportExpress?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose
}) => {
  const [amount, setAmount] = useState<number>(50);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successTx, setSuccessTx] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [10, 25, 50, 100, 250, 500];
  const currencySymbol = currency === 'EUR' ? '€' : '$';

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsProcessing(true);
    audioManager.playButtonClick();

    setTimeout(() => {
      try {
        const tx = store.deposit(amount, 'Airtm');
        setIsProcessing(false);
        setSuccessTx(tx.reference);
        audioManager.playCashOut();
      } catch (err: unknown) {
        setIsProcessing(false);
        alert(err instanceof Error ? err.message : 'Erro ao processar depósito via Airtm');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 relative">
        <button
          id="btn-close-deposit"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-cyber font-bold text-white">DEPOSITAR SALDO</h3>
            <p className="text-xs text-slate-400">Processamento oficial via carteira digital Airtm.</p>
          </div>
        </div>

        {successTx ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-cyber font-bold text-white">Depósito Confirmado!</h4>
            <p className="text-xs text-slate-300">
              O valor de <strong>{currencySymbol}{amount.toFixed(2)} {currency}</strong> foi creditado com sucesso em sua conta.
            </p>
            <span className="text-[11px] font-mono text-cyan-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
              Ref: {successTx}
            </span>
            <button
              onClick={() => {
                setSuccessTx(null);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold uppercase transition cursor-pointer mt-4"
            >
              VOLTAR AO JOGO
            </button>
          </div>
        ) : (
          <form onSubmit={handleDepositSubmit} className="space-y-5 text-xs">
            {/* Payment Method Banner (Airtm Exclusivo) */}
            <div>
              <label className="text-slate-300 font-semibold block mb-2">Método de Pagamento</label>
              <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                    A
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm">Airtm Global</span>
                    <span className="text-[11px] text-cyan-300/90">Depósito Instantâneo Seguro</span>
                  </div>
                </div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-1 rounded-full font-mono">
                  Ativo
                </span>
              </div>
            </div>

            {/* Currency selector */}
            <div>
              <label className="text-slate-300 font-semibold block mb-2">Moeda da Transação</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-2.5 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  $ Dólar (USD)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`py-2.5 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                    currency === 'EUR'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  € Euro (EUR)
                </button>
              </div>
            </div>

            {/* Amount selection */}
            <div>
              <label className="text-slate-300 font-semibold block mb-2">Valor do Depósito</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer ${
                      amount === amt
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {currencySymbol}{amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                <span className="text-cyan-400 font-cyber font-bold text-lg mr-2">{currencySymbol}</span>
                <input
                  type="number"
                  min={5}
                  max={5000}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-cyber font-bold text-lg text-white outline-none"
                />
                <span className="text-slate-400 font-mono text-xs">{currency}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Taxa de Depósito Airtm:
              </span>
              <span className="text-emerald-400 font-bold font-mono">0.00% (Grátis)</span>
            </div>

            <button
              id="btn-confirm-deposit"
              type="submit"
              disabled={isProcessing || amount <= 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-cyber font-bold text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? 'PROCESSANDO TRANSAÇÃO...' : `CONFIRMAR DEPÓSITO DE ${currencySymbol}${amount.toFixed(2)} ${currency}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
