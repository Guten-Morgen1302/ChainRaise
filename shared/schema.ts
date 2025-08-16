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
  kycStatus: varchar("kyc_status").default("pending"), // pending, approved, rejected
  kycDocuments: jsonb("kyc_documents"),
  role: varchar("role").default("user"), // user, admin
  isFlagged: boolean("is_flagged").default(false),
  flaggedReason: text("flagged_reason"),
  flaggedBy: varchar("flagged_by"),
  flaggedAt: timestamp("flagged_at"),
  profileCompletion: integer("profile_completion").default(0),
  joinDate: timestamp("join_date").defaultNow(),
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
  status: varchar("status").default("pending_approval"), // pending_approval, active, completed, cancelled, rejected
  smartContractAddress: varchar("smart_contract_address"),
  tags: text("tags").array(),
  rewards: jsonb("rewards"),
  updates: jsonb("updates"),
  credibilityScore: decimal("credibility_score", { precision: 3, scale: 1 }).default("0.0"),
  backerCount: integer("backer_count").default(0),
  adminComments: text("admin_comments"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  isEditedAfterApproval: boolean("is_edited_after_approval").default(false),
  originalApprovalDate: timestamp("original_approval_date"),
  editCount: integer("edit_count").default(0),
  lastEditedAt: timestamp("last_edited_at"),
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

// Avalanche wallet transactions table
export const avalancheTransactions = pgTable("avalanche_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Made nullable for anonymous demo transactions
  campaignId: varchar("campaign_id").references(() => campaigns.id), // Made nullable for demo transactions
  transactionHash: varchar("transaction_hash").unique().notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  walletAddress: varchar("wallet_address").notNull(),
  transactionType: varchar("transaction_type").default("avalanche"), // funding, refund, milestone, avalanche
  status: varchar("status").default("completed"), // pending, completed, failed
  blockNumber: varchar("block_number"),
  gasUsed: varchar("gas_used"),
  gasPrice: varchar("gas_price"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KYC Applications table
export const kycApplications = pgTable("kyc_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  dateOfBirth: varchar("date_of_birth").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  country: varchar("country").notNull(),
  idType: varchar("id_type").notNull(), // passport, driver_license, national_id
  idNumber: varchar("id_number").notNull(),
  occupation: varchar("occupation").notNull(),
  sourceOfFunds: varchar("source_of_funds").notNull(),
  monthlyIncome: varchar("monthly_income").notNull(),
  idFrontImageUrl: varchar("id_front_image_url"),
  idBackImageUrl: varchar("id_back_image_url"),
  selfieImageUrl: varchar("selfie_image_url"),
  status: varchar("status").default("pending"), // pending, approved, rejected, under_review
  adminComments: text("admin_comments"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  role: varchar("role").default("admin"), // admin, super_admin
  permissions: text("permissions").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
}).extend({
  deadline: z.union([z.date(), z.string()]).transform((val) => {
    return typeof val === 'string' ? new Date(val) : val;
  }),
});

export const insertKycApplicationSchema = createInsertSchema(kycApplications).omit({
  id: true,
  status: true,
  adminComments: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
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

// Reinstatement Requests table
export const reinstatementRequests = pgTable("reinstatement_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  additionalInfo: text("additional_info"),
  status: varchar("status").default("pending"), // pending, approved, rejected
  adminComments: text("admin_comments"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Notifications table
export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // info, success, warning, error
  isRead: boolean("is_read").default(false),
  relatedCampaignId: varchar("related_campaign_id"),
  relatedKycId: varchar("related_kyc_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReinstatementRequestSchema = createInsertSchema(reinstatementRequests).omit({
  id: true,
  status: true,
  adminComments: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export const insertAvalancheTransactionSchema = createInsertSchema(avalancheTransactions).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type AvalancheTransaction = typeof avalancheTransactions.$inferSelect;
export type InsertAvalancheTransaction = z.infer<typeof insertAvalancheTransactionSchema>;

export type KycApplication = typeof kycApplications.$inferSelect;
export type InsertKycApplication = z.infer<typeof insertKycApplicationSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;

export type ReinstatementRequest = typeof reinstatementRequests.$inferSelect;
export type InsertReinstatementRequest = z.infer<typeof insertReinstatementRequestSchema>;

export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
