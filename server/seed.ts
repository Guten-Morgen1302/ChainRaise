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
        kycStatus: "verified" as const,
        profileImageUrl: null,
        walletAddress: "0x742d35Cc6e1B5b5e8b8E2Be2B8D8B8B8B8B8B8B8",
        kycDocuments: null,
      },
      {
        username: "sarahdesign",
        email: "sarah@example.com", 
        password: "$scrypt$N=16384,r=8,p=1$8f8c4e6a9b8d7c5e$a8f5f167f44f4964e6c998dee827110c",
        firstName: "Sarah",
        lastName: "Design",
        kycStatus: "verified" as const,
        profileImageUrl: null,
        walletAddress: "0x1234567890123456789012345678901234567890",
        kycDocuments: null,
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

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}