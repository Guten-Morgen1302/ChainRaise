import {
  users,
  campaigns,
  contributions,
  transactions,
  avalancheTransactions,
  aiInteractions,
  kycApplications,
  adminUsers,
  reinstatementRequests,
  userNotifications,
  type User,
  type InsertUser,
  type Campaign,
  type InsertCampaign,
  type Contribution,
  type InsertContribution,
  type Transaction,
  type InsertTransaction,
  type AvalancheTransaction,
  type InsertAvalancheTransaction,
  type AiInteraction,
  type InsertAiInteraction,
  type KycApplication,
  type InsertKycApplication,
  type AdminUser,
  type InsertAdminUser,
  type ReinstatementRequest,
  type InsertReinstatementRequest,
  type UserNotification,
  type InsertUserNotification,
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
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
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
  
  // Avalanche transaction operations
  getAvalancheTransactions(filters?: {
    campaignId?: string;
    walletAddress?: string;
    status?: string;
    limit?: number;
  }): Promise<AvalancheTransaction[]>;
  createAvalancheTransaction(transaction: InsertAvalancheTransaction): Promise<AvalancheTransaction>;
  updateAvalancheTransaction(id: string, updates: Partial<AvalancheTransaction>): Promise<AvalancheTransaction>;
  
  // AI interaction operations
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;
  getAiInteractions(userId: string, campaignId?: string): Promise<AiInteraction[]>;
  
  // KYC operations
  createKycApplication(application: InsertKycApplication): Promise<KycApplication>;
  getKycApplication(userId: string): Promise<KycApplication | undefined>;
  getKycApplicationById(id: string): Promise<KycApplication | undefined>;
  getAllKycApplications(status?: string): Promise<KycApplication[]>;
  updateKycApplication(id: string, updates: Partial<KycApplication>): Promise<KycApplication>;
  
  // Admin operations
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  
  // Statistics
  getCampaignStats(): Promise<{
    totalRaised: string;
    activeCampaigns: number;
    totalBackers: number;
    successRate: number;
  }>;
  
  // User management
  getAllUsers(filters?: { flagged?: boolean; kycStatus?: string; limit?: number; offset?: number }): Promise<User[]>;
  flagUser(userId: string, reason: string, flaggedBy: string): Promise<User>;
  unflagUser(userId: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  suspendUser(userId: string, reason: string, suspendedBy: string): Promise<User>;
  unsuspendUser(userId: string): Promise<User>;
  getUserCampaigns(userId: string): Promise<Campaign[]>;
  getUserContributions(userId: string): Promise<Contribution[]>;
  resetUserPassword(userId: string, newPassword: string): Promise<User>;
  
  // Reinstatement requests
  createReinstatementRequest(request: InsertReinstatementRequest): Promise<ReinstatementRequest>;
  getReinstatementRequests(status?: string): Promise<ReinstatementRequest[]>;
  getReinstatementRequestByUserId(userId: string): Promise<ReinstatementRequest | undefined>;
  updateReinstatementRequest(id: string, updates: Partial<ReinstatementRequest>): Promise<ReinstatementRequest>;
  
  // User notifications
  createUserNotification(notification: InsertUserNotification): Promise<UserNotification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<UserNotification[]>;
  markNotificationAsRead(id: string): Promise<UserNotification>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
  // Campaign management enhancements
  canUserCreateCampaign(userId: string): Promise<{ canCreate: boolean; reason?: string }>;
  updateCampaignWithEditTracking(id: string, updates: Partial<Campaign>, editorId: string): Promise<Campaign>;
  
  // Avalanche transaction operations
  createAvalancheTransaction(transaction: InsertAvalancheTransaction): Promise<AvalancheTransaction>;
  getAvalancheTransactionsByUser(userId: string): Promise<AvalancheTransaction[]>;
  getAllAvalancheTransactions(filters?: {
    userId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<AvalancheTransaction[]>;
  updateCampaignFunding(campaignId: string, amount: string): Promise<void>;
  updateUserWallet(userId: string, walletAddress: string): Promise<void>;
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

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
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

  // KYC operations
  async createKycApplication(applicationData: InsertKycApplication): Promise<KycApplication> {
    const [application] = await db
      .insert(kycApplications)
      .values({
        ...applicationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return application;
  }

  async getKycApplication(userId: string): Promise<KycApplication | undefined> {
    const [application] = await db
      .select()
      .from(kycApplications)
      .where(eq(kycApplications.userId, userId))
      .orderBy(desc(kycApplications.createdAt));
    return application || undefined;
  }

  async getKycApplicationById(id: string): Promise<KycApplication | undefined> {
    const [application] = await db
      .select()
      .from(kycApplications)
      .where(eq(kycApplications.id, id));
    return application || undefined;
  }

  async getAllKycApplications(status?: string): Promise<KycApplication[]> {
    let query = db.select().from(kycApplications);
    
    if (status) {
      query = query.where(eq(kycApplications.status, status)) as any;
    }

    return await query.orderBy(desc(kycApplications.createdAt));
  }

  async updateKycApplication(id: string, updates: Partial<KycApplication>): Promise<KycApplication> {
    const [application] = await db
      .update(kycApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(kycApplications.id, id))
      .returning();
    return application;
  }

  // Admin operations
  async createAdminUser(adminData: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db
      .insert(adminUsers)
      .values({
        ...adminData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return admin;
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  // User management methods
  async getAllUsers(filters?: { flagged?: boolean; kycStatus?: string; limit?: number; offset?: number }): Promise<User[]> {
    let query = db.select().from(users);
    const conditions = [];

    if (filters?.flagged !== undefined) {
      conditions.push(eq(users.isFlagged, filters.flagged));
    }
    if (filters?.kycStatus) {
      conditions.push(eq(users.kycStatus, filters.kycStatus));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    return await query.orderBy(desc(users.createdAt));
  }

  async flagUser(userId: string, reason: string, flaggedBy: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isFlagged: true,
        flaggedReason: reason,
        flaggedBy: flaggedBy,
        flaggedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async unflagUser(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isFlagged: false,
        flaggedReason: null,
        flaggedBy: null,
        flaggedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete user's contributions first (cascade)
    await db.delete(contributions).where(eq(contributions.backerId, userId));
    // Delete user's campaigns
    await db.delete(campaigns).where(eq(campaigns.creatorId, userId));
    // Delete user's KYC applications
    await db.delete(kycApplications).where(eq(kycApplications.userId, userId));
    // Delete user's notifications
    await db.delete(userNotifications).where(eq(userNotifications.userId, userId));
    // Delete user's reinstatement requests
    await db.delete(reinstatementRequests).where(eq(reinstatementRequests.userId, userId));
    // Finally delete the user
    await db.delete(users).where(eq(users.id, userId));
  }

  async suspendUser(userId: string, reason: string, suspendedBy: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isFlagged: true,
        flaggedReason: `SUSPENDED: ${reason}`,
        flaggedBy: suspendedBy,
        flaggedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async unsuspendUser(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isFlagged: false,
        flaggedReason: null,
        flaggedBy: null,
        flaggedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserContributions(userId: string): Promise<Contribution[]> {
    return db.select().from(contributions).where(eq(contributions.backerId, userId)).orderBy(desc(contributions.createdAt));
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        password: newPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Reinstatement request methods
  async createReinstatementRequest(requestData: InsertReinstatementRequest): Promise<ReinstatementRequest> {
    const [request] = await db
      .insert(reinstatementRequests)
      .values({
        ...requestData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return request;
  }

  async getReinstatementRequests(status?: string): Promise<ReinstatementRequest[]> {
    let query = db.select().from(reinstatementRequests);
    
    if (status) {
      query = query.where(eq(reinstatementRequests.status, status)) as any;
    }

    return await query.orderBy(desc(reinstatementRequests.createdAt));
  }

  async getReinstatementRequestByUserId(userId: string): Promise<ReinstatementRequest | undefined> {
    const [request] = await db
      .select()
      .from(reinstatementRequests)
      .where(eq(reinstatementRequests.userId, userId))
      .orderBy(desc(reinstatementRequests.createdAt));
    return request || undefined;
  }

  async updateReinstatementRequest(id: string, updates: Partial<ReinstatementRequest>): Promise<ReinstatementRequest> {
    const [request] = await db
      .update(reinstatementRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reinstatementRequests.id, id))
      .returning();
    return request;
  }

  // User notification methods
  async createUserNotification(notificationData: InsertUserNotification): Promise<UserNotification> {
    const [notification] = await db
      .insert(userNotifications)
      .values({
        ...notificationData,
        createdAt: new Date(),
      })
      .returning();
    return notification;
  }

  async getUserNotifications(userId: string, unreadOnly?: boolean): Promise<UserNotification[]> {
    let query = db.select().from(userNotifications);
    
    if (unreadOnly) {
      query = query.where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, false))) as any;
    } else {
      query = query.where(eq(userNotifications.userId, userId)) as any;
    }

    return await query.orderBy(desc(userNotifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<UserNotification> {
    const [notification] = await db
      .update(userNotifications)
      .set({ isRead: true })
      .where(eq(userNotifications.id, id))
      .returning();
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(userNotifications)
      .set({ isRead: true })
      .where(eq(userNotifications.userId, userId));
  }

  // Enhanced campaign management methods
  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.creatorId, userId))
      .orderBy(desc(campaigns.createdAt));
  }

  async canUserCreateCampaign(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return { canCreate: false, reason: "User not found" };
    }
    
    if (user.isFlagged) {
      return { canCreate: false, reason: "Account is flagged and cannot create campaigns" };
    }
    
    if (user.kycStatus !== "approved") {
      return { canCreate: false, reason: "KYC verification required" };
    }

    const userCampaigns = await this.getUserCampaigns(userId);
    const activeCampaigns = userCampaigns.filter(c => c.status === "active" || c.status === "pending_approval");
    
    // Check if user has more than 1 active campaign
    if (activeCampaigns.length >= 1) {
      // Check if any existing campaign is at least 80% funded or completed
      const hasQualifyingCampaign = userCampaigns.some(campaign => {
        const fundingPercentage = (parseFloat(campaign.currentAmount || "0") / parseFloat(campaign.goalAmount || "1")) * 100;
        return fundingPercentage >= 80 || campaign.status === "completed";
      });
      
      if (!hasQualifyingCampaign && activeCampaigns.length >= 1) {
        return { canCreate: false, reason: "You can only create a second campaign if one existing campaign is at least 80% funded or completed" };
      }
    }

    return { canCreate: true };
  }

  async updateCampaignWithEditTracking(id: string, updates: Partial<Campaign>, editorId: string): Promise<Campaign> {
    const campaign = await this.getCampaign(id);
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // If campaign was previously approved and is being edited, mark as needing review
    let updateData = { ...updates, updatedAt: new Date() };
    
    if (campaign.status === "active" && campaign.creatorId === editorId) {
      updateData = {
        ...updateData,
        status: "pending_approval",
        isEditedAfterApproval: true,
        editCount: (campaign.editCount || 0) + 1,
        lastEditedAt: new Date(),
      };
    }

    const [updatedCampaign] = await db
      .update(campaigns)
      .set(updateData)
      .where(eq(campaigns.id, id))
      .returning();
    
    return updatedCampaign;
  }

  // Avalanche transaction operations
  async createAvalancheTransaction(transaction: InsertAvalancheTransaction): Promise<AvalancheTransaction> {
    const [created] = await db
      .insert(avalancheTransactions)
      .values(transaction)
      .returning();
    return created;
  }

  async getAvalancheTransactionsByUser(userId: string): Promise<AvalancheTransaction[]> {
    return await db
      .select()
      .from(avalancheTransactions)
      .where(eq(avalancheTransactions.userId, userId))
      .orderBy(desc(avalancheTransactions.createdAt));
  }

  async getAllAvalancheTransactions(filters?: {
    userId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<AvalancheTransaction[]> {
    let query = db.select().from(avalancheTransactions);
    
    const conditions: any[] = [];
    
    if (filters?.userId) {
      conditions.push(eq(avalancheTransactions.userId, filters.userId));
    }
    
    if (filters?.campaignId) {
      conditions.push(eq(avalancheTransactions.campaignId, filters.campaignId));
    }
    
    if (filters?.startDate) {
      conditions.push(sql`${avalancheTransactions.createdAt} >= ${filters.startDate}`);
    }
    
    if (filters?.endDate) {
      conditions.push(sql`${avalancheTransactions.createdAt} <= ${filters.endDate}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(avalancheTransactions.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async updateCampaignFunding(campaignId: string, amount: string): Promise<void> {
    const campaign = await this.getCampaign(campaignId);
    if (campaign) {
      const currentAmount = parseFloat(campaign.currentAmount || '0');
      const newAmount = currentAmount + parseFloat(amount);
      await db
        .update(campaigns)
        .set({ 
          currentAmount: newAmount.toString(),
          backerCount: (campaign.backerCount || 0) + 1
        })
        .where(eq(campaigns.id, campaignId));
    }
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<void> {
    await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, userId));
  }

  // Implement missing Avalanche transaction methods
  async getAvalancheTransactions(filters?: {
    campaignId?: string;
    walletAddress?: string;
    status?: string;
    limit?: number;
  }): Promise<AvalancheTransaction[]> {
    let query = db.select().from(avalancheTransactions);
    
    const conditions: any[] = [];
    
    if (filters?.campaignId) {
      conditions.push(eq(avalancheTransactions.campaignId, filters.campaignId));
    }
    
    if (filters?.walletAddress) {
      conditions.push(eq(avalancheTransactions.walletAddress, filters.walletAddress));
    }
    
    if (filters?.status) {
      conditions.push(eq(avalancheTransactions.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(avalancheTransactions.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  }

  async updateAvalancheTransaction(id: string, updates: Partial<AvalancheTransaction>): Promise<AvalancheTransaction> {
    const [updated] = await db
      .update(avalancheTransactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(avalancheTransactions.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();