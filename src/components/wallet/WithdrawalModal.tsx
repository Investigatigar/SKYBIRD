import React, { useState } from 'react';
import { X, ArrowDownRight, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { store } from '../../services/store';
import { audioManager } from '../../services/audioManager';

interface WithdrawalModalProps {
  isOpen: boolean;
  availableBalance: number;
  onClose: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  availableBalance,
  onClose
}) => {
  const [amount, setAmount] = useState<number>(50);
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > availableBalance) return;
    if (!accountDetails.trim()) {
      alert('Por favor informe o email da sua conta Airtm.');
      return;
    }

    setIsSubmitting(true);
    audioManager.playButtonClick();

    setTimeout(() => {
      try {
        const tx = store.requestWithdrawal(amount, 'Airtm', accountDetails);
        setIsSubmitting(false);
        setSuccessRef(tx.reference);
        audioManager.playCashOut();
      } catch (err: unknown) {
        setIsSubmitting(false);
        alert(err instanceof Error ? err.message : 'Erro ao processar saque.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 relative">
        <button
          id="btn-close-withdraw"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-cyber font-bold text-white">SACAR SALDO (AIRTM)</h3>
            <p className="text-xs text-slate-400">Transferência direta para sua conta Airtm.</p>
          </div>
        </div>

        {successRef ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-cyber font-bold text-white">Saque Registrado!</h4>
            <p className="text-xs text-slate-300">
              O montante de <strong>${amount.toFixed(2)} USD</strong> foi enviado para a carteira Airtm <strong>{accountDetails}</strong>.
            </p>
            <span className="text-[11px] font-mono text-cyan-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
              Ref: {successRef}
            </span>
            <button
              onClick={() => {
                setSuccessRef(null);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold uppercase transition cursor-pointer mt-4"
            >
              FECHAR
            </button>
          </div>
        ) : (
          <form onSubmit={handleWithdrawal} className="space-y-4 text-xs">
            {/* Balance info */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Saldo Disponível:</span>
              <span className="font-cyber font-bold text-lg text-emerald-400">
                ${availableBalance.toFixed(2)} USD
              </span>
            </div>

            {/* Method (Airtm only) */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Método de Destino</label>
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500 text-cyan-300 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    A
                  </div>
                  <span className="font-bold text-white">Airtm Global</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Direto na Conta</span>
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Valor do Saque (USD)</label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance)}
                  className="text-cyan-400 hover:underline text-[11px]"
                >
                  Sacar Tudo
                </button>
              </div>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-cyan-500">
                <span className="text-cyan-400 font-cyber font-bold text-lg mr-2">$</span>
                <input
                  type="number"
                  min={5}
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-cyber font-bold text-lg text-white outline-none"
                />
                <span className="text-slate-400 font-mono text-xs">USD</span>
              </div>
            </div>

            {/* Account input */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Email da Conta Airtm
              </label>
              <input
                type="email"
                required
                placeholder="seu.email@airtm.com"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-[11px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Para sua segurança, saques passam por verificação de integridade antes da liberação.
              </span>
            </div>

            <button
              id="btn-confirm-withdrawal"
              type="submit"
              disabled={isSubmitting || amount <= 0 || amount > availableBalance}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-cyber font-bold text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'REGISTRANDO SAQUE...' : `SOLICITAR SAQUE DE $${amount.toFixed(2)} USD`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
