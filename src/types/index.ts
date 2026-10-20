export type Language = 'pt' | 'en' | 'es';

export interface DiamondTask {
  id: string;
  title: string;
  sector: string;
  caratWeight: string;
  purityGrade: string;
  reward: number;
  lotCode: string;
  description: string;
  miningRatePerHour: number;
  status: 'ready_to_claim' | 'extracted' | 'mining';
  progressPercent: number;
}

export interface User {
  id: string;
  phone: string;
  phoneCode: string;
  email?: string;
  password?: string;
  inviteCode: string;
  invitedBy?: string;
  vipLevel: number;
  balance: number;
  depositBalance: number;
  todayEarnings: number;
  yesterdayEarnings: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  tasksCompletedToday: number;
  luckyDrawSpins: number;
  token: string;
  avatar: string;
  createdAt: string;
  payPasswordSet: boolean;
  totalCaratsExtracted: number;
  cycleTargetTime?: number;
  bankAccount?: {
    accountType: 'multicaixa' | 'pix' | 'usdt';
    accountName: string;
    accountNumber: string;
    bankName?: string;
  };
}

export interface VIPTier {
  id: number;
  name: string;
  title: string;
  price: number;
  dailyTasks: number;
  rewardPerTask: number;
  dailyIncome: number;
  monthlyIncome: number;
  validDays: number;
  total120Days: number;
  caratCapacity: string;
  diamondCut: string;
  diamondImage: string;
  accentColor: string;
  isPopular?: boolean;
}

export interface Transaction {
  id: string;
  userId?: string;
  type: 'recharge' | 'withdraw' | 'task_reward' | 'vip_upgrade' | 'referral_bonus' | 'lucky_draw' | 'fund_interest';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  note: string;
  timestamp?: number;
  txHash?: string;
}

export interface FundPlan {
  id: string;
  title: string;
  durationDays: number;
  dailyYieldPercent: number;
  minAmount: number;
  maxAmount: number;
  badge: string;
  totalReturnsPercent: number;
  caratYield: string;
}

export interface UserInvestment {
  id: string;
  userId?: string;
  planId: string;
  planTitle: string;
  amount: number;
  startDate: string;
  daysRemaining: number;
  accruedYield: number;
  totalProjected: number;
  status: 'active' | 'completed';
}

export interface TeamMember {
  id: string;
  phone: string;
  level: 1 | 2 | 3;
  joinDate: string;
  vipLevel: number;
  commissionEarned: number;
}

export interface Announcement {
  id: string;
  text: string;
  type?: 'extraction' | 'concession' | 'withdrawal' | 'deposit';
  timestamp?: number;
  active?: boolean;
}

export interface ConcessionStats {
  id: string;
  totalCaratsMined: number;
  activeOperatorsCount: number;
  totalDistributedKz: number;
  concessionStatus: string;
  updatedAt: string;
}
