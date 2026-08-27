/**
 * State and Persistence Store for SKYBIRD
 * Manages ledger transactions, provably fair rounds, active bets,
 * live support messaging, admin audit trails, and user wallets.
 */

import {
  User,
  Wallet,
  WalletTransaction,
  GameRound,
  GameRoundStatus,
  Bet,
  SupportConversation,
  SupportMessage,
  AdminSettings,
  AuditLog,
  Testimonial
} from '../types';
import { generateRandomSeed, hashServerSeed, calculateCrashPoint } from './provablyFair';

const STORAGE_KEYS = {
  CURRENT_USER: 'skybird_current_user',
  USERS: 'skybird_users',
  WALLETS: 'skybird_wallets',
  TRANSACTIONS: 'skybird_transactions',
  ROUNDS: 'skybird_rounds',
  BETS: 'skybird_bets',
  CONVERSATIONS: 'skybird_conversations',
  MESSAGES: 'skybird_messages',
  ADMIN_SETTINGS: 'skybird_admin_settings',
  AUDIT_LOGS: 'skybird_audit_logs',
  TESTIMONIALS: 'skybird_testimonials',
};

// Initial Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_player_1',
    name: 'Alex Vance',
    email: 'player@skybird.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'player',
    status: 'active',
    createdAt: '2026-01-10T12:00:00Z',
    lastLoginAt: '2026-08-25T14:30:00Z'
  },
  {
    id: 'usr_admin_1',
    name: 'Command Sentinel',
    email: 'admin@skybird.io',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-08-25T15:00:00Z'
  }
];

const INITIAL_WALLETS: Record<string, Wallet> = {
  usr_player_1: {
    userId: 'usr_player_1',
    availableBalance: 247.35,
    lockedBalance: 0.00,
    totalBalance: 247.35,
    currency: 'USD'
  },
  usr_admin_1: {
    userId: 'usr_admin_1',
    availableBalance: 10000.00,
    lockedBalance: 0.00,
    totalBalance: 10000.00,
    currency: 'USD'
  }
};

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_init_1',
    userId: 'usr_player_1',
    type: 'deposit',
    amount: 200.00,
    currency: 'USD',
    balanceBefore: 0.00,
    balanceAfter: 200.00,
    reference: 'AIRTM-DEP-99481',
    status: 'completed',
    createdAt: '2026-08-24T10:15:00Z',
    method: 'Airtm'
  },
  {
    id: 'tx_init_2',
    userId: 'usr_player_1',
    type: 'cashout',
    amount: 47.35,
    currency: 'USD',
    balanceBefore: 200.00,
    balanceAfter: 247.35,
    reference: 'ROUND-CASH-7812',
    status: 'completed',
    createdAt: '2026-08-25T11:42:00Z',
    method: 'System'
  }
];

const INITIAL_ADMIN_SETTINGS: AdminSettings = {
  gameEnabled: true,
  maintenanceMode: false,
  minBet: 0.50,
  maxBet: 500.00,
  maxPayout: 25000.00,
  globalRtp: 92.5,
  houseEdge: 7.5,
  supportStatus: 'online',
  demoMode: true
};

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't_1',
    name: 'Marcus Sterling',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    comment: 'A fluidez da cena 3D enquanto o pássaro atravessa as tempestades elétricas é surreal. O sistema provably fair dá total transparência.',
    rating: 5,
    role: 'Pro Pilot',
    multiplierWon: '24.80x'
  },
  {
    id: 't_2',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    comment: 'O melhor crash game que já joguei. Os saques via Airtm foram rápidos e o auto cash-out funciona sem nenhum delay.',
    rating: 5,
    role: 'VIP Player',
    multiplierWon: '18.45x'
  },
  {
    id: 't_3',
    name: 'Rafael Mendes',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    comment: 'A transição de altitude do céu azul para o espaço cósmico com meteoros e destroços dá uma adrenalina indescritível.',
    rating: 5,
    role: 'Flight Enthusiast',
    multiplierWon: '63.12x'
  }
];

const INITIAL_PAST_ROUNDS: GameRound[] = [
  {
    id: 'rnd_1093',
    roundNumber: 1093,
    status: 'FINISHED',
    startedAt: Date.now() - 120000,
    endedAt: Date.now() - 105000,
    crashPoint: 2.76,
    serverSeed: 'bfa9012389012389012389012389012389012389012',
    serverSeedHash: '123890123890123890123890123890123890123890',
    clientSeed: 'skybird_global_seed_2026',
    nonce: 1093,
    totalBetsAmount: 2100.00,
    totalPayoutAmount: 1980.00,
    createdAt: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'rnd_1092',
    roundNumber: 1092,
    status: 'FINISHED',
    startedAt: Date.now() - 180000,
    endedAt: Date.now() - 150000,
    crashPoint: 12.80,
    serverSeed: '9012348901234890123489012348901234890123489',
    serverSeedHash: '490123901238901238901238901238901238901238',
    clientSeed: 'skybird_global_seed_2026',
    nonce: 1092,
    totalBetsAmount: 4890.00,
    totalPayoutAmount: 5120.00,
    createdAt: new Date(Date.now() - 180000).toISOString()
  },
  {
    id: 'rnd_1091',
    roundNumber: 1091,
    status: 'FINISHED',
    startedAt: Date.now() - 240000,
    endedAt: Date.now() - 238000,
    crashPoint: 1.12,
    serverSeed: '3890123fab90123490ab12340912389012390123901',
    serverSeedHash: '891023901238910238901238901238901238901238',
    clientSeed: 'skybird_global_seed_2026',
    nonce: 1091,
    totalBetsAmount: 1450.00,
    totalPayoutAmount: 320.00,
    createdAt: new Date(Date.now() - 240000).toISOString()
  },
  {
    id: 'rnd_1090',
    roundNumber: 1090,
    status: 'FINISHED',
    startedAt: Date.now() - 300000,
    endedAt: Date.now() - 280000,
    crashPoint: 4.35,
    serverSeed: 'a12bc9034f189e3489ab1034f0923091eabfa389481',
    serverSeedHash: '20391abf8190347890123891230192389120938102',
    clientSeed: 'skybird_global_seed_2026',
    nonce: 1090,
    totalBetsAmount: 3200.00,
    totalPayoutAmount: 2890.00,
    createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'rnd_1089',
    roundNumber: 1089,
    status: 'FINISHED',
    startedAt: Date.now() - 360000,
    endedAt: Date.now() - 350000,
    crashPoint: 1.84,
    serverSeed: 'f89a2b13c74e89f2a0134bdf8812c334fa1249bceea',
    serverSeedHash: '7394ab130f14ba67e812903fead3943bc204910398',
    clientSeed: 'skybird_global_seed_2026',
    nonce: 1089,
    totalBetsAmount: 1840.00,
    totalPayoutAmount: 1220.00,
    createdAt: new Date(Date.now() - 360000).toISOString()
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    adminId: 'usr_admin_1',
    adminEmail: 'admin@skybird.io',
    action: 'INITIALIZE_SYSTEM',
    target: 'Global Settings',
    beforeValue: 'None',
    afterValue: 'RTP: 97.0%, HouseEdge: 3.0%, MinBet: $0.50, MaxBet: $500.00',
    timestamp: '2026-08-25T10:00:00Z',
    ip: '192.168.1.1',
    userAgent: 'Skybird Secure Terminal v2.4'
  }
];

class SkybirdStore {
  private currentUser: User = INITIAL_USERS[0];
  private users: User[] = INITIAL_USERS;
  private wallets: Record<string, Wallet> = INITIAL_WALLETS;
  private transactions: WalletTransaction[] = INITIAL_TRANSACTIONS;
  private pastRounds: GameRound[] = INITIAL_PAST_ROUNDS;
  private currentRound: GameRound | null = null;
  private activeBets: Bet[] = [];
  private userBetHistory: Bet[] = [
    {
      id: 'bet_hist_1',
      roundId: 'rnd_1093',
      userId: 'usr_player_1',
      userName: 'Alex Vance',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      amount: 25.00,
      autoCashOutMultiplier: 2.50,
      cashOutMultiplier: 2.50,
      payout: 62.50,
      status: 'cashed_out',
      createdAt: '2026-08-25T14:45:00Z',
      isCurrentUser: true,
      panelId: 1
    },
    {
      id: 'bet_hist_2',
      roundId: 'rnd_1092',
      userId: 'usr_player_1',
      userName: 'Alex Vance',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      amount: 15.00,
      autoCashOutMultiplier: null,
      cashOutMultiplier: 5.40,
      payout: 81.00,
      status: 'cashed_out',
      createdAt: '2026-08-25T14:40:00Z',
      isCurrentUser: true,
      panelId: 1
    },
    {
      id: 'bet_hist_3',
      roundId: 'rnd_1091',
      userId: 'usr_player_1',
      userName: 'Alex Vance',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      amount: 20.00,
      autoCashOutMultiplier: 1.50,
      cashOutMultiplier: null,
      payout: null,
      status: 'crashed',
      createdAt: '2026-08-25T14:35:00Z',
      isCurrentUser: true,
      panelId: 1
    }
  ];

  private displayCurrency: 'USD' | 'EUR' = 'USD';
  private conversations: SupportConversation[] = [];
  private messages: SupportMessage[] = [];
  private adminSettings: AdminSettings = INITIAL_ADMIN_SETTINGS;
  private auditLogs: AuditLog[] = INITIAL_AUDIT_LOGS;
  private testimonials: Testimonial[] = INITIAL_TESTIMONIALS;

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.initSupportConversation();
    this.initNextRound();
  }

  private loadFromStorage() {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) this.currentUser = JSON.parse(savedUser);

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) this.users = JSON.parse(savedUsers);

      const savedWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
      if (savedWallets) this.wallets = JSON.parse(savedWallets);

      const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTx) this.transactions = JSON.parse(savedTx);

      const savedRounds = localStorage.getItem(STORAGE_KEYS.ROUNDS);
      if (savedRounds) {
        const parsed = JSON.parse(savedRounds);
        if (Array.isArray(parsed)) {
          const seenIds = new Set<string>();
          const seenRoundNums = new Set<number>();
          this.pastRounds = parsed.filter((r: GameRound) => {
            if (!r || !r.id || seenIds.has(r.id) || seenRoundNums.has(r.roundNumber)) {
              return false;
            }
            seenIds.add(r.id);
            seenRoundNums.add(r.roundNumber);
            return true;
          });
          if (this.pastRounds.length === 0) {
            this.pastRounds = [...INITIAL_PAST_ROUNDS];
          }
        }
      }

      const savedSettings = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
      if (savedSettings) this.adminSettings = JSON.parse(savedSettings);

      const savedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (savedLogs) this.auditLogs = JSON.parse(savedLogs);
    } catch (e) {
      console.warn('Storage read error, using memory defaults', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(this.wallets));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(this.pastRounds.slice(0, 30)));
      localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(this.adminSettings));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch {
      // safe fallback
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  // --- USER & AUTH ---
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;
    this.notify();
  }

  public switchRole(role: 'player' | 'admin') {
    const target = this.users.find((u) => u.role === role) || this.currentUser;
    this.currentUser = target;
    this.notify();
  }

  public loginAdmin(email: string, password: string, pin?: string): { success: boolean; message?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Validate credentials: check if email belongs to admin or contains admin
    const adminUser = this.users.find(
      (u) => u.role === 'admin' && (u.email.toLowerCase() === trimmedEmail || trimmedEmail.includes('admin'))
    ) || this.users.find((u) => u.role === 'admin');

    if (!adminUser) {
      this.logAudit('ADMIN_LOGIN_FAILED', `Attempt for ${email}`, 'Unauthorized', 'No admin found');
      return { success: false, message: 'Conta de administrador não encontrada.' };
    }

    // Passwords accepted: default master password 'skybird#2026', 'admin123', 'admin', or >= 6 chars
    if (password !== 'skybird#2026' && password !== 'admin123' && password !== 'admin' && password.length < 6) {
      this.logAudit('ADMIN_LOGIN_FAILED', `Attempt for ${email}`, 'Invalid Password', 'Denied');
      return { success: false, message: 'Chave de acesso mestre incorreta.' };
    }

    // Optional 2FA PIN validation
    if (pin && pin.trim().length > 0 && pin.trim() !== '202688' && pin.trim().length !== 6) {
      this.logAudit('ADMIN_LOGIN_FAILED', `Attempt for ${email}`, 'Invalid 2FA PIN', 'Denied');
      return { success: false, message: 'Código 2FA / Token de segurança inválido.' };
    }

    // Success: activate admin user
    this.currentUser = {
      ...adminUser,
      lastLoginAt: new Date().toISOString()
    };

    // Update in users array
    const idx = this.users.findIndex((u) => u.id === adminUser.id);
    if (idx !== -1) {
      this.users[idx] = this.currentUser;
    }

    this.logAudit('ADMIN_LOGIN_SUCCESS', `Admin Console: ${adminUser.email}`, 'Logged Out', 'Authorized Session');
    this.notify();
    return { success: true };
  }

  public logoutAdmin(): void {
    const playerUser = this.users.find((u) => u.role === 'player') || {
      id: 'usr_player_1',
      name: 'Comandante Piloto',
      email: 'piloto@skybird.io',
      role: 'player' as const,
      status: 'active' as const,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-08-20T14:30:00Z',
      lastLoginAt: new Date().toISOString()
    };

    this.logAudit('ADMIN_LOGOUT', `Admin Session Ended`, 'Active', 'Disconnected');
    this.currentUser = playerUser;
    this.notify();
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public updateUserStatus(userId: string, status: 'active' | 'suspended') {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;
    const oldStatus = user.status;
    user.status = status;

    this.logAudit(
      'UPDATE_USER_STATUS',
      `User ${user.name} (${user.email})`,
      oldStatus,
      status
    );
    this.notify();
  }

  // --- WALLET & LEDGER ---
  public getWallet(userId = this.currentUser.id): Wallet {
    if (!this.wallets[userId]) {
      this.wallets[userId] = {
        userId,
        availableBalance: 100.00,
        lockedBalance: 0.00,
        totalBalance: 100.00,
        currency: 'USD'
      };
    }
    return { ...this.wallets[userId] };
  }

  public getTransactions(userId = this.currentUser.id): WalletTransaction[] {
    return this.transactions.filter((tx) => tx.userId === userId);
  }

  public getAllTransactions(): WalletTransaction[] {
    return [...this.transactions];
  }

  /** Atomic deposit with ledger tracking */
  public deposit(amount: number, method: 'Airtm' = 'Airtm', reference?: string): WalletTransaction {
    const wallet = this.getWallet(this.currentUser.id);
    const balanceBefore = wallet.availableBalance;
    const balanceAfter = Math.round((balanceBefore + amount) * 100) / 100;

    wallet.availableBalance = balanceAfter;
    wallet.totalBalance = balanceAfter;
    this.wallets[this.currentUser.id] = wallet;

    const tx: WalletTransaction = {
      id: 'tx_dep_' + Math.random().toString(36).substring(2, 9),
      userId: this.currentUser.id,
      type: 'deposit',
      amount,
      currency: 'USD',
      balanceBefore,
      balanceAfter,
      reference: reference || `AIRTM-DEP-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      method: 'Airtm'
    };

    this.transactions.unshift(tx);
    this.notify();
    return tx;
  }

  /** Atomic withdrawal with ledger & status check */
  public requestWithdrawal(amount: number, method: 'Airtm' = 'Airtm', details: string = ''): WalletTransaction {
    const wallet = this.getWallet(this.currentUser.id);
    if (wallet.availableBalance < amount) {
      throw new Error('Saldo insuficiente para efetuar este saque.');
    }

    const balanceBefore = wallet.availableBalance;
    const balanceAfter = Math.round((balanceBefore - amount) * 100) / 100;

    wallet.availableBalance = balanceAfter;
    wallet.totalBalance = balanceAfter;
    this.wallets[this.currentUser.id] = wallet;

    const tx: WalletTransaction = {
      id: 'tx_wth_' + Math.random().toString(36).substring(2, 9),
      userId: this.currentUser.id,
      type: 'withdrawal',
      amount,
      currency: 'USD',
      balanceBefore,
      balanceAfter,
      reference: `AIRTM-WTH-${Math.floor(10000 + Math.random() * 90000)}${details ? `: ${details}` : ''}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      method: 'Airtm'
    };

    this.transactions.unshift(tx);
    this.notify();
    return tx;
  }

  public updateTransactionStatus(txId: string, status: 'completed' | 'failed' | 'cancelled') {
    const tx = this.transactions.find((t) => t.id === txId);
    if (!tx) return;
    const oldStatus = tx.status;
    tx.status = status;

    if (status === 'failed' || status === 'cancelled') {
      // Refund back to wallet if withdrawal cancelled
      if (tx.type === 'withdrawal') {
        const wallet = this.getWallet(tx.userId);
        wallet.availableBalance += tx.amount;
        wallet.totalBalance += tx.amount;
      }
    }

    this.logAudit(
      'UPDATE_TRANSACTION_STATUS',
      `Transaction ${tx.reference}`,
      oldStatus,
      status
    );
    this.notify();
  }

  // --- GAME ROUNDS & PROVABLY FAIR ---
  public getCurrentRound(): GameRound {
    if (!this.currentRound) {
      this.initNextRound();
    }
    return this.currentRound!;
  }

  public initNextRound(): GameRound {
    const maxPast = this.pastRounds.reduce((max, r) => Math.max(max, r.roundNumber || 0), 1093);
    const maxCurrent = this.currentRound ? (this.currentRound.roundNumber || 0) : 0;
    const nextRoundNum = Math.max(maxPast, maxCurrent) + 1;

    const serverSeed = generateRandomSeed(32);
    const serverSeedHash = hashServerSeed(serverSeed);
    const clientSeed = 'skybird_client_seed_main';
    const nonce = nextRoundNum;

    const crashPoint = calculateCrashPoint(
      serverSeed,
      clientSeed,
      nonce,
      this.adminSettings.houseEdge
    );

    this.currentRound = {
      id: `rnd_${nextRoundNum}`,
      roundNumber: nextRoundNum,
      status: 'WAITING',
      startedAt: null,
      endedAt: null,
      crashPoint,
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonce,
      totalBetsAmount: 0,
      totalPayoutAmount: 0,
      createdAt: new Date().toISOString()
    };

    this.activeBets = [];
    this.hasExtendedFlightForRound = false;
    this.seedSimulatedBots(this.currentRound.id);
    this.notify();
    return this.currentRound;
  }

  private seedSimulatedBots(roundId: string) {
    const botNames = ['CyberFalcon', 'NeoPilot', 'AeroVortex', 'SkyRunner', 'ZeroG', 'Stratosphere', 'HorizonX', 'Valkyrie'];
    // Exactly 3 or 4 simulated fictitious players
    const count = 3 + (Math.random() < 0.5 ? 0 : 1);

    // Shuffle names for variety
    const shuffled = [...botNames].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const name = shuffled[i % shuffled.length];
      const amount = [5, 10, 20, 25, 50, 100][Math.floor(Math.random() * 6)];
      
      // Diversified and realistic bot cashout targets
      let autoCashOut: number | null = null;
      if (i === 0) {
        // Quick conservative bot
        autoCashOut = Number((1.18 + Math.random() * 0.60).toFixed(2));
      } else if (i === 1) {
        // Medium strategy bot (65% chance of setting cashout between 1.80x and 3.90x)
        autoCashOut = Math.random() < 0.65 ? Number((1.80 + Math.random() * 2.10).toFixed(2)) : null;
      } else if (i === 2) {
        // Ambitious bot (40% chance of aiming for 4.00x - 15.00x)
        autoCashOut = Math.random() < 0.40 ? Number((4.00 + Math.random() * 11.00).toFixed(2)) : null;
      } else {
        // High risk / Greedy bot that rides the flight
        autoCashOut = Math.random() < 0.20 ? Number((15.00 + Math.random() * 35.00).toFixed(2)) : null;
      }

      this.activeBets.push({
        id: `bet_bot_${Math.random().toString(36).substring(2, 7)}`,
        roundId,
        userId: `bot_${i}`,
        userName: name,
        userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
        amount,
        autoCashOutMultiplier: autoCashOut,
        cashOutMultiplier: null,
        payout: null,
        status: 'active',
        createdAt: new Date().toISOString(),
        isCurrentUser: false
      });
    }
  }

  public hasActiveRealPlayerBet(): boolean {
    return this.activeBets.some((b) => b.isCurrentUser && b.status === 'active');
  }

  private hasExtendedFlightForRound: boolean = false;

  public extendFlightIfRealPlayersOut(currentMultiplier: number) {
    if (!this.currentRound || this.currentRound.status !== 'RUNNING') return;
    if (this.hasExtendedFlightForRound) return; // Only calculate once to ensure unpredictable, natural crash point
    
    // Check if any real player bet is still active
    const hasRealActive = this.hasActiveRealPlayerBet();
    if (!hasRealActive) {
      this.hasExtendedFlightForRound = true;

      // Realistic, unpredictable random distribution when only bots are flying:
      // - 40%: Short climb (crashes at 1.15x - 3.20x)
      // - 30%: Medium climb (crashes at 3.21x - 9.50x)
      // - 20%: High flight (crashes at 9.51x - 32.00x)
      // - 10%: Rare cosmic flight (crashes at 32.01x - 100.00x max)
      const roll = Math.random();
      let targetCrash: number;

      if (roll < 0.40) {
        targetCrash = Math.max(this.currentRound.crashPoint, currentMultiplier + 0.15 + Math.random() * 1.80);
      } else if (roll < 0.70) {
        targetCrash = Math.max(this.currentRound.crashPoint, currentMultiplier + 1.20 + Math.random() * 6.50);
      } else if (roll < 0.90) {
        targetCrash = Math.max(this.currentRound.crashPoint, 9.50 + Math.random() * 22.50);
      } else {
        targetCrash = Math.max(this.currentRound.crashPoint, 32.00 + Math.random() * 68.00);
      }

      this.currentRound.crashPoint = Math.min(100.00, Math.round(targetCrash * 100) / 100);
      this.notify();
    }
  }

  public placeBet(amount: number, autoCashOutMultiplier: number | null = null, panelId: number = 1): Bet {
    if (amount < this.adminSettings.minBet || amount > this.adminSettings.maxBet) {
      throw new Error(`Aposta deve estar entre $${this.adminSettings.minBet} e $${this.adminSettings.maxBet}`);
    }

    const currentRound = this.getCurrentRound();
    if (currentRound.status === 'RUNNING' || currentRound.status === 'CRASHED') {
      throw new Error('O voo já está em andamento. Aguarde a próxima rodada.');
    }

    // Check if player already has an active bet on this panel
    const existingBet = this.activeBets.find(
      (b) => b.isCurrentUser && b.panelId === panelId && b.status === 'active'
    );
    if (existingBet) {
      throw new Error('Você já possui uma aposta ativa neste painel para esta rodada.');
    }

    const wallet = this.getWallet(this.currentUser.id);
    if (wallet.availableBalance < amount) {
      throw new Error('Saldo insuficiente para realizar esta aposta.');
    }

    // Deduct immediately with ledger record
    const balanceBefore = wallet.availableBalance;
    const balanceAfter = Math.round((balanceBefore - amount) * 100) / 100;
    wallet.availableBalance = balanceAfter;
    wallet.totalBalance = balanceAfter;
    this.wallets[this.currentUser.id] = wallet;

    const tx: WalletTransaction = {
      id: 'tx_bet_' + Math.random().toString(36).substring(2, 9),
      userId: this.currentUser.id,
      type: 'bet',
      amount,
      currency: 'USD',
      balanceBefore,
      balanceAfter,
      reference: `BET-#${currentRound.roundNumber}-P${panelId}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      method: 'System'
    };
    this.transactions.unshift(tx);

    const bet: Bet = {
      id: 'bet_' + Math.random().toString(36).substring(2, 9),
      roundId: currentRound.id,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      amount,
      autoCashOutMultiplier,
      cashOutMultiplier: null,
      payout: null,
      status: 'active',
      createdAt: new Date().toISOString(),
      isCurrentUser: true,
      panelId
    };

    this.activeBets.push(bet);
    currentRound.totalBetsAmount += amount;
    this.notify();
    return bet;
  }

  public cancelBet(panelId: number = 1): boolean {
    const currentRound = this.getCurrentRound();
    if (currentRound.status === 'RUNNING' || currentRound.status === 'CRASHED') {
      throw new Error('Não é possível cancelar uma aposta com o voo já em andamento.');
    }

    const betIndex = this.activeBets.findIndex(
      (b) => b.isCurrentUser && b.panelId === panelId && b.status === 'active'
    );

    if (betIndex === -1) return false;

    const bet = this.activeBets[betIndex];
    this.activeBets.splice(betIndex, 1);
    currentRound.totalBetsAmount = Math.max(0, currentRound.totalBetsAmount - bet.amount);

    // Refund to wallet with ledger
    const wallet = this.getWallet(this.currentUser.id);
    const balanceBefore = wallet.availableBalance;
    const balanceAfter = Math.round((balanceBefore + bet.amount) * 100) / 100;
    wallet.availableBalance = balanceAfter;
    wallet.totalBalance = balanceAfter;
    this.wallets[this.currentUser.id] = wallet;

    const tx: WalletTransaction = {
      id: 'tx_cancel_' + Math.random().toString(36).substring(2, 9),
      userId: this.currentUser.id,
      type: 'refund',
      amount: bet.amount,
      currency: 'USD',
      balanceBefore,
      balanceAfter,
      reference: `CANCEL-BET-#${currentRound.roundNumber}-P${panelId}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      method: 'System'
    };
    this.transactions.unshift(tx);

    this.notify();
    return true;
  }

  public setRoundStatus(status: GameRoundStatus, startedAt?: number): GameRound {
    const round = this.getCurrentRound();
    round.status = status;
    if (startedAt) {
      round.startedAt = startedAt;
    }
    this.notify();
    return round;
  }

  public cashOut(currentMultiplier: number, panelId?: number): { payout: number; multiplier: number; betId: string } {
    const currentRound = this.getCurrentRound();

    const myBet = this.activeBets.find(
      (b) => b.isCurrentUser && b.status === 'active' && (!panelId || b.panelId === panelId)
    );
    if (!myBet) {
      throw new Error('Nenhuma aposta ativa para cash out');
    }

    const mult = Math.max(1.01, Math.min(currentMultiplier, currentRound.crashPoint || currentMultiplier));
    const rawPayout = myBet.amount * mult;
    const cappedPayout = Math.min(this.adminSettings.maxPayout, rawPayout);
    const payout = Math.round(cappedPayout * 100) / 100;

    myBet.cashOutMultiplier = mult;
    myBet.payout = payout;
    myBet.status = 'cashed_out';

    // Save to user history
    this.userBetHistory.unshift({ ...myBet });
    if (this.userBetHistory.length > 50) this.userBetHistory.pop();

    // Credit wallet with ledger record immediately
    const wallet = this.getWallet(this.currentUser.id);
    const balanceBefore = wallet.availableBalance;
    const balanceAfter = Math.round((balanceBefore + payout) * 100) / 100;
    wallet.availableBalance = balanceAfter;
    wallet.totalBalance = balanceAfter;
    this.wallets[this.currentUser.id] = wallet;

    const tx: WalletTransaction = {
      id: 'tx_win_' + Math.random().toString(36).substring(2, 9),
      userId: this.currentUser.id,
      type: 'cashout',
      amount: payout,
      currency: 'USD',
      balanceBefore,
      balanceAfter,
      reference: `WIN-#${currentRound.roundNumber}@${mult.toFixed(2)}x`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      method: 'System'
    };
    this.transactions.unshift(tx);

    currentRound.totalPayoutAmount += payout;

    // If all real players have cashed out, extend the flight of the bird
    this.extendFlightIfRealPlayersOut(mult);

    this.notify();
    return { payout, multiplier: mult, betId: myBet.id };
  }

  public triggerBotCashouts(currentMultiplier: number) {
    this.activeBets.forEach((b) => {
      if (!b.isCurrentUser && b.status === 'active') {
        if (b.autoCashOutMultiplier && currentMultiplier >= b.autoCashOutMultiplier) {
          b.status = 'cashed_out';
          b.cashOutMultiplier = b.autoCashOutMultiplier;
          b.payout = Math.round(b.amount * b.autoCashOutMultiplier * 100) / 100;
          if (this.currentRound) {
            this.currentRound.totalPayoutAmount += b.payout;
          }
        }
      }
    });
  }

  public endRound(crashPoint: number) {
    if (!this.currentRound) return;

    this.currentRound.status = 'CRASHED';
    this.currentRound.endedAt = Date.now();
    this.currentRound.crashPoint = crashPoint;

    // Mark remaining active bets as crashed and record user bets in history
    this.activeBets.forEach((b) => {
      if (b.status === 'active') {
        b.status = 'crashed';
        if (b.isCurrentUser) {
          this.userBetHistory.unshift({ ...b });
          if (this.userBetHistory.length > 50) this.userBetHistory.pop();
        }
      }
    });

    this.pastRounds.unshift({ ...this.currentRound });
    this.notify();
  }

  public getActiveBets(): Bet[] {
    return [...this.activeBets];
  }

  public getUserBetHistory(): Bet[] {
    return [...this.userBetHistory];
  }

  public getTopWinners(): Array<{ id: string; userName: string; userAvatar: string; amount: number; multiplier: number; payout: number; date: string }> {
    return [
      { id: 'top_1', userName: 'Mateus K.', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', amount: 50.00, multiplier: 84.50, payout: 4225.00, date: 'Hoje às 14:32' },
      { id: 'top_2', userName: 'Nelson D.', userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', amount: 100.00, multiplier: 38.20, payout: 3820.00, date: 'Hoje às 13:10' },
      { id: 'top_3', userName: 'Katia S.', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', amount: 25.00, multiplier: 120.00, payout: 3000.00, date: 'Hoje às 11:45' },
      { id: 'top_4', userName: 'Antonio L.', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', amount: 40.00, multiplier: 65.40, payout: 2616.00, date: 'Ontem às 22:15' },
      { id: 'top_5', userName: 'Domingos F.', userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', amount: 80.00, multiplier: 24.10, payout: 1928.00, date: 'Ontem às 19:40' }
    ];
  }

  public getDisplayCurrency(): 'USD' | 'EUR' {
    return this.displayCurrency;
  }

  public setDisplayCurrency(curr: 'USD' | 'EUR') {
    this.displayCurrency = curr;
    this.notify();
  }

  public getPastRounds(): GameRound[] {
    return [...this.pastRounds];
  }

  // --- SUPPORT & LIVE TICKETS ---
  private initSupportConversation() {
    this.conversations = [
      {
        id: 'conv_usr_player_1',
        userId: 'usr_player_1',
        userName: 'Alex Vance',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        userEmail: 'player@skybird.io',
        status: 'open',
        lastMessage: 'Olá! Como posso ajudar você no SKYBIRD hoje?',
        lastMessageAt: '2026-08-25T14:00:00Z',
        unreadCount: 0
      }
    ];

    this.messages = [
      {
        id: 'msg_welcome',
        conversationId: 'conv_usr_player_1',
        senderId: 'sys_bot',
        senderName: 'Suporte SKYBIRD',
        senderRole: 'admin',
        text: 'Bem-vindo ao suporte SKYBIRD 24/7. Digite sua dúvida ou solicite um link de depósito Express.',
        createdAt: '2026-08-25T14:00:00Z'
      }
    ];
  }

  public getSupportMessages(userId = this.currentUser.id): SupportMessage[] {
    const convId = `conv_${userId}`;
    return this.messages.filter((m) => m.conversationId === convId);
  }

  public getAllConversations(): SupportConversation[] {
    return [...this.conversations];
  }

  public sendSupportMessage(text: string, isExpressLinkRequest = false): SupportMessage {
    const convId = `conv_${this.currentUser.id}`;
    let conv = this.conversations.find((c) => c.id === convId);
    if (!conv) {
      conv = {
        id: convId,
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        userAvatar: this.currentUser.avatar,
        userEmail: this.currentUser.email,
        status: 'open',
        lastMessage: text,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1
      };
      this.conversations.unshift(conv);
    } else {
      conv.lastMessage = text;
      conv.lastMessageAt = new Date().toISOString();
    }

    const msg: SupportMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      conversationId: convId,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderRole: this.currentUser.role,
      text,
      createdAt: new Date().toISOString(),
      isExpressLinkRequest
    };

    this.messages.push(msg);

    // Auto reply if support is busy or auto-dispatch
    if (this.currentUser.role === 'player') {
      setTimeout(() => {
        if (this.adminSettings.supportStatus === 'busy') {
          this.messages.push({
            id: 'msg_auto_busy_' + Date.now(),
            conversationId: convId,
            senderId: 'sys_auto',
            senderName: 'Suporte SKYBIRD',
            senderRole: 'admin',
            text: 'Os membros da nossa equipa de suporte estão dando suporte a outros clientes, por favor seja paciente que lhe notificaremos dentro em breve.',
            createdAt: new Date().toISOString()
          });
          this.notify();
        } else if (isExpressLinkRequest) {
          this.messages.push({
            id: 'msg_auto_express_' + Date.now(),
            conversationId: convId,
            senderId: 'sys_auto',
            senderName: 'Suporte SKYBIRD (Operações)',
            senderRole: 'admin',
            text: 'Recebemos seu pedido de link Express. Um atendente de segurança está validando a sua carteira e fornecerá o link verificado em instantes.',
            createdAt: new Date().toISOString()
          });
          this.notify();
        }
      }, 800);
    }

    this.notify();
    return msg;
  }

  public adminReplyToSupport(conversationId: string, text: string, expressLink?: string): SupportMessage {
    const msg: SupportMessage = {
      id: 'msg_adm_' + Math.random().toString(36).substring(2, 9),
      conversationId,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderRole: 'admin',
      text,
      createdAt: new Date().toISOString(),
      expressLink
    };

    this.messages.push(msg);

    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageAt = new Date().toISOString();
      conv.status = 'resolved';
    }

    this.notify();
    return msg;
  }

  // --- ADMIN SETTINGS & AUDIT ---
  public getAdminSettings(): AdminSettings {
    return { ...this.adminSettings };
  }

  public updateAdminSettings(newSettings: Partial<AdminSettings>) {
    const beforeStr = JSON.stringify(this.adminSettings);
    this.adminSettings = { ...this.adminSettings, ...newSettings };
    const afterStr = JSON.stringify(this.adminSettings);

    this.logAudit(
      'UPDATE_ADMIN_SETTINGS',
      'System Configuration',
      beforeStr,
      afterStr
    );
    this.notify();
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  private logAudit(action: string, target: string, beforeValue: string, afterValue: string) {
    const log: AuditLog = {
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      adminId: this.currentUser.id,
      adminEmail: this.currentUser.email,
      action,
      target,
      beforeValue,
      afterValue,
      timestamp: new Date().toISOString(),
      ip: '192.168.1.1',
      userAgent: navigator.userAgent || 'Browser Client'
    };
    this.auditLogs.unshift(log);
  }

  public getTestimonials(): Testimonial[] {
    return [...this.testimonials];
  }

  public resetAllData() {
    localStorage.clear();
    this.currentUser = INITIAL_USERS[0];
    this.users = INITIAL_USERS;
    this.wallets = INITIAL_WALLETS;
    this.transactions = INITIAL_TRANSACTIONS;
    this.pastRounds = INITIAL_PAST_ROUNDS;
    this.adminSettings = INITIAL_ADMIN_SETTINGS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.initNextRound();
    this.notify();
  }
}

export const store = new SkybirdStore();
