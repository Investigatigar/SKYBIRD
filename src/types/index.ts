export type UserRole = 'player' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLoginAt: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'cashout' | 'refund';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: 'USD' | 'EUR';
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  status: TransactionStatus;
  createdAt: string;
  method?: 'Airtm' | 'System';
}

export interface Wallet {
  userId: string;
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
  currency: 'USD' | 'EUR';
}

export type GameRoundStatus = 'WAITING' | 'COUNTDOWN' | 'RUNNING' | 'CRASHED' | 'FINISHED';

export interface GameRound {
  id: string;
  roundNumber: number;
  status: GameRoundStatus;
  startedAt: number | null;
  endedAt: number | null;
  crashPoint: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  totalBetsAmount: number;
  totalPayoutAmount: number;
  createdAt: string;
}

export type CurrencyType = 'USD' | 'EUR';

export interface Bet {
  id: string;
  roundId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number;
  autoCashOutMultiplier: number | null;
  cashOutMultiplier: number | null;
  payout: number | null;
  status: 'active' | 'cashed_out' | 'crashed';
  createdAt: string;
  isCurrentUser?: boolean;
  panelId?: number;
}

export type AltitudeStage = 
  | 'STAGE_1_BLUE_SKY'       // 1.00x - 1.50x
  | 'STAGE_2_HIGH_CLOUDS'     // 1.50x - 2.50x
  | 'STAGE_3_RAIN_LIGHTNING'  // 2.50x - 4.50x
  | 'STAGE_4_STORM_DEBRIS'    // 4.50x - 8.00x
  | 'STAGE_5_MESOSPHERE'      // 8.00x - 15.00x
  | 'STAGE_6_COSMIC_SPACE';   // 15.00x+

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: string;
  isExpressLinkRequest?: boolean;
  expressLink?: string;
}

export interface SupportConversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userEmail: string;
  status: 'open' | 'pending' | 'resolved';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface AdminSettings {
  gameEnabled: boolean;
  maintenanceMode: boolean;
  minBet: number;
  maxBet: number;
  maxPayout: number;
  globalRtp: number;      // e.g. 97.0
  houseEdge: number;      // e.g. 3.0
  supportStatus: 'online' | 'busy' | 'offline';
  demoMode: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  target: string;
  beforeValue: string;
  afterValue: string;
  timestamp: string;
  ip: string;
  userAgent: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  comment: string;
  rating: number;
  role: string;
  multiplierWon?: string;
}

export type GraphicQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SoundConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}
