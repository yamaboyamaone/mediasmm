export type PlatformType =
  | 'all'
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'telegram'
  | 'facebook'
  | 'twitter'
  | 'threads'
  | 'discord'
  | 'spotify'
  | 'applemusic'
  | 'audiomack'
  | 'boomplay'
  | 'soundcloud';

export type ServiceBadge =
  | 'HOT'
  | 'BESTSELLER'
  | 'CHEAPEST'
  | 'NON-DROP'
  | 'AUTO-REFILL'
  | 'REAL-ACTIVE'
  | 'INSTANT'
  | 'EXCLUSIVE';

export interface SmmService {
  id: number;
  platform: PlatformType;
  category: string;
  name: string;
  ratePer1000: number; // in USD
  min: number;
  max: number;
  avgTime: string;
  speed: string;
  guarantee: string;
  badge?: ServiceBadge;
  description: string;
  linkExample: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'In Progress'
  | 'Completed'
  | 'Partial'
  | 'Canceled';

export interface SmmOrder {
  id: string;
  serviceId: number;
  serviceName: string;
  platform: PlatformType;
  link: string;
  quantity: number;
  charge: number;
  startCount: number;
  currentCount: number;
  remains: number;
  status: OrderStatus;
  createdAt: string;
  refillAvailable: boolean;
  refillRequested?: boolean;
  speedUpRequested?: boolean;
  dripFeed?: {
    runs: number;
    intervalMinutes: number;
    totalQuantity: number;
  };
}

export type Currency = 
  | 'USD' 
  | 'NGN' 
  | 'GHS' 
  | 'XAF' 
  | 'XOF' 
  | 'EUR' 
  | 'GBP' 
  | 'BRL' 
  | 'INR';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rateFromUSD: number;
  flag: string;
  country: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  type: 'Order Refill' | 'Speed Up' | 'Payment Issue' | 'API Question' | 'General';
  orderId?: string;
  status: 'Open' | 'Answered' | 'Closed';
  createdAt: string;
  lastReply: string;
  messages: {
    sender: 'user' | 'support';
    text: string;
    timestamp: string;
  }[];
}

export interface PaymentGateway {
  id: string;
  name: string;
  iconName: string;
  fee: string;
  bonusPercentage: number;
  minDeposit: number;
  description: string;
}

export interface OwnerBankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  country: string; // 'Nigeria' | 'Ghana' | 'Cameroon' etc.
  instructions?: string;
  whatsappNumber?: string;
}
