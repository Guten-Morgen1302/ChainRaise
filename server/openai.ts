import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface CampaignOptimization {
  titleSuggestions: string[];
  descriptionEnhancements: string[];
  fundingPrediction: {
    successProbability: number;
    recommendedGoal: number;
    estimatedDuration: number;
  };
  credibilityScore: number;
  marketAnalysis: {
    similarCampaigns: number;
    categoryTrends: string;
    competitionLevel: string;
  };
}

export async function optimizeCampaignTitle(title: string): Promise<{
  suggestions: string[];
  engagementBoost: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a crowdfunding optimization expert. Analyze campaign titles and provide 3 improved alternatives that increase engagement. Respond with JSON in this format: { 'suggestions': ['title1', 'title2', 'title3'], 'engagementBoost': 'percentage increase estimate' }",
        },
        {
          role: "user",
          content: `Optimize this crowdfunding campaign title: "${title}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      suggestions: result.suggestions || [],
      engagementBoost: result.engagementBoost || "0%",
    };
  } catch (error) {
    throw new Error("Failed to optimize campaign title: " + error.message);
  }
}

export async function enhanceCampaignDescription(description: string, category: string): Promise<{
  enhancedDescription: string;
  keyImprovements: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a crowdfunding copywriting expert. Enhance campaign descriptions to be more compelling and persuasive. Focus on clear value propositions, emotional connection, and credibility. Respond with JSON in this format: { 'enhancedDescription': 'improved text', 'keyImprovements': ['improvement1', 'improvement2'] }",
        },
        {
          role: "user",
          content: `Enhance this ${category} crowdfunding campaign description: "${description}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      enhancedDescription: result.enhancedDescription || description,
      keyImprovements: result.keyImprovements || [],
    };
  } catch (error) {
    throw new Error("Failed to enhance campaign description: " + error.message);
  }
}

export async function analyzeCampaignCredibility(campaignData: {
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  creatorKycStatus: string;
}): Promise<{
  score: number;
  factors: {
    factor: string;
    impact: string;
    score: number;
  }[];
  recommendations: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a crowdfunding credibility analyst. Analyze campaigns and provide credibility scores (0-10) based on various factors. Respond with JSON in this format: { 'score': number, 'factors': [{'factor': 'string', 'impact': 'positive/negative/neutral', 'score': number}], 'recommendations': ['rec1', 'rec2'] }",
        },
        {
          role: "user",
          content: `Analyze the credibility of this campaign: Title: "${campaignData.title}", Description: "${campaignData.description}", Category: ${campaignData.category}, Goal: $${campaignData.goalAmount}, KYC Status: ${campaignData.creatorKycStatus}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      score: Math.max(0, Math.min(10, result.score || 0)),
      factors: result.factors || [],
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    throw new Error("Failed to analyze campaign credibility: " + error.message);
  }
}

export async function predictFundingSuccess(campaignData: {
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  duration: number;
}): Promise<{
  successProbability: number;
  recommendedGoal: number;
  marketInsights: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a crowdfunding market analyst. Predict funding success probability and provide optimization recommendations. Respond with JSON in this format: { 'successProbability': number (0-1), 'recommendedGoal': number, 'marketInsights': ['insight1', 'insight2'] }",
        },
        {
          role: "user",
          content: `Analyze funding potential: Category: ${campaignData.category}, Goal: $${campaignData.goalAmount}, Duration: ${campaignData.duration} days, Title: "${campaignData.title}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      successProbability: Math.max(0, Math.min(1, result.successProbability || 0)),
      recommendedGoal: result.recommendedGoal || campaignData.goalAmount,
      marketInsights: result.marketInsights || [],
    };
  } catch (error) {
    throw new Error("Failed to predict funding success: " + error.message);
  }
}
