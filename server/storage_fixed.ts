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

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const result = await db
        .insert(users)
        .values({
          ...userData,
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
      return result[0];
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  // Campaign operations
  async getCampaigns(filters?: {
    category?: string;
    status?: string;
    creatorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Campaign[]> {
    try {
      let query = db.select().from(campaigns);
      
      // Build where conditions
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

      // Apply where conditions
      if (conditions.length === 1) {
        query = query.where(conditions[0]);
      } else if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }

      // Apply ordering
      query = query.orderBy(desc(campaigns.createdAt));

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.offset(filters.offset);
      }

      return await query;
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return [];
    }
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    try {
      const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting campaign:', error);
      return undefined;
    }
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    try {
      const result = await db
        .insert(campaigns)
        .values({
          ...campaignData,
          currentAmount: "0",
          backerCount: 0,
          credibilityScore: "0.0",
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    try {
      const result = await db
        .update(campaigns)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(campaigns.id, id))
        .returning();
      
      if (!result[0]) {
        throw new Error("Campaign not found");
      }
      
      return result[0];
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      await db.delete(campaigns).where(eq(campaigns.id, id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  // Contribution operations
  async getContributions(campaignId?: string, backerId?: string): Promise<Contribution[]> {
    try {
      let query = db.select().from(contributions);
      
      const conditions = [];
      if (campaignId) {
        conditions.push(eq(contributions.campaignId, campaignId));
      }
      if (backerId) {
        conditions.push(eq(contributions.backerId, backerId));
      }

      if (conditions.length === 1) {
        query = query.where(conditions[0]);
      } else if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }

      return await query.orderBy(desc(contributions.createdAt));
    } catch (error) {
      console.error('Error getting contributions:', error);
      return [];
    }
  }

  async createContribution(contributionData: InsertContribution): Promise<Contribution> {
    try {
      const result = await db
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
      
      return result[0];
    } catch (error) {
      console.error('Error creating contribution:', error);
      throw error;
    }
  }

  // Transaction operations
  async getTransactions(filters?: {
    campaignId?: string;
    transactionType?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    try {
      let query = db.select().from(transactions);
      
      const conditions = [];
      if (filters?.campaignId) {
        conditions.push(eq(transactions.campaignId, filters.campaignId));
      }
      if (filters?.transactionType) {
        conditions.push(eq(transactions.transactionType, filters.transactionType));
      }

      if (conditions.length === 1) {
        query = query.where(conditions[0]);
      } else if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }

      query = query.orderBy(desc(transactions.createdAt));

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      return await query;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    try {
      const result = await db
        .insert(transactions)
        .values(transactionData)
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // AI interaction operations
  async createAiInteraction(interactionData: InsertAiInteraction): Promise<AiInteraction> {
    try {
      const result = await db
        .insert(aiInteractions)
        .values(interactionData)
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating AI interaction:', error);
      throw error;
    }
  }

  async getAiInteractions(userId: string, campaignId?: string): Promise<AiInteraction[]> {
    try {
      let query = db.select().from(aiInteractions);

      if (campaignId) {
        query = query.where(
          and(
            eq(aiInteractions.userId, userId),
            eq(aiInteractions.campaignId, campaignId)
          )
        );
      } else {
        query = query.where(eq(aiInteractions.userId, userId));
      }

      return await query.orderBy(desc(aiInteractions.createdAt));
    } catch (error) {
      console.error('Error getting AI interactions:', error);
      return [];
    }
  }

  // Statistics
  async getCampaignStats(): Promise<{
    totalRaised: string;
    activeCampaigns: number;
    totalBackers: number;
    successRate: number;
  }> {
    try {
      // Get total raised amount
      const totalRaisedResult = await db
        .select({ total: sum(contributions.amount) })
        .from(contributions)
        .where(eq(contributions.status, 'confirmed'));

      // Get active campaigns count
      const activeCampaignsResult = await db
        .select({ count: count() })
        .from(campaigns)
        .where(eq(campaigns.status, 'active'));

      // Get total backers (unique contributors)
      const totalBackersResult = await db
        .selectDistinct({ backerId: contributions.backerId })
        .from(contributions)
        .where(eq(contributions.status, 'confirmed'));

      // Get total campaigns for success rate calculation
      const totalCampaignsResult = await db
        .select({ count: count() })
        .from(campaigns);

      const successfulCampaignsResult = await db
        .select({ count: count() })
        .from(campaigns)
        .where(eq(campaigns.status, 'completed'));

      const totalRaised = totalRaisedResult[0]?.total || "0";
      const activeCampaigns = activeCampaignsResult[0]?.count || 0;
      const totalBackers = totalBackersResult.length || 0;
      const totalCampaigns = totalCampaignsResult[0]?.count || 0;
      const successfulCampaigns = successfulCampaignsResult[0]?.count || 0;
      const successRate = totalCampaigns > 0 ? (successfulCampaigns / totalCampaigns) * 100 : 0;

      return {
        totalRaised: totalRaised.toString(),
        activeCampaigns,
        totalBackers,
        successRate,
      };
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      return {
        totalRaised: "0.0",
        activeCampaigns: 0,
        totalBackers: 0,
        successRate: 0,
      };
    }
  }
}

export const storage = new DatabaseStorage();