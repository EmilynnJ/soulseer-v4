export const COMMISSION_READER = 0.60;
export const COMMISSION_PLATFORM = 0.40;
export const GRACE_PERIOD_MS = 2 * 60 * 1000;
export const BILLING_TICK_INTERVAL_MS = 60 * 1000;

export const READING_TYPES = ['chat', 'voice', 'video'] as const;
export type ReadingType = typeof READING_TYPES[number];

export const ROLES = ['client', 'reader', 'admin'] as const;
export type Role = typeof ROLES[number];

export const READING_STATUS = [
  'pending', 'active', 'completed', 'cancelled', 'disputed'
] as const;
export type ReadingStatus = typeof READING_STATUS[number];

export const TRANSACTION_TYPES = [
  'top_up', 'reading_charge', 'reader_earning',
  'platform_fee', 'refund', 'adjustment', 'payout'
] as const;
export type TransactionType = typeof TRANSACTION_TYPES[number];
