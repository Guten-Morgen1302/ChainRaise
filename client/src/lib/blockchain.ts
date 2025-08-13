// Mock blockchain utilities for Web3 crowdfunding platform
// This simulates Polygon Mumbai testnet interactions

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
}

export interface SmartContract {
  address: string;
  abi: any[];
  network: string;
}

export interface CampaignContract {
  address: string;
  creator: string;
  goalAmount: string;
  currentAmount: string;
  deadline: number;
  isActive: boolean;
  backers: string[];
}

// Mock contract addresses for different campaign types
export const CAMPAIGN_CONTRACTS = {
  donation: "0x1234567890abcdef1234567890abcdef12345678",
  reward: "0xabcdef1234567890abcdef1234567890abcdef12",
  equity: "0xfedcba0987654321fedcba0987654321fedcba09",
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 80001, // Polygon Mumbai Testnet
  name: "Polygon Mumbai",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  blockExplorer: "https://mumbai.polygonscan.com",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
};

/**
 * Generate a mock transaction hash
 */
export function generateTransactionHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

/**
 * Generate a mock wallet address
 */
export function generateWalletAddress(): string {
  const chars = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

/**
 * Mock function to deploy a campaign smart contract
 */
export async function deployCampaignContract(params: {
  creator: string;
  goalAmount: string;
  deadline: number;
  fundingType: "donation" | "reward" | "equity";
}): Promise<SmartContract> {
  // Simulate deployment delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const contractAddress = generateWalletAddress();
  
  return {
    address: contractAddress,
    abi: [], // Mock ABI
    network: NETWORK_CONFIG.name,
  };
}

/**
 * Mock function to contribute to a campaign
 */
export async function contributeToAmpaign(params: {
  contractAddress: string;
  amount: string;
  from: string;
}): Promise<BlockchainTransaction> {
  // Simulate transaction processing
  await new Promise(resolve => setTimeout(resolve, 1500));

  const transaction: BlockchainTransaction = {
    hash: generateTransactionHash(),
    from: params.from,
    to: params.contractAddress,
    value: params.amount,
    gasUsed: "21000",
    gasPrice: "0.02",
    blockNumber: Math.floor(Math.random() * 1000000) + 12345000,
    timestamp: Date.now(),
    status: "confirmed",
  };

  return transaction;
}

/**
 * Mock function to withdraw funds from campaign
 */
export async function withdrawFunds(params: {
  contractAddress: string;
  amount: string;
  to: string;
}): Promise<BlockchainTransaction> {
  // Simulate withdrawal processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  const transaction: BlockchainTransaction = {
    hash: generateTransactionHash(),
    from: params.contractAddress,
    to: params.to,
    value: params.amount,
    gasUsed: "35000",
    gasPrice: "0.02",
    blockNumber: Math.floor(Math.random() * 1000000) + 12345000,
    timestamp: Date.now(),
    status: "confirmed",
  };

  return transaction;
}

/**
 * Mock function to get campaign contract details
 */
export async function getCampaignDetails(contractAddress: string): Promise<CampaignContract> {
  // Simulate blockchain call
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    address: contractAddress,
    creator: generateWalletAddress(),
    goalAmount: "100.0",
    currentAmount: (Math.random() * 100).toFixed(2),
    deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    isActive: true,
    backers: [
      generateWalletAddress(),
      generateWalletAddress(),
      generateWalletAddress(),
    ],
  };
}

/**
 * Mock function to get transaction details
 */
export async function getTransactionDetails(hash: string): Promise<BlockchainTransaction | null> {
  // Simulate blockchain query
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock transaction not found sometimes
  if (Math.random() < 0.1) {
    return null;
  }

  return {
    hash,
    from: generateWalletAddress(),
    to: generateWalletAddress(),
    value: (Math.random() * 10).toFixed(4),
    gasUsed: "21000",
    gasPrice: "0.02",
    blockNumber: Math.floor(Math.random() * 1000000) + 12345000,
    timestamp: Date.now() - Math.random() * 86400000, // Random time in last 24h
    status: "confirmed",
  };
}

/**
 * Mock function to get network statistics
 */
export async function getNetworkStats(): Promise<{
  latestBlock: number;
  gasPrice: string;
  totalTransactions: number;
  activeValidators: number;
}> {
  // Simulate network query
  await new Promise(resolve => setTimeout(resolve, 200));

  return {
    latestBlock: Math.floor(Math.random() * 1000) + 12345000,
    gasPrice: (Math.random() * 0.05 + 0.01).toFixed(4),
    totalTransactions: Math.floor(Math.random() * 1000000) + 5000000,
    activeValidators: Math.floor(Math.random() * 50) + 100,
  };
}

/**
 * Format wei to ETH
 */
export function formatEther(wei: string): string {
  const eth = parseFloat(wei) / Math.pow(10, 18);
  return eth.toFixed(4);
}

/**
 * Format ETH to wei
 */
export function parseEther(eth: string): string {
  const wei = parseFloat(eth) * Math.pow(10, 18);
  return wei.toString();
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash format
 */
export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Get block explorer URL for transaction
 */
export function getTransactionUrl(hash: string): string {
  return `${NETWORK_CONFIG.blockExplorer}/tx/${hash}`;
}

/**
 * Get block explorer URL for address
 */
export function getAddressUrl(address: string): string {
  return `${NETWORK_CONFIG.blockExplorer}/address/${address}`;
}

/**
 * Calculate gas cost in ETH
 */
export function calculateGasCost(gasUsed: string, gasPrice: string): string {
  const cost = parseFloat(gasUsed) * parseFloat(gasPrice) / Math.pow(10, 9);
  return cost.toFixed(6);
}

/**
 * Estimate gas for contribution transaction
 */
export function estimateContributionGas(amount: string): Promise<string> {
  // Simple estimation based on amount
  const baseGas = 21000;
  const extraGas = parseFloat(amount) > 1 ? 5000 : 0;
  return Promise.resolve((baseGas + extraGas).toString());
}

/**
 * Mock function to check if wallet is connected
 */
export function isWalletConnected(): boolean {
  // Check if wallet connection exists in localStorage
  return localStorage.getItem("wallet_connected") === "true";
}

/**
 * Mock function to connect wallet
 */
export async function connectWallet(): Promise<string> {
  // Simulate wallet connection process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const address = generateWalletAddress();
  localStorage.setItem("wallet_connected", "true");
  localStorage.setItem("wallet_address", address);
  
  return address;
}

/**
 * Mock function to disconnect wallet
 */
export function disconnectWallet(): void {
  localStorage.removeItem("wallet_connected");
  localStorage.removeItem("wallet_address");
}

/**
 * Get connected wallet address
 */
export function getWalletAddress(): string | null {
  return localStorage.getItem("wallet_address");
}
