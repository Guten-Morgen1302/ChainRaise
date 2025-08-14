import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  optimizeCampaignTitle, 
  enhanceCampaignDescription, 
  analyzeCampaignCredibility,
  predictFundingSuccess 
} from "./openai";
import { insertCampaignSchema, insertContributionSchema, insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Add auth-specific routes that might be missing
  app.get('/api/auth/user', isAuthenticated, (req: any, res) => {
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      kycStatus: user.kycStatus,
      profileImageUrl: user.profileImageUrl,
      walletAddress: user.walletAddress,
    });
  });

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
      
      if (!user || user.kycStatus !== "verified") {
        return res.status(403).json({ message: "KYC verification required to create campaigns" });
      }

      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        creatorId: userId,
      });

      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ message: (error as Error).message || "Failed to create campaign" });
    }
  });

  app.put('/api/campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaign = await storage.getCampaign(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.creatorId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this campaign" });
      }

      const updatedCampaign = await storage.updateCampaign(req.params.id, req.body);
      res.json(updatedCampaign);
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
  app.put('/api/user/kyc', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { documents, status } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...user,
        kycStatus: status || "pending",
        kycDocuments: documents,
        updatedAt: new Date(),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating KYC:", error);
      res.status(500).json({ message: "Failed to update KYC status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
