import { pgTable, serial, text, integer, boolean, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['client', 'reader', 'admin']);
export const readingTypeEnum = pgEnum('reading_type', ['chat', 'voice', 'video']);
export const readingStatusEnum = pgEnum('reading_status', ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'refunded']);
export const transactionTypeEnum = pgEnum('transaction_type', ['top_up', 'reading_charge', 'payout', 'adjustment']);
export const forumCategoryEnum = pgEnum('forum_category', ['general', 'readings', 'spiritual_growth', 'ask_a_reader', 'announcements']);

// Commission split config (single source of truth)
export const READER_COMMISSION = 0.60;
export const PLATFORM_COMMISSION = 0.40;

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  supabaseId: text('supabase_id').notNull().unique(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: userRoleEnum('role').notNull().default('client'),
  bio: text('bio'),
  specialties: text('specialties').array(),
  profileImage: text('profile_image'),
  pricingChat: integer('pricing_chat').default(0),
  pricingVoice: integer('pricing_voice').default(0),
  pricingVideo: integer('pricing_video').default(0),
  accountBalance: integer('account_balance').notNull().default(0),
  isOnline: boolean('is_online').notNull().default(false),
  stripeAccountId: text('stripe_account_id'),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Readings table
export const readings = pgTable('readings', {
  id: serial('id').primaryKey(),
  readerId: integer('reader_id').notNull().references(() => users.id),
  clientId: integer('client_id').notNull().references(() => users.id),
  type: readingTypeEnum('type').notNull(),
  status: readingStatusEnum('status').notNull().default('pending'),
  pricePerMinute: integer('price_per_minute').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  duration: integer('duration').default(0),
  totalPrice: integer('total_price').default(0),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  chatTranscript: jsonb('chat_transcript'),
  rating: integer('rating'),
  review: text('review'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: transactionTypeEnum('type').notNull(),
  amount: integer('amount').notNull(),
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  readingId: integer('reading_id').references(() => readings.id),
  stripeId: text('stripe_id'),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Forum posts table
export const forumPosts = pgTable('forum_posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: forumCategoryEnum('category').notNull().default('general'),
  flagCount: integer('flag_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Forum comments table
export const forumComments = pgTable('forum_comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => forumPosts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  flagCount: integer('flag_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Forum flags table
export const forumFlags = pgTable('forum_flags', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => forumPosts.id),
  commentId: integer('comment_id').references(() => forumComments.id),
  reporterId: integer('reporter_id').notNull().references(() => users.id),
  reason: text('reason'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  readingsAsReader: many(readings, { relationName: 'reader' }),
  readingsAsClient: many(readings, { relationName: 'client' }),
  transactions: many(transactions),
  forumPosts: many(forumPosts),
  forumComments: many(forumComments),
}));

export const readingsRelations = relations(readings, ({ one, many }) => ({
  reader: one(users, { fields: [readings.readerId], references: [users.id], relationName: 'reader' }),
  client: one(users, { fields: [readings.clientId], references: [users.id], relationName: 'client' }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  reading: one(readings, { fields: [transactions.readingId], references: [readings.id] }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  user: one(users, { fields: [forumPosts.userId], references: [users.id] }),
  comments: many(forumComments),
  flags: many(forumFlags),
}));

export const forumCommentsRelations = relations(forumComments, ({ one, many }) => ({
  post: one(forumPosts, { fields: [forumComments.postId], references: [forumPosts.id] }),
  user: one(users, { fields: [forumComments.userId], references: [users.id] }),
  flags: many(forumFlags),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Reading = typeof readings.$inferSelect;
export type InsertReading = typeof readings.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;
export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = typeof forumComments.$inferInsert;
