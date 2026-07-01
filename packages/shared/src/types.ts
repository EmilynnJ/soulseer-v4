import type { ReadingType, Role, ReadingStatus, TransactionType } from './constants';

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  avatar_url: string | null;
  balance_cents: number;
  is_online: boolean;
  bio: string | null;
  created_at: string;
}

export interface Reader {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  specialties: string[];
  chat_rate_cents: number;
  voice_rate_cents: number;
  video_rate_cents: number;
  is_online: boolean;
  rating_avg: number;
  rating_count: number;
}

export interface Reading {
  id: string;
  client_id: string;
  reader_id: string;
  type: ReadingType;
  status: ReadingStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  rate_cents_per_min: number;
  total_charged_cents: number;
  reader_earned_cents: number;
  platform_fee_cents: number;
  transcript: ChatMessage[] | null;
  client_rating: number | null;
  client_review: string | null;
  created_at: string;
}

export interface ChatMessage {
  sender_id: string;
  content: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount_cents: number;
  reading_id: string | null;
  stripe_payment_intent_id: string | null;
  note: string | null;
  created_at: string;
}

export interface ForumPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  title: string;
  body: string;
  pinned: boolean;
  deleted: boolean;
  created_at: string;
  reply_count: number;
}

export interface ForumReply {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  body: string;
  deleted: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  reading_id: string;
  client_id: string;
  reader_id: string;
  rating: number;
  review: string | null;
  created_at: string;
}

export interface SessionTokenResponse {
  sessionToken: string;
  roomName: string;
  readingId: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
