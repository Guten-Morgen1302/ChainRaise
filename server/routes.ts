import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireAdmin } from "./auth";
import { 
  optimizeCampaignTitle, 
  enhanceCampaignDescription, 
  analyzeCampaignCredibility,
  predictFundingSuccess 
} from "./openai";
import { insertCampaignSchema, insertContributionSchema, insertTransactionSchema, insertKycApplicationSchema, insertReinstatementRequestSchema, insertUserNotificationSchema, insertAvalancheTransactionSchema } from "@shared/schema";
import { getWebSocketManager } from "./websocket";
import { JsonRpcProvider, WebSocketProvider, Contract, formatEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@shared/contract";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Avalanche Fuji testnet configuration
  const RPC_HTTP_URL = "https://api.avax-test.network/ext/bc/C/rpc";
  const RPC_WS_URL = "wss://api.avax-test.network/ext/bc/C/ws";

  const httpProvider = new JsonRpcProvider(RPC_HTTP_URL);
  const wsProvider = new WebSocketProvider(RPC_WS_URL);

  const contractHttp = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, httpProvider);
  const contractWs = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wsProvider);

  // Blockchain contract endpoints
  app.get('/api/contract/state', async (_req, res) => {
    try {
      const [
        creator,
        deadline,
        fundingGoal,
        totalFunded,
        goalReached,
        milestoneCount,
        milestonesCompleted,
        contractBalance,
      ] = await Promise.all([
        contractHttp.creator(),
        contractHttp.deadline(),
        contractHttp.fundingGoal(),
        contractHttp.totalFunded(),
        contractHttp.goalReached(),
        contractHttp.milestoneCount(),
        contractHttp.milestonesCompleted(),
        contractHttp.getContractBalance(),
      ]);

      res.json({
        creator,
        deadline: Number(deadline),
        fundingGoal: fundingGoal.toString(),
        totalFunded: totalFunded.toString(),
        contractBalance: contractBalance.toString(),
        goalReached,
        milestoneCount: Number(milestoneCount),
        milestonesCompleted: Number(milestonesCompleted),
      });
    } catch (e: any) {
      console.error("Contract state error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Get per-backer contribution
  app.get('/api/contract/backers/:address', async (req, res) => {
    try {
      const amount = await contractHttp.backers(req.params.address);
      res.json({ address: req.params.address, amount: amount.toString() });
    } catch (e: any) {
      console.error("Backer query error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Stream contract events via Server-Sent Events (SSE)
  app.get('/api/contract/events', (req, res) => {
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });
    res.flushHeaders();

    const send = (type: string, data: any) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const onFunded = (backer: string, amount: bigint) => {
      send('Funded', { backer, amount: amount.toString(), amountEth: formatEther(amount) });
    };
    const onRefunded = (backer: string, amount: bigint) => {
      send('Refunded', { backer, amount: amount.toString(), amountEth: formatEther(amount) });
    };
    const onMilestone = (milestoneIndex: bigint, payout: bigint) => {
      send('MilestoneCompleted', {
        milestoneIndex: Number(milestoneIndex),
        payout: payout.toString(),
        payoutEth: formatEther(payout),
      });
    };

    contractWs.on('Funded', onFunded);
    contractWs.on('Refunded', onRefunded);
    contractWs.on('MilestoneCompleted', onMilestone);

    req.on('close', () => {
      contractWs.off('Funded', onFunded);
      contractWs.off('Refunded', onRefunded);
      contractWs.off('MilestoneCompleted', onMilestone);
      res.end();
    });
  });

  // Avalanche wallet transaction endpoints
  app.post('/api/transactions/avalanche', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactionData = insertAvalancheTransactionSchema.parse({
        ...req.body,
        userId,
      });

      const transaction = await storage.createAvalancheTransaction(transactionData);
      
      // Update campaign funding if transaction is for a campaign
      if (transactionData.campaignId) {
        await storage.updateCampaignFunding(transactionData.campaignId, transactionData.amount);
      }

      // Broadcast real-time update to admin clients
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.transactionCreated(transaction);
      }

      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating Avalanche transaction:", error);
      res.status(400).json({ message: (error as Error).message || "Failed to create transaction" });
    }
  });

  app.get('/api/transactions/avalanche', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getAvalancheTransactionsByUser(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching Avalanche transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/admin/transactions/avalanche', requireAdmin, async (req, res) => {
    try {
      const { userId, campaignId, startDate, endDate, limit, offset } = req.query;
      const transactions = await storage.getAllAvalancheTransactions({
        userId: userId as string,
        campaignId: campaignId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching admin Avalanche transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Update user wallet address
  app.put('/api/user/wallet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      await storage.updateUserWallet(userId, walletAddress);
      res.json({ success: true, walletAddress });
    } catch (error) {
      console.error("Error updating wallet:", error);
      res.status(500).json({ message: "Failed to update wallet" });
    }
  });

  // Removed duplicate auth route - using the one in auth.ts instead

  // Campaign routes
  app.get('/api/campaigns', async (req, res) => {
    try {
      const { category, status, limit, offset } = req.query;
      const campaigns = await storage.getCampaigns({
        category: category as string,
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Get campaigns by category (more specific route)
  app.get('/api/campaigns/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const { status, limit, offset } = req.query;
      
      // Check if this is a category or an actual campaign ID (UUIDs are 36 chars)
      if (category.length === 36 && category.includes('-')) {
        // This is likely a UUID, treat as campaign ID
        const campaign = await storage.getCampaign(category);
        if (!campaign) {
          return res.status(404).json({ message: "Campaign not found" });
        }
        return res.json(campaign);
      }
      
      // This is a category filter
      const campaigns = await storage.getCampaigns({
        category: category,
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.kycStatus !== "approved") {
        return res.status(403).json({ 
          message: "KYC verification required to create campaigns",
          kycStatus: user?.kycStatus || 'pending'
        });
      }

      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        creatorId: userId,
        status: 'pending_approval', // New campaigns start as pending approval
      });

      const campaign = await storage.createCampaign(campaignData);
      
      // Broadcast real-time update to admin clients
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.campaignCreated(campaign);
      }

      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ message: (error as Error).message || "Failed to create campaign" });
    }
  });

  app.put('/api/campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.isFlagged) {
        return res.status(403).json({ message: "Cannot edit campaigns while account is flagged" });
      }
      
      const campaign = await storage.getCampaign(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.creatorId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this campaign" });
      }
      
      // Check if campaign is pending re-approval after edits
      if (campaign.isEditedAfterApproval && campaign.status === "pending_approval") {
        return res.status(403).json({ 
          message: "Cannot edit campaign while pending admin re-approval",
          requiresReview: true 
        });
      }
      
      // Can't edit rejected campaigns
      if (campaign.status === "rejected") {
        return res.status(403).json({ message: "Cannot edit rejected campaigns" });
      }
      
      // Determine if this is a critical edit that requires re-approval
      const criticalFields = ['title', 'description', 'goalAmount', 'deadline', 'fundingType', 'category'];
      const isCriticalEdit = criticalFields.some(field => 
        req.body[field] !== undefined && req.body[field] !== campaign[field as keyof typeof campaign]
      );
      
      let updateData = { ...req.body };
      
      // If this is a critical edit to an approved campaign, mark for re-approval
      if (isCriticalEdit && campaign.status === "active" && campaign.originalApprovalDate) {
        updateData = {
          ...updateData,
          status: "pending_approval",
          isEditedAfterApproval: true,
          editCount: (campaign.editCount || 0) + 1,
          lastEditedAt: new Date(),
          adminComments: null, // Clear previous admin comments
          reviewedBy: null,
          reviewedAt: null,
        };
        
        // Create notification for user
        await storage.createUserNotification({
          userId,
          title: "Campaign Under Review",
          message: `Your campaign "${campaign.title}" has been submitted for admin review due to significant changes. The campaign is temporarily paused until approval.`,
          type: "warning",
          relatedCampaignId: campaign.id,
        });
      } else if (!isCriticalEdit) {
        // Minor edit - just update last edited time
        updateData.lastEditedAt = new Date();
      }

      const updatedCampaign = await storage.updateCampaignWithEditTracking(req.params.id, updateData, userId);
      
      res.json({
        ...updatedCampaign,
        requiresReview: isCriticalEdit && campaign.status === "active" && campaign.originalApprovalDate,
        editType: isCriticalEdit ? "critical" : "minor"
      });
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(400).json({ message: (error as Error).message || "Failed to update campaign" });
    }
  });

  // Contribution routes
  app.get('/api/contributions', async (req, res) => {
    try {
      const { campaignId, backerId } = req.query;
      const contributions = await storage.getContributions(
        campaignId as string,
        backerId as string
      );
      res.json(contributions);
    } catch (error) {
      console.error("Error fetching contributions:", error);
      res.status(500).json({ message: "Failed to fetch contributions" });
    }
  });

  app.post('/api/contributions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contributionData = insertContributionSchema.parse({
        ...req.body,
        backerId: userId,
      });

      const contribution = await storage.createContribution(contributionData);
      
      // Create corresponding blockchain transaction
      if (contributionData.transactionHash) {
        await storage.createTransaction({
          hash: contributionData.transactionHash,
          campaignId: contributionData.campaignId,
          fromAddress: req.body.fromAddress || "0x0000",
          toAddress: req.body.toAddress || "0x0000",
          amount: contributionData.amount,
          gasUsed: req.body.gasUsed || "21000",
          gasPrice: req.body.gasPrice || "0.02",
          blockNumber: req.body.blockNumber || "0",
          transactionType: "contribution",
          status: "confirmed",
        });
      }

      res.status(201).json(contribution);
    } catch (error) {
      console.error("Error creating contribution:", error);
      res.status(400).json({ message: (error as Error).message || "Failed to create contribution" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', async (req, res) => {
    try {
      const { campaignId, transactionType, limit } = req.query;
      const transactions = await storage.getTransactions({
        campaignId: campaignId as string,
        transactionType: transactionType as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get transactions by campaign ID
  app.get('/api/transactions/:campaignId', async (req, res) => {
    try {
      const { campaignId } = req.params;
      const transactions = await storage.getTransactions({ campaignId });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching campaign transactions:", error);
      res.status(500).json({ message: "Failed to fetch campaign transactions" });
    }
  });

  // Get contributions by campaign ID
  app.get('/api/contributions/:campaignId', async (req, res) => {
    try {
      const { campaignId } = req.params;
      const contributions = await storage.getContributions(campaignId);
      res.json(contributions);
    } catch (error) {
      console.error("Error fetching campaign contributions:", error);
      res.status(500).json({ message: "Failed to fetch campaign contributions" });
    }
  });

  // AI Assistant routes
  app.post('/api/ai/optimize-title', isAuthenticated, async (req: any, res) => {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const result = await optimizeCampaignTitle(title);
      
      // Store AI interaction
      await storage.createAiInteraction({
        userId: req.user.id,
        interactionType: "title_optimization",
        inputData: { title },
        outputData: result,
      });

      res.json(result);
    } catch (error) {
      console.error("Error optimizing title:", error);
      res.status(500).json({ message: "Failed to optimize title" });
    }
  });

  app.post('/api/ai/enhance-description', isAuthenticated, async (req: any, res) => {
    try {
      const { description, category } = req.body;
      if (!description || !category) {
        return res.status(400).json({ message: "Description and category are required" });
      }

      const result = await enhanceCampaignDescription(description, category);
      
      // Store AI interaction
      await storage.createAiInteraction({
        userId: req.user.id,
        interactionType: "description_enhancement",
        inputData: { description, category },
        outputData: result,
      });

      res.json(result);
    } catch (error) {
      console.error("Error enhancing description:", error);
      res.status(500).json({ message: "Failed to enhance description" });
    }
  });

  app.post('/api/ai/analyze-credibility', isAuthenticated, async (req: any, res) => {
    try {
      const { campaignData } = req.body;
      const user = await storage.getUser(req.user.id);
      
      const result = await analyzeCampaignCredibility({
        ...campaignData,
        creatorKycStatus: user?.kycStatus || "pending",
      });
      
      // Store AI interaction
      await storage.createAiInteraction({
        userId: req.user.id,
        interactionType: "credibility_analysis",
        inputData: campaignData,
        outputData: result,
      });

      res.json(result);
    } catch (error) {
      console.error("Error analyzing credibility:", error);
      res.status(500).json({ message: "Failed to analyze credibility" });
    }
  });

  app.post('/api/ai/predict-funding', isAuthenticated, async (req: any, res) => {
    try {
      const { campaignData } = req.body;
      
      const result = await predictFundingSuccess(campaignData);
      
      // Store AI interaction
      await storage.createAiInteraction({
        userId: req.user.id,
        interactionType: "funding_prediction",
        inputData: campaignData,
        outputData: result,
      });

      res.json(result);
    } catch (error) {
      console.error("Error predicting funding success:", error);
      res.status(500).json({ message: "Failed to predict funding success" });
    }
  });

  // Placeholder image endpoint
  app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    const w = parseInt(width) || 400;
    const h = parseInt(height) || 300;
    
    // Generate SVG placeholder
    const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dy="0.3em">
        Campaign Image
      </text>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(svg);
  });

  // Statistics routes
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getCampaignStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // KYC routes
  app.post('/api/kyc/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const kycData = insertKycApplicationSchema.parse({
        ...req.body,
        userId,
      });

      // Check if user already has a pending/approved KYC
      const existingKyc = await storage.getKycApplication(userId);
      if (existingKyc && (existingKyc.status === 'pending' || existingKyc.status === 'approved')) {
        return res.status(400).json({ message: "KYC application already exists" });
      }

      const kycApplication = await storage.createKycApplication(kycData);
      
      // Update user's KYC status to pending
      await storage.updateUser(userId, { kycStatus: 'pending' });

      // Broadcast real-time update to admin clients
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.kycSubmitted(kycApplication);
      }

      res.json(kycApplication);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      res.status(500).json({ message: "Failed to submit KYC application" });
    }
  });

  app.get('/api/kyc/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const kycApplication = await storage.getKycApplication(userId);
      
      if (!kycApplication) {
        return res.json({ status: 'not_submitted' });
      }

      res.json({
        status: kycApplication.status,
        submittedAt: kycApplication.createdAt,
        reviewedAt: kycApplication.reviewedAt,
        adminComments: kycApplication.adminComments,
      });
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      res.status(500).json({ message: "Failed to fetch KYC status" });
    }
  });

  // Admin KYC routes
  app.get('/api/admin/kyc/applications', requireAdmin, async (req: any, res) => {
    try {
      const { status } = req.query;
      const applications = await storage.getAllKycApplications(status as string);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching KYC applications:", error);
      res.status(500).json({ message: "Failed to fetch KYC applications" });
    }
  });

  app.get('/api/admin/kyc/applications/:id', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const application = await storage.getKycApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ message: "KYC application not found" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching KYC application:", error);
      res.status(500).json({ message: "Failed to fetch KYC application" });
    }
  });

  app.put('/api/admin/kyc/applications/:id', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminComments } = req.body;

      const application = await storage.getKycApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "KYC application not found" });
      }

      const updatedApplication = await storage.updateKycApplication(id, {
        status,
        adminComments,
        reviewedBy: req.user.username,
        reviewedAt: new Date(),
      });

      // Update user's KYC status
      const updatedUser = await storage.updateUser(application.userId, { kycStatus: status });

      // Broadcast real-time updates to admin clients
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.kycStatusChanged(updatedApplication);
        wsManager.userUpdated(updatedUser);
      }

      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating KYC application:", error);
      res.status(500).json({ message: "Failed to update KYC application" });
    }
  });

  // Admin Campaign Management Routes
  app.get('/api/admin/campaigns', requireAdmin, async (req: any, res) => {
    try {
      const { status } = req.query;
      const campaigns = await storage.getCampaigns({
        status: status as string,
        limit: 100,
      });
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching admin campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get('/api/admin/campaigns/:id', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.put('/api/admin/campaigns/:id/status', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminComments } = req.body;

      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      const updatedCampaign = await storage.updateCampaign(id, {
        status,
        adminComments,
        reviewedBy: req.user.username,
        reviewedAt: new Date(),
        ...(status === "active" && !campaign.originalApprovalDate && { originalApprovalDate: new Date() }),
      });

      // Create notification for campaign creator
      if (campaign.creatorId) {
        await storage.createUserNotification({
          userId: campaign.creatorId,
          title: `Campaign ${status === "active" ? "Approved" : status === "rejected" ? "Rejected" : "Updated"}`,
          message: `Your campaign "${campaign.title}" has been ${status}${adminComments ? `. Admin notes: ${adminComments}` : "."}`,
          type: status === "active" ? "success" : status === "rejected" ? "error" : "info",
          relatedCampaignId: id,
        });
      }

      // Broadcast real-time updates to admin clients
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.campaignStatusChanged(updatedCampaign);
      }

      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating campaign status:", error);
      res.status(500).json({ message: "Failed to update campaign status" });
    }
  });

  // Enhanced User Management Routes
  app.get('/api/admin/users', requireAdmin, async (req: any, res) => {
    try {
      const { flagged, kycStatus, limit, offset } = req.query;
      const users = await storage.getAllUsers({
        flagged: flagged === 'true' ? true : flagged === 'false' ? false : undefined,
        kycStatus: kycStatus as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete('/api/admin/users/:id', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      
      // Broadcast real-time update to admin clients
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.userDeleted(id);
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.put('/api/admin/users/:id/suspend', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Reason is required for suspending a user" });
      }

      const user = await storage.suspendUser(id, reason, req.user.username);
      
      // Create notification for suspended user
      await storage.createUserNotification({
        userId: id,
        title: "Account Suspended",
        message: `Your account has been suspended: ${reason}. Please contact support for assistance.`,
        type: "error",
      });

      res.json(user);
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  app.put('/api/admin/users/:id/unsuspend', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;

      const user = await storage.unsuspendUser(id);
      
      // Create notification for unsuspended user
      await storage.createUserNotification({
        userId: id,
        title: "Account Restored",
        message: "Your account has been restored. You now have full access to all features.",
        type: "success",
      });

      res.json(user);
    } catch (error) {
      console.error("Error unsuspending user:", error);
      res.status(500).json({ message: "Failed to unsuspend user" });
    }
  });

  app.put('/api/admin/users/:id', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Don't allow updating password this way
      delete updates.password;
      delete updates.id;
      delete updates.createdAt;

      const user = await storage.updateUser(id, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post('/api/admin/users/:id/reset-password', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Hash the new password
      const scrypt = require('crypto').scrypt;
      const randomBytes = require('crypto').randomBytes;
      const salt = randomBytes(16).toString("hex");
      const hashedPassword = await new Promise((resolve, reject) => {
        scrypt(newPassword, salt, 64, (err: any, derivedKey: any) => {
          if (err) reject(err);
          resolve(`${derivedKey.toString("hex")}.${salt}`);
        });
      });

      const user = await storage.resetUserPassword(id, hashedPassword as string);
      
      // Create notification for user
      await storage.createUserNotification({
        userId: id,
        title: "Password Reset",
        message: "Your password has been reset by an administrator. Please use your new password to log in.",
        type: "info",
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post('/api/admin/users/:id/notify', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { title, message, type = "info" } = req.body;

      if (!title || !message) {
        return res.status(400).json({ message: "Title and message are required" });
      }

      const notification = await storage.createUserNotification({
        userId: id,
        title,
        message,
        type,
      });

      res.json(notification);
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  // Flag/Unflag user endpoints
  app.put('/api/admin/users/:id/flag', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Reason is required for flagging a user" });
      }

      const user = await storage.updateUser(id, {
        isFlagged: true,
        flaggedReason: reason,
        flaggedBy: req.user.username,
        flaggedAt: new Date(),
      });

      // Broadcast real-time update to admin clients
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.userFlagged(user);
      }

      res.json(user);
    } catch (error) {
      console.error("Error flagging user:", error);
      res.status(500).json({ message: "Failed to flag user" });
    }
  });

  app.put('/api/admin/users/:id/unflag', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;

      const user = await storage.updateUser(id, {
        isFlagged: false,
        flaggedReason: null,
        flaggedBy: null,
        flaggedAt: null,
      });

      // Broadcast real-time update to admin clients
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.userUnflagged(user);
      }

      res.json(user);
    } catch (error) {
      console.error("Error unflagging user:", error);
      res.status(500).json({ message: "Failed to unflag user" });
    }
  });

  app.get('/api/admin/users/:id/campaigns', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const campaigns = await storage.getUserCampaigns(id);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
      res.status(500).json({ message: "Failed to fetch user campaigns" });
    }
  });

  app.get('/api/admin/users/:id/contributions', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contributions = await storage.getUserContributions(id);
      res.json(contributions);
    } catch (error) {
      console.error("Error fetching user contributions:", error);
      res.status(500).json({ message: "Failed to fetch user contributions" });
    }
  });

  app.get('/api/admin/users/:id/export', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const [user, campaigns, contributions, kycApplication] = await Promise.all([
        storage.getUser(id),
        storage.getUserCampaigns(id),
        storage.getUserContributions(id),
        storage.getKycApplication(id),
      ]);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const exportData = {
        user: {
          ...user,
          password: "[REDACTED]", // Don't export password
        },
        campaigns,
        contributions,
        kycApplication,
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.username,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user-${user.username}-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  app.get('/api/admin/users/:id', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's campaigns, contributions, and KYC info
      const [campaigns, contributions, kycApplication] = await Promise.all([
        storage.getUserCampaigns(id),
        storage.getContributions(undefined, id),
        storage.getKycApplication(id),
      ]);

      res.json({
        ...user,
        campaigns,
        contributions,
        kycApplication,
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  app.put('/api/admin/users/:id/flag', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Reason is required for flagging a user" });
      }

      const user = await storage.flagUser(id, reason, req.user.username);
      
      // Create notification for flagged user
      await storage.createUserNotification({
        userId: id,
        title: "Account Flagged",
        message: `Your account has been flagged: ${reason}. Please submit a reinstatement request to regain full access.`,
        type: "warning",
      });

      res.json(user);
    } catch (error) {
      console.error("Error flagging user:", error);
      res.status(500).json({ message: "Failed to flag user" });
    }
  });

  app.put('/api/admin/users/:id/unflag', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;

      const user = await storage.unflagUser(id);
      
      // Create notification for unflagged user
      await storage.createUserNotification({
        userId: id,
        title: "Account Unflagged",
        message: "Your account has been unflagged. You now have full access to all features.",
        type: "success",
      });

      res.json(user);
    } catch (error) {
      console.error("Error unflagging user:", error);
      res.status(500).json({ message: "Failed to unflag user" });
    }
  });

  // Reinstatement Request Routes
  app.post('/api/reinstatement-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isFlagged) {
        return res.status(400).json({ message: "User is not flagged" });
      }

      // Check if there's already a pending request
      const existingRequest = await storage.getReinstatementRequestByUserId(userId);
      if (existingRequest && existingRequest.status === "pending") {
        return res.status(400).json({ message: "You already have a pending reinstatement request" });
      }

      const requestData = insertReinstatementRequestSchema.parse({
        ...req.body,
        userId,
      });

      const request = await storage.createReinstatementRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating reinstatement request:", error);
      res.status(400).json({ message: (error as Error).message || "Failed to create reinstatement request" });
    }
  });

  app.get('/api/reinstatement-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const request = await storage.getReinstatementRequestByUserId(userId);
      res.json(request || null);
    } catch (error) {
      console.error("Error fetching reinstatement request:", error);
      res.status(500).json({ message: "Failed to fetch reinstatement request" });
    }
  });

  app.get('/api/admin/reinstatement-requests', requireAdmin, async (req: any, res) => {
    try {
      const { status } = req.query;
      const requests = await storage.getReinstatementRequests(status as string);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching reinstatement requests:", error);
      res.status(500).json({ message: "Failed to fetch reinstatement requests" });
    }
  });

  app.put('/api/admin/reinstatement-requests/:id', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminComments } = req.body;

      const request = await storage.updateReinstatementRequest(id, {
        status,
        adminComments,
        reviewedBy: req.user.username,
        reviewedAt: new Date(),
      });

      // If approved, unflag the user
      if (status === "approved") {
        const userId = request.userId;
        await storage.unflagUser(userId);
        
        await storage.createUserNotification({
          userId,
          title: "Reinstatement Request Approved",
          message: "Your reinstatement request has been approved. Your account has been unflagged and you now have full access.",
          type: "success",
        });
      } else if (status === "rejected") {
        await storage.createUserNotification({
          userId: request.userId,
          title: "Reinstatement Request Rejected",
          message: `Your reinstatement request has been rejected${adminComments ? `: ${adminComments}` : "."}`,
          type: "error",
        });
      }

      res.json(request);
    } catch (error) {
      console.error("Error updating reinstatement request:", error);
      res.status(500).json({ message: "Failed to update reinstatement request" });
    }
  });

  // User Notification Routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { unreadOnly } = req.query;
      const notifications = await storage.getUserNotifications(userId, unreadOnly === 'true');
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Enhanced Campaign Routes
  app.get('/api/user/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getUserCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
      res.status(500).json({ message: "Failed to fetch user campaigns" });
    }
  });

  app.get('/api/user/can-create-campaign', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = await storage.canUserCreateCampaign(userId);
      res.json(result);
    } catch (error) {
      console.error("Error checking campaign creation eligibility:", error);
      res.status(500).json({ message: "Failed to check campaign creation eligibility" });
    }
  });


  // Campaign edit eligibility check
  app.get('/api/campaigns/:id/can-edit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.isFlagged) {
        return res.json({ 
          canEdit: false, 
          reason: "Cannot edit campaigns while account is flagged" 
        });
      }
      
      const campaign = await storage.getCampaign(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.creatorId !== userId) {
        return res.json({ 
          canEdit: false, 
          reason: "You can only edit your own campaigns" 
        });
      }
      
      // Check if campaign is pending re-approval after edits
      if (campaign.isEditedAfterApproval && campaign.status === "pending_approval") {
        return res.json({ 
          canEdit: false, 
          reason: "Cannot edit campaign while pending admin re-approval",
          requiresReview: true 
        });
      }
      
      // Can't edit rejected campaigns
      if (campaign.status === "rejected") {
        return res.json({ 
          canEdit: false, 
          reason: "Cannot edit rejected campaigns" 
        });
      }
      
      res.json({ canEdit: true });
    } catch (error) {
      console.error("Error checking campaign edit eligibility:", error);
      res.status(500).json({ message: "Failed to check campaign edit eligibility" });
    }
  });

  // User profile completion status
  app.get('/api/user/profile-completion', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let completionScore = 0;
      const completionItems = [
        { field: 'firstName', label: 'First Name', completed: !!user.firstName },
        { field: 'lastName', label: 'Last Name', completed: !!user.lastName },
        { field: 'email', label: 'Email Address', completed: !!user.email },
        { field: 'profileImageUrl', label: 'Profile Picture', completed: !!user.profileImageUrl },
        { field: 'walletAddress', label: 'Wallet Address', completed: !!user.walletAddress },
        { field: 'kycStatus', label: 'KYC Verification', completed: user.kycStatus === 'approved' }
      ];
      
      completionScore = Math.round((completionItems.filter(item => item.completed).length / completionItems.length) * 100);
      
      res.json({
        completionScore,
        completionItems,
        isProfileComplete: completionScore >= 80
      });
    } catch (error) {
      console.error("Error fetching profile completion:", error);
      res.status(500).json({ message: "Failed to fetch profile completion" });
    }
  });

  // User financial overview
  app.get('/api/user/financial-overview', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [campaigns, contributions] = await Promise.all([
        storage.getUserCampaigns(userId),
        storage.getUserContributions(userId)
      ]);
      
      const totalRaised = campaigns.reduce((sum, campaign) => sum + parseFloat(campaign.currentAmount || "0"), 0);
      const totalContributed = contributions.reduce((sum, contribution) => sum + parseFloat(contribution.amount || "0"), 0);
      const totalGoalAmount = campaigns.reduce((sum, campaign) => sum + parseFloat(campaign.goalAmount || "0"), 0);
      
      const activeCampaigns = campaigns.filter(c => c.status === "active");
      const pendingCampaigns = campaigns.filter(c => c.status === "pending_approval");
      const completedCampaigns = campaigns.filter(c => c.status === "completed");
      const rejectedCampaigns = campaigns.filter(c => c.status === "rejected");
      
      const averageFunding = campaigns.length > 0 ? totalRaised / campaigns.length : 0;
      const fundingGoalProgress = totalGoalAmount > 0 ? (totalRaised / totalGoalAmount) * 100 : 0;
      
      res.json({
        totalRaised: totalRaised.toFixed(4),
        totalContributed: totalContributed.toFixed(4),
        totalGoalAmount: totalGoalAmount.toFixed(4),
        averageFunding: averageFunding.toFixed(4),
        fundingGoalProgress: Math.round(fundingGoalProgress),
        campaignStats: {
          total: campaigns.length,
          active: activeCampaigns.length,
          pending: pendingCampaigns.length,
          completed: completedCampaigns.length,
          rejected: rejectedCampaigns.length
        },
        contributionStats: {
          totalContributions: contributions.length,
          averageContribution: contributions.length > 0 ? totalContributed / contributions.length : 0
        }
      });
    } catch (error) {
      console.error("Error fetching financial overview:", error);
      res.status(500).json({ message: "Failed to fetch financial overview" });
    }
  });

  // User notifications
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.put('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });


  // Handle API 404s properly
  app.all('/api/*', (req, res) => {
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method 
    });
  });

  // Error handling middleware for API routes
  app.use('/api/*', (err: any, req: any, res: any, next: any) => {
    console.error('API Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
