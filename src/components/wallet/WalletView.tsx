import React, { useState } from 'react';
import { User, WalletTransaction } from '../../types';
import { store } from '../../services/store';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  History,
  ShieldCheck,
  Zap,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { audioManager } from '../../services/audioManager';

interface WalletViewProps {
  currentUser: User;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSupportExpress?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  currentUser,
  onOpenDeposit,
  onOpenWithdraw
}) => {
  const [wallet, setWallet] = useState(store.getWallet(currentUser.id));
  const [transactions, setTransactions] = useState<WalletTransaction[]>(
    store.getTransactions(currentUser.id)
  );
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'bet' | 'cashout'>('all');

  // Listen for changes
  React.useEffect(() => {
    const unsub = store.subscribe(() => {
      setWallet(store.getWallet(currentUser.id));
      setTransactions(store.getTransactions(currentUser.id));
    });
    return () => unsub();
  }, [currentUser.id]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Concluído
          </span>
        );
      case 'processing':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30 font-mono">
            <Clock className="w-3 h-3 text-amber-400" />
            Em Análise
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/30 font-mono">
            <XCircle className="w-3 h-3 text-rose-400" />
            Falha
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="w-4 h-4 text-cyan-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      case 'cashout':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'bet':
        return <Zap className="w-4 h-4 text-rose-400" />;
      default:
        return <WalletIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Balance Cards & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Available Balance Card */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <WalletIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-cyber font-bold text-white tracking-wide">
                  CARTEIRA AIRTM
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {wallet.userId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Proteção Segura</span>
            </div>
          </div>

          <div className="my-6">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
              Saldo Disponível para Apostas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-cyber font-black text-white tracking-tight">
                ${wallet.availableBalance.toFixed(2)}
              </span>
              <span className="text-lg font-cyber font-bold text-cyan-400">
                {wallet.currency}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
            <button
              id="btn-open-deposit-wallet"
              onClick={() => {
                audioManager.playButtonClick();
                onOpenDeposit();
              }}
              className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-cyber font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Depositar</span>
            </button>

            <button
              id="btn-open-withdraw-wallet"
              onClick={() => {
                audioManager.playButtonClick();
                onOpenWithdraw();
              }}
              className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-cyber font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Sacar</span>
            </button>
          </div>
        </div>

        {/* Total Assets Overview */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-center shadow-2xl">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
            Saldo Total da Conta
          </span>
          <span className="text-3xl sm:text-4xl font-cyber font-black text-emerald-400">
            ${wallet.totalBalance.toFixed(2)} USD
          </span>
          <span className="text-[11px] text-emerald-400/80 block mt-2 font-mono">
            Patrimônio consolidado
          </span>
        </div>
      </div>

      {/* Airtm Verified Info banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-cyan-400 shrink-0 font-black">
            A
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Transações Rápidas e Seguras com Airtm</h4>
            <p className="text-xs text-slate-400">
              Depósitos e saques instantâneos garantidos com taxas zero para operações na plataforma.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            audioManager.playButtonClick();
            onOpenDeposit();
          }}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition cursor-pointer whitespace-nowrap"
        >
          DEPOSITAR VIA AIRTM
        </button>
      </div>

      {/* Ledger Transactions Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-cyber font-bold text-white">
              EXTRATO DO LEDGER IMUTÁVEL
            </h3>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto text-xs">
            {(['all', 'deposit', 'withdrawal', 'bet', 'cashout'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider transition cursor-pointer ${
                  filter === f
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'deposit' ? 'Depósitos' : f === 'withdrawal' ? 'Saques' : f === 'bet' ? 'Apostas' : 'Cashouts'}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800/80">
                <th className="pb-3 px-3">Tipo</th>
                <th className="pb-3 px-3">Referência</th>
                <th className="pb-3 px-3">Método</th>
                <th className="pb-3 px-3">Valor</th>
                <th className="pb-3 px-3">Saldo Antes/Depois</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 font-sans">
                    Nenhuma transação encontrada no período.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPositive = tx.type === 'deposit' || tx.type === 'cashout';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                            {getTypeIcon(tx.type)}
                          </div>
                          <span className="font-semibold uppercase text-slate-200">
                            {tx.type}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {tx.reference}
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {tx.method || 'Airtm'}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : '-'}${tx.amount.toFixed(2)} USD
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        ${tx.balanceBefore.toFixed(2)} → <strong className="text-white">${tx.balanceAfter.toFixed(2)}</strong>
                      </td>

                      <td className="py-3 px-3">
                        {getStatusBadge(tx.status)}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
