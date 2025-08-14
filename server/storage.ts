import {
  users,
  campaigns,
  contributions,
  transactions,
  aiInteractions,
  type User,
  type UpsertUser,
  type Campaign,
  type InsertCampaign,
  type Contribution,
  type InsertContribution,
  type Transaction,
  type InsertTransaction,
  type AiInteraction,
  type InsertAiInteraction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

// Interface for storage operations
export interface IStorage {
  // User operations (manual authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Session store for authentication
  sessionStore: any;
  
  // Campaign operations
  getCampaigns(filters?: {
    category?: string;
    status?: string;
    creatorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;
  
  // Contribution operations
  getContributions(campaignId?: string, backerId?: string): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  
  // Transaction operations
  getTransactions(filters?: {
    campaignId?: string;
    transactionType?: string;
    limit?: number;
  }): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // AI interaction operations
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;
  getAiInteractions(userId: string, campaignId?: string): Promise<AiInteraction[]>;
  
  // Statistics
  getCampaignStats(): Promise<{
    totalRaised: string;
    activeCampaigns: number;
    totalBackers: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations (manual authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        id: userData.id || sql`gen_random_uuid()`,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Campaign operations
  async getCampaigns(filters?: {
    category?: string;
    status?: string;
    creatorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Campaign[]> {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(campaigns.category, filters.category));
    }
    if (filters?.status) {
      conditions.push(eq(campaigns.status, filters.status));
    }
    if (filters?.creatorId) {
      conditions.push(eq(campaigns.creatorId, filters.creatorId));
    }

    let query = db.select().from(campaigns);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(desc(campaigns.createdAt));
    
    if (filters?.limit && filters?.offset) {
      return results.slice(filters.offset, filters.offset + filters.limit);
    } else if (filters?.limit) {
      return results.slice(0, filters.limit);
    }
    
    return results;
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values({
        ...campaignData,
        currentAmount: "0",
        backerCount: 0,
        credibilityScore: "0.0",
      })
      .returning();
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    
    return campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Contribution operations
  async getContributions(campaignId?: string, backerId?: string): Promise<Contribution[]> {
    const conditions = [];
    if (campaignId) {
      conditions.push(eq(contributions.campaignId, campaignId));
    }
    if (backerId) {
      conditions.push(eq(contributions.backerId, backerId));
    }

    let query = db.select().from(contributions);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(contributions.createdAt));
  }

  async createContribution(contributionData: InsertContribution): Promise<Contribution> {
    const [contribution] = await db
      .insert(contributions)
      .values(contributionData)
      .returning();

    // Update campaign current amount and backer count
    await db
      .update(campaigns)
      .set({
        currentAmount: sql`${campaigns.currentAmount} + ${contributionData.amount}`,
        backerCount: sql`${campaigns.backerCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, contributionData.campaignId));
    
    return contribution;
  }

  // Transaction operations
  async getTransactions(filters?: {
    campaignId?: string;
    transactionType?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    const conditions = [];
    if (filters?.campaignId) {
      conditions.push(eq(transactions.campaignId, filters.campaignId));
    }
    if (filters?.transactionType) {
      conditions.push(eq(transactions.transactionType, filters.transactionType));
    }

    let query = db.select().from(transactions);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(desc(transactions.createdAt));

    if (filters?.limit) {
      return results.slice(0, filters.limit);
    }

    return results;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  // AI interaction operations
  async createAiInteraction(interactionData: InsertAiInteraction): Promise<AiInteraction> {
    const [interaction] = await db
      .insert(aiInteractions)
      .values(interactionData)
      .returning();
    return interaction;
  }

  async getAiInteractions(userId: string, campaignId?: string): Promise<AiInteraction[]> {
    let query = db.select().from(aiInteractions);
    
    if (campaignId) {
      query = query.where(and(eq(aiInteractions.userId, userId), eq(aiInteractions.campaignId, campaignId))) as any;
    } else {
      query = query.where(eq(aiInteractions.userId, userId)) as any;
    }

    return await query.orderBy(desc(aiInteractions.createdAt));
  }

  // Statistics
  async getCampaignStats(): Promise<{
    totalRaised: string;
    activeCampaigns: number;
    totalBackers: number;
    successRate: number;
  }> {
    const [statsResult] = await db
      .select({
        totalRaised: sql<string>`COALESCE(SUM(CAST(${campaigns.currentAmount} AS DECIMAL)), 0)`,
        totalCampaigns: count(campaigns.id),
        activeCampaigns: sql<number>`COUNT(CASE WHEN ${campaigns.status} = 'active' THEN 1 END)`,
        completedCampaigns: sql<number>`COUNT(CASE WHEN ${campaigns.status} = 'completed' THEN 1 END)`,
      })
      .from(campaigns);

    const [backersResult] = await db
      .select({
        totalBackers: sql<number>`COUNT(DISTINCT ${contributions.backerId})`,
      })
      .from(contributions)
      .where(sql`${contributions.backerId} IS NOT NULL`);

    const totalBackers = backersResult?.totalBackers || 0;
    const successRate = statsResult.totalCampaigns > 0 
      ? (statsResult.completedCampaigns / statsResult.totalCampaigns) * 100 
      : 0;

    return {
      totalRaised: parseFloat(statsResult.totalRaised).toFixed(1),
      activeCampaigns: statsResult.activeCampaigns,
      totalBackers,
      successRate: parseFloat(successRate.toFixed(1)),
    };
  }
}

export const storage = new DatabaseStorage();