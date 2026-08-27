import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Gamepad2,
  Wallet,
  Settings,
  Headphones,
  History,
  FileText,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  X,
  Send,
  Lock,
  Zap,
  RefreshCw,
  Sliders,
  DollarSign,
  LogOut
} from 'lucide-react';
import { store } from '../../services/store';
import { audioManager } from '../../services/audioManager';
import {
  User,
  GameRound,
  WalletTransaction,
  SupportConversation,
  AdminSettings,
  AuditLog
} from '../../types';

interface AdminDashboardProps {
  currentUser: User;
  onExitAdmin: () => void;
  onLogoutAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onExitAdmin,
  onLogoutAdmin
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'rounds' | 'transactions' | 'support' | 'settings' | 'audit'
  >('overview');

  const [users, setUsers] = useState<User[]>(store.getAllUsers());
  const [rounds, setRounds] = useState<GameRound[]>(store.getPastRounds());
  const [transactions, setTransactions] = useState<WalletTransaction[]>(store.getAllTransactions());
  const [conversations, setConversations] = useState<SupportConversation[]>(store.getAllConversations());
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(store.getAdminSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(store.getAuditLogs());

  // Support Reply State
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [airtmLinkInput, setAirtmLinkInput] = useState('https://app.airtm.com/pay/skybird-official');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setUsers(store.getAllUsers());
      setRounds(store.getPastRounds());
      setTransactions(store.getAllTransactions());
      setConversations(store.getAllConversations());
      setAdminSettings(store.getAdminSettings());
      setAuditLogs(store.getAuditLogs());
    });
    return () => unsub();
  }, []);

  // Summary Metrics
  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBetsVolume = rounds.reduce((acc, r) => acc + r.totalBetsAmount, 0);
  const totalPayouts = rounds.reduce((acc, r) => acc + r.totalPayoutAmount, 0);
  const grossRevenue = totalBetsVolume - totalPayouts;

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateAdminSettings(adminSettings);
    audioManager.playNotification();
    alert('Configurações salvas e auditadas com sucesso!');
  };

  const handleAdminSupportReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !replyText.trim()) return;

    store.adminReplyToSupport(selectedConvId, replyText, airtmLinkInput || undefined);
    setReplyText('');
    audioManager.playNotification();
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-64 glass-panel rounded-3xl p-4 border border-cyan-500/30 shrink-0 space-y-1.5">
        <div className="p-3 mb-2 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-cyber font-bold text-white text-sm block">ADMIN CENTER</span>
            <span className="text-[10px] text-amber-400 font-mono">Controle Restrito</span>
          </div>
        </div>

        {[
          { id: 'overview', label: 'Dashboard Geral', icon: TrendingUp },
          { id: 'users', label: 'Gestão de Usuários', icon: Users },
          { id: 'rounds', label: 'Histórico & Fairness', icon: Gamepad2 },
          { id: 'transactions', label: 'Ledger & Saques', icon: Wallet },
          { id: 'support', label: 'Central de Suporte', icon: Headphones },
          { id: 'settings', label: 'Parâmetros & RTP', icon: Sliders },
          { id: 'audit', label: 'Logs de Auditoria', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                audioManager.playButtonClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onExitAdmin}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 border border-slate-800"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ir para o Jogo</span>
          </button>

          {onLogoutAdmin && (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                onLogoutAdmin();
              }}
              className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-200 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 border border-red-900/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desconectar Admin</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 w-full space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-cyber font-bold text-white">VISÃO GERAL DO SISTEMA</h2>
                <p className="text-xs text-slate-400">Métricas financeiras consolidadas e integridade do jogo.</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
                RTP Global: {adminSettings.globalRtp}%
              </span>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl glass-panel border border-white/10">
                <span className="text-xs text-slate-400 block mb-1">Total de Usuários</span>
                <span className="text-2xl font-cyber font-bold text-white">{users.length}</span>
              </div>
              <div className="p-4 rounded-2xl glass-panel border border-white/10">
                <span className="text-xs text-slate-400 block mb-1">Total Depositado</span>
                <span className="text-2xl font-cyber font-bold text-emerald-400">${totalDeposits.toFixed(2)}</span>
              </div>
              <div className="p-4 rounded-2xl glass-panel border border-white/10">
                <span className="text-xs text-slate-400 block mb-1">Total Sacado</span>
                <span className="text-2xl font-cyber font-bold text-amber-400">${totalWithdrawals.toFixed(2)}</span>
              </div>
              <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30">
                <span className="text-xs text-slate-400 block mb-1">Gross Gaming Revenue</span>
                <span className="text-2xl font-cyber font-bold text-cyan-300">${grossRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Live activity feed */}
            <div className="p-6 rounded-3xl glass-panel border border-white/10">
              <h3 className="text-sm font-cyber font-bold text-white uppercase tracking-wider mb-4">
                Volume de Apostas Recentes
              </h3>
              <div className="space-y-3">
                {rounds.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white">Rodada #{r.roundNumber}</span>
                      <span className="text-slate-500 font-mono">({r.crashPoint.toFixed(2)}x)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Volume: ${r.totalBetsAmount.toFixed(2)}</span>
                      <span className="text-emerald-400 font-mono font-bold">Payout: ${r.totalPayoutAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white">GESTÃO DE JOGADORES</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="pb-3">Usuário</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Função</th>
                    <th className="pb-3">Saldo Atual</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => {
                    const wallet = store.getWallet(u.id);
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-semibold text-white flex items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full bg-slate-800" />
                          <span>{u.name}</span>
                        </td>
                        <td className="py-3 text-slate-400">{u.email}</td>
                        <td className="py-3 uppercase font-mono text-[10px] text-cyan-400">{u.role}</td>
                        <td className="py-3 font-mono font-bold text-emerald-400">${wallet.availableBalance.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            u.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => store.updateUserStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                          >
                            {u.status === 'active' ? 'Suspender' : 'Ativar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROUNDS & FAIRNESS TAB */}
        {activeTab === 'rounds' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white">HISTÓRICO DE RODADAS & AUDITORIA DE SEEDS</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Rodada</th>
                    <th className="pb-3">Crash Point</th>
                    <th className="pb-3">Server Seed Hash (SHA-256)</th>
                    <th className="pb-3">Total Apostas</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rounds.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-white">#{r.roundNumber}</td>
                      <td className="py-3 text-emerald-400 font-bold">{r.crashPoint.toFixed(2)}x</td>
                      <td className="py-3 text-slate-400 text-[10px] truncate max-w-xs">{r.serverSeedHash}</td>
                      <td className="py-3 text-slate-300">${r.totalBetsAmount.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] font-sans">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRANSACTIONS & WITHDRAWAL APPROVALS TAB */}
        {activeTab === 'transactions' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white">LEDGER FINANCEIRO & CONTROLE DE SAQUES</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Referência</th>
                    <th className="pb-3">Valor</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Ação Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30">
                      <td className="py-3 text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 uppercase font-bold text-cyan-400">{tx.type}</td>
                      <td className="py-3 text-slate-300">{tx.reference}</td>
                      <td className="py-3 font-bold text-white">${tx.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          tx.status === 'completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {tx.status === 'processing' && tx.type === 'withdrawal' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => store.updateTransactionStatus(tx.id, 'completed')}
                              className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                              title="Aprovar Saque"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => store.updateTransactionStatus(tx.id, 'cancelled')}
                              className="p-1.5 rounded bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                              title="Recusar Saque (Estorno)"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUPPORT CONSOLE TAB */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 p-4 rounded-3xl glass-panel border border-white/10 space-y-2">
              <span className="text-xs font-cyber font-bold text-white uppercase block mb-2">Conversas de Suporte</span>
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`p-3 rounded-2xl transition cursor-pointer text-xs ${
                    selectedConvId === c.id ? 'bg-cyan-950/60 border border-cyan-500' : 'bg-slate-950 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{c.userName}</span>
                    <span className="text-[10px] text-slate-500">{c.status}</span>
                  </div>
                  <p className="text-slate-400 truncate">{c.lastMessage}</p>
                </div>
              ))}
            </div>

            <div className="md:col-span-7 p-6 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between h-[480px]">
              <div>
                <h3 className="text-sm font-cyber font-bold text-white uppercase mb-4">Responder Atendimento</h3>
                <form onSubmit={handleAdminSupportReply} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Mensagem de Resposta</label>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Olá! Seu pagamento foi verificado..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Link Airtm Oficial (Opcional)
                    </label>
                    <input
                      type="text"
                      value={airtmLinkInput}
                      onChange={(e) => setAirtmLinkInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-mono text-cyan-300 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold uppercase transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>ENVIAR RESPOSTA OFICIAL</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS & RTP TAB */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6">
            <h2 className="text-xl font-cyber font-bold text-white">PARÂMETROS GLOBAIS DO JOGO (HOUSE EDGE & RTP)</h2>
            <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">RTP Global (%)</label>
                <input
                  type="number"
                  step={0.1}
                  min={90}
                  max={99}
                  value={adminSettings.globalRtp}
                  onChange={(e) => {
                    const rtp = parseFloat(e.target.value) || 97;
                    setAdminSettings({
                      ...adminSettings,
                      globalRtp: rtp,
                      houseEdge: parseFloat((100 - rtp).toFixed(1))
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">House Edge (%)</label>
                <input
                  type="number"
                  disabled
                  value={adminSettings.houseEdge}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-amber-400 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Aposta Mínima ($ USD)</label>
                <input
                  type="number"
                  step={0.1}
                  value={adminSettings.minBet}
                  onChange={(e) => setAdminSettings({ ...adminSettings, minBet: parseFloat(e.target.value) || 0.5 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Aposta Máxima ($ USD)</label>
                <input
                  type="number"
                  value={adminSettings.maxBet}
                  onChange={(e) => setAdminSettings({ ...adminSettings, maxBet: parseFloat(e.target.value) || 500 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Status do Suporte 24/7</label>
                <select
                  value={adminSettings.supportStatus}
                  onChange={(e) => setAdminSettings({ ...adminSettings, supportStatus: e.target.value as AdminSettings['supportStatus'] })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                >
                  <option value="online">🟢 Online</option>
                  <option value="busy">🟡 Ocupado (Auto-Fila)</option>
                  <option value="offline">⚫ Offline</option>
                </select>
              </div>

              <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>ALGORITMO ATIVO: MODO HARD & VOO ADAPTATIVO</span>
                </div>
                <p className="text-amber-200/80 leading-relaxed">
                  Sequência aleatória calibrada para ganho Hard (alta probabilidade de quedas rápidas entre 1.00x e 1.95x). Caso todos os apostadores reais retirem suas apostas, o sistema sustenta o pássaro por mais tempo no ar mantendo 3 a 4 bots fictícios que simulam saques antecipados ou perdas na queda final.
                </p>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold uppercase transition cursor-pointer"
                >
                  SALVAR ALTERAÇÕES & REGISTRAR NO AUDIT LOG
                </button>
              </div>
            </form>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white">REGISTRO DE AUDITORIA IMUTÁVEL</h2>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-cyan-400 font-bold font-cyber">{log.action}</span>
                    <span className="text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300">Alvo: {log.target}</p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>De: <strong className="text-red-400">{log.beforeValue}</strong></span>
                    <span>→</span>
                    <span>Para: <strong className="text-emerald-400">{log.afterValue}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
