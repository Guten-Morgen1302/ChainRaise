import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (manual authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  walletAddress: varchar("wallet_address"),
  kycStatus: varchar("kyc_status").default("pending"), // pending, verified, rejected
  kycDocuments: jsonb("kyc_documents"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  fundingType: varchar("funding_type").notNull(), // donation, reward, equity
  goalAmount: decimal("goal_amount", { precision: 18, scale: 8 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 18, scale: 8 }).default("0"),
  currency: varchar("currency").default("ETH"),
  deadline: timestamp("deadline").notNull(),
  imageUrl: varchar("image_url"),
  status: varchar("status").default("active"), // active, completed, cancelled
  smartContractAddress: varchar("smart_contract_address"),
  tags: text("tags").array(),
  rewards: jsonb("rewards"),
  updates: jsonb("updates"),
  credibilityScore: decimal("credibility_score", { precision: 3, scale: 1 }).default("0.0"),
  backerCount: integer("backer_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contributions table
export const contributions = pgTable("contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id).notNull(),
  backerId: varchar("backer_id").references(() => users.id),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: varchar("currency").default("ETH"),
  transactionHash: varchar("transaction_hash"),
  paymentMethod: varchar("payment_method").notNull(), // crypto, fiat
  isAnonymous: boolean("is_anonymous").default(false),
  message: text("message"),
  rewardTier: varchar("reward_tier"),
  status: varchar("status").default("confirmed"), // pending, confirmed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Blockchain transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hash: varchar("hash").unique().notNull(),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  fromAddress: varchar("from_address"),
  toAddress: varchar("to_address"),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  gasUsed: varchar("gas_used"),
  gasPrice: varchar("gas_price"),
  blockNumber: varchar("block_number"),
  transactionType: varchar("transaction_type").notNull(), // contribution, withdrawal, contract_creation
  status: varchar("status").default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Assistant interactions
export const aiInteractions = pgTable("ai_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  interactionType: varchar("interaction_type").notNull(), // title_optimization, description_enhancement, credibility_analysis
  inputData: jsonb("input_data").notNull(),
  outputData: jsonb("output_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  currentAmount: true,
  backerCount: true,
  credibilityScore: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;
