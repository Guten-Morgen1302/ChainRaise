import { storage } from "./storage";
import { sql } from "drizzle-orm";
import { db } from "./db";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Check if we already have data
    const existingCampaigns = await storage.getCampaigns({ limit: 1 });
    if (existingCampaigns.length > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }

    // Create sample users
    const sampleUsers = [
      {
        username: "johntech",
        email: "john@example.com",
        password: "$scrypt$N=16384,r=8,p=1$8f8c4e6a9b8d7c5e$a8f5f167f44f4964e6c998dee827110c",
        firstName: "John",
        lastName: "Tech",
        role: "admin" as const, // Make first user admin
        kycStatus: "approved" as const,
        profileImageUrl: null,
        walletAddress: "0x742d35Cc6e1B5b5e8b8E2Be2B8D8B8B8B8B8B8B8",
        kycDocuments: null,
        isFlagged: false,
        flaggedReason: null,
        flaggedBy: null,
        flaggedAt: null,
        profileCompletion: 100,
        joinDate: new Date(),
      },
      {
        username: "sarahdesign",
        email: "sarah@example.com", 
        password: "$scrypt$N=16384,r=8,p=1$8f8c4e6a9b8d7c5e$a8f5f167f44f4964e6c998dee827110c",
        firstName: "Sarah",
        lastName: "Design",
        role: "user" as const,
        kycStatus: "approved" as const,
        profileImageUrl: null,
        walletAddress: "0x1234567890123456789012345678901234567890",
        kycDocuments: null,
        isFlagged: false,
        flaggedReason: null,
        flaggedBy: null,
        flaggedAt: null,
        profileCompletion: 90,
        joinDate: new Date(),
      },
      {
        username: "admin",
        email: "admin@cryptofund.com",
        password: "$scrypt$N=16384,r=8,p=1$8f8c4e6a9b8d7c5e$a8f5f167f44f4964e6c998dee827110c",
        firstName: "Admin",
        lastName: "User",
        role: "admin" as const,
        kycStatus: "approved" as const,
        profileImageUrl: null,
        walletAddress: null,
        kycDocuments: null,
        isFlagged: false,
        flaggedReason: null,
        flaggedBy: null,
        flaggedAt: null,
        profileCompletion: 100,
        joinDate: new Date(),
      },
    ];

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await storage.createUser(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create sample campaigns
    const sampleCampaigns = [
      {
        creatorId: createdUsers[0].id,
        title: "Revolutionary Blockchain Gaming Platform",
        description: "Building the next-generation gaming platform that combines blockchain technology with immersive gameplay. Our platform will feature NFT-based characters, decentralized tournaments, and cross-game asset portability.",
        category: "technology",
        fundingType: "equity" as const,
        goalAmount: "500000.0",
        currency: "ETH",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop&crop=entropy",
        status: "active" as const,
        smartContractAddress: "0x9876543210987654321098765432109876543210",
        tags: ["gaming", "blockchain", "nft", "web3"],
        rewards: [
          { tier: "bronze", amount: "100", description: "Early access to beta + digital collectible" },
          { tier: "silver", amount: "500", description: "Beta access + limited edition NFT character" },
          { tier: "gold", amount: "1000", description: "All above + private tournament access" }
        ],
        updates: [],
      },
      {
        creatorId: createdUsers[1].id,
        title: "Sustainable Fashion Marketplace",
        description: "An eco-friendly fashion marketplace connecting sustainable brands with conscious consumers. We're creating a platform that tracks the entire supply chain using blockchain technology for complete transparency.",
        category: "fashion",
        fundingType: "donation" as const,
        goalAmount: "250000.0",
        currency: "ETH",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop&crop=entropy",
        status: "active" as const,
        smartContractAddress: "0x1111222233334444555566667777888899990000",
        tags: ["fashion", "sustainability", "marketplace", "eco-friendly"],
        rewards: [
          { tier: "supporter", amount: "50", description: "Thank you note + sticker pack" },
          { tier: "advocate", amount: "200", description: "Sustainable fashion starter kit" },
          { tier: "champion", amount: "500", description: "Limited edition sustainable wardrobe" }
        ],
        updates: [],
      },
      {
        creatorId: createdUsers[0].id,
        title: "DeFi Lending Protocol",
        description: "A decentralized lending protocol that allows users to lend and borrow crypto assets with dynamic interest rates. Our innovative algorithm optimizes yields while minimizing risks.",
        category: "finance",
        fundingType: "equity" as const,
        goalAmount: "1000000.0",
        currency: "ETH",
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop&crop=entropy",
        status: "active" as const,
        smartContractAddress: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12",
        tags: ["defi", "lending", "protocol", "yield"],
        rewards: [],
        updates: [],
      }
    ];

    const createdCampaigns = [];
    for (const campaignData of sampleCampaigns) {
      const campaign = await storage.createCampaign(campaignData);
      createdCampaigns.push(campaign);
      console.log(`Created campaign: ${campaign.title}`);
    }

    // Create sample contributions
    const sampleContributions = [
      {
        campaignId: createdCampaigns[0].id,
        backerId: createdUsers[1].id,
        amount: "5000.0",
        currency: "ETH",
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        paymentMethod: "crypto" as const,
        isAnonymous: false,
        message: "Excited to see this project succeed!",
        rewardTier: "silver",
        status: "confirmed" as const,
      },
      {
        campaignId: createdCampaigns[1].id,
        backerId: createdUsers[0].id,
        amount: "1000.0",
        currency: "ETH",
        transactionHash: "0x9876543210987654321098765432109876543210987654321098765432109876",
        paymentMethod: "crypto" as const,
        isAnonymous: false,
        message: "Supporting sustainable fashion innovation!",
        rewardTier: "advocate",
        status: "confirmed" as const,
      }
    ];

    for (const contributionData of sampleContributions) {
      const contribution = await storage.createContribution(contributionData);
      console.log(`Created contribution: ${contribution.amount} ${contribution.currency}`);
    }

    // Update campaign current amounts
    await db.execute(sql`
      UPDATE campaigns 
      SET current_amount = COALESCE((
        SELECT SUM(CAST(amount AS DECIMAL)) 
        FROM contributions 
        WHERE campaign_id = campaigns.id AND status = 'confirmed'
      ), 0),
      backer_count = COALESCE((
        SELECT COUNT(DISTINCT backer_id) 
        FROM contributions 
        WHERE campaign_id = campaigns.id AND status = 'confirmed'
      ), 0)
    `);

    // Create sample transactions for live display
    const sampleTransactions = [
      {
        hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        campaignId: createdCampaigns[0].id,
        fromAddress: "0x742d35Cc6e1B5b5e8b8E2Be2B8D8B8B8B8B8B8B8",
        toAddress: createdCampaigns[0].smartContractAddress,
        amount: "5000.0",
        gasUsed: "21000",
        gasPrice: "0.02",
        blockNumber: "18567432",
        transactionType: "contribution" as const,
        status: "confirmed" as const,
      },
      {
        hash: "0x9876543210987654321098765432109876543210987654321098765432109876",
        campaignId: createdCampaigns[1].id,
        fromAddress: "0x1234567890123456789012345678901234567890",
        toAddress: createdCampaigns[1].smartContractAddress,
        amount: "1000.0",
        gasUsed: "21000",
        gasPrice: "0.018",
        blockNumber: "18567445",
        transactionType: "contribution" as const,
        status: "confirmed" as const,
      },
      {
        hash: "0x5678901234567890567890123456789056789012345678905678901234567890",
        campaignId: createdCampaigns[2].id,
        fromAddress: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12",
        toAddress: createdCampaigns[2].smartContractAddress,
        amount: "2500.0",
        gasUsed: "21000",
        gasPrice: "0.025",
        blockNumber: "18567456",
        transactionType: "contribution" as const,
        status: "confirmed" as const,
      }
    ];

    for (const transactionData of sampleTransactions) {
      const transaction = await storage.createTransaction(transactionData);
      console.log(`Created transaction: ${transaction.hash.substring(0, 10)}...`);
    }

    // Create sample Avalanche transactions for the blockchain demo
    const sampleAvalancheTransactions = [
      {
        transactionHash: "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
        amount: "15.5",
        walletAddress: "0x742d35Cc6e1B5b5e8b8E2Be2B8D8B8B8B8B8B8B8",
        campaignId: createdCampaigns[0].id,
        transactionType: "funding" as const,
        status: "confirmed" as const,
        userId: createdUsers[0].id,
      },
      {
        transactionHash: "0xb2c3d4e5f67890123456789012345678901234567890123456789012345678901",
        amount: "8.25",
        walletAddress: "0x1234567890123456789012345678901234567890",
        campaignId: createdCampaigns[1].id,
        transactionType: "funding" as const,
        status: "confirmed" as const,
        userId: createdUsers[1].id,
      },
      {
        transactionHash: "0xc3d4e5f6789012345678901234567890123456789012345678901234567890123",
        amount: "22.75",
        walletAddress: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12",
        campaignId: createdCampaigns[2].id,
        transactionType: "funding" as const,
        status: "confirmed" as const,
        userId: createdUsers[0].id,
      }
    ];

    for (const avalancheTransactionData of sampleAvalancheTransactions) {
      const avalancheTransaction = await storage.createAvalancheTransaction(avalancheTransactionData);
      console.log(`Created Avalanche transaction: ${avalancheTransaction.transactionHash.substring(0, 10)}...`);
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}