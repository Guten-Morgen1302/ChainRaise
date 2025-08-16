// Web3 utilities and wallet integration for the crowdfunding platform
import { generateWalletAddress, generateTransactionHash, NETWORK_CONFIG } from "./blockchain";

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  connected: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: "crypto" | "fiat";
  currency: string;
  icon: string;
  available: boolean;
}

// Supported payment methods
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "eth",
    name: "Ethereum",
    type: "crypto",
    currency: "ETH",
    icon: "⟠",
    available: true,
  },
  {
    id: "matic",
    name: "Polygon",
    type: "crypto",
    currency: "MATIC",
    icon: "⬢",
    available: true,
  },
  {
    id: "usdc",
    name: "USD Coin",
    type: "crypto",
    currency: "USDC",
    icon: "$",
    available: true,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    type: "fiat",
    currency: "USD",
    icon: "💳",
    available: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    type: "fiat",
    currency: "USD",
    icon: "📱",
    available: false, // Mock disabled for demo
  },
];

// Wallet providers
export const WALLET_PROVIDERS = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    available: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    available: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🟦",
    available: true,
  },
];

/**
 * Mock MetaMask detection
 */
export function detectMetaMask(): boolean {
  // In real implementation, check for window.ethereum
  return typeof window !== "undefined" && Math.random() > 0.3; // 70% chance for demo
}

/**
 * Mock wallet connection with provider selection
 */
export async function connectWallet(providerId: string = "metamask"): Promise<WalletInfo> {
  // Simulate connection process
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock connection failure sometimes
  if (Math.random() < 0.1) {
    throw new Error("User rejected the connection request");
  }

  const address = generateWalletAddress();
  const balance = (Math.random() * 10 + 0.5).toFixed(4); // Random balance between 0.5-10.5 ETH

  const walletInfo: WalletInfo = {
    address,
    balance,
    network: NETWORK_CONFIG.name,
    connected: true,
  };

  // Store in localStorage for persistence
  localStorage.setItem("wallet_info", JSON.stringify(walletInfo));
  localStorage.setItem("wallet_provider", providerId);

  return walletInfo;
}

/**
 * Get stored wallet information
 */
export function getStoredWallet(): WalletInfo | null {
  try {
    const stored = localStorage.getItem("wallet_info");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to parse stored wallet info:", error);
  }
  return null;
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
  localStorage.removeItem("wallet_info");
  localStorage.removeItem("wallet_provider");
}

/**
 * Mock network switching
 */
export async function switchToPolygonMumbai(): Promise<void> {
  // Simulate network switch
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock switch failure sometimes
  if (Math.random() < 0.2) {
    throw new Error("Failed to switch network. Please switch manually in your wallet.");
  }
}

/**
 * Mock balance refresh
 */
export async function refreshBalance(address: string): Promise<string> {
  // Simulate balance fetch
  await new Promise(resolve => setTimeout(resolve, 500));

  const balance = (Math.random() * 10 + 0.5).toFixed(4);
  
  // Update stored wallet info
  const stored = getStoredWallet();
  if (stored) {
    stored.balance = balance;
    localStorage.setItem("wallet_info", JSON.stringify(stored));
  }

  return balance;
}

/**
 * Mock transaction signing and sending
 */
export async function sendTransaction(params: {
  to: string;
  amount: string;
  currency: string;
  gasLimit?: string;
  gasPrice?: string;
}): Promise<{
  hash: string;
  status: "pending" | "confirmed" | "failed";
}> {
  // Validate amount and balance first
  const wallet = getStoredWallet();
  if (!wallet) {
    throw new Error("Please connect your wallet first");
  }

  const amount = parseFloat(params.amount);
  const balance = parseFloat(wallet.balance);
  
  // Estimate gas if not provided
  const gasInfo = await estimateGas({
    to: params.to,
    amount: params.amount
  });
  
  const gasCost = parseFloat(gasInfo.gasCost);
  const totalCost = amount + gasCost;
  
  // Check if user has sufficient funds including gas
  if (totalCost > balance) {
    const shortfall = (totalCost - balance).toFixed(6);
    throw new Error(`Insufficient funds. You need ${shortfall} ${params.currency} more to cover the transaction amount and gas fees. Current balance: ${balance} ${params.currency}`);
  }

  // Simulate transaction signing
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock network congestion or other failures
  if (Math.random() < 0.03) {
    throw new Error("Network is congested. Please try again with higher gas fees.");
  }

  const hash = generateTransactionHash();

  // Update balance after successful transaction
  wallet.balance = (balance - totalCost).toFixed(6);
  localStorage.setItem("wallet_info", JSON.stringify(wallet));

  // Simulate mining time
  setTimeout(() => {
    console.log(`Transaction ${hash} confirmed`);
  }, 5000);

  return {
    hash,
    status: "pending",
  };
}

/**
 * Mock fiat payment processing
 */
export async function processFiatPayment(params: {
  amount: string;
  currency: string;
  paymentMethodId: string;
  campaignId: string;
}): Promise<{
  transactionId: string;
  status: "processing" | "completed" | "failed";
}> {
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Mock payment failure sometimes
  if (Math.random() < 0.1) {
    throw new Error("Payment failed: Card declined");
  }

  const transactionId = `fiat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    transactionId,
    status: "completed",
  };
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Copy address to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

/**
 * Validate amount input with gas fee consideration
 */
export async function validateAmount(amount: string, balance?: string, includingGas: boolean = true): Promise<{
  isValid: boolean;
  error?: string;
  gasInfo?: any;
}> {
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      isValid: false,
      error: "Please enter a valid amount",
    };
  }

  if (numAmount < 0.001) {
    return {
      isValid: false,
      error: "Minimum contribution is 0.001 ETH",
    };
  }

  let gasInfo;
  if (includingGas) {
    try {
      gasInfo = await estimateGas({
        to: "0x0000000000000000000000000000000000000000",
        amount: amount
      });
    } catch (error) {
      gasInfo = { gasCost: "0.02" }; // fallback gas estimate
    }
  }

  if (balance && includingGas && gasInfo) {
    const totalNeeded = numAmount + parseFloat(gasInfo.gasCost);
    if (totalNeeded > parseFloat(balance)) {
      const shortfall = (totalNeeded - parseFloat(balance)).toFixed(6);
      return {
        isValid: false,
        error: `Insufficient funds. You need ${shortfall} ETH more for the transaction and gas fees.`,
        gasInfo
      };
    }
  } else if (balance && numAmount > parseFloat(balance)) {
    return {
      isValid: false,
      error: "Insufficient balance",
    };
  }

  return { isValid: true, gasInfo };
}

/**
 * Convert between currencies (mock rates)
 */
export function convertCurrency(
  amount: string,
  fromCurrency: string,
  toCurrency: string
): string {
  const mockRates: Record<string, Record<string, number>> = {
    ETH: {
      USD: 2000,
      MATIC: 1500,
      USDC: 2000,
    },
    MATIC: {
      USD: 1.33,
      ETH: 0.0007,
      USDC: 1.33,
    },
    USDC: {
      USD: 1,
      ETH: 0.0005,
      MATIC: 0.75,
    },
    USD: {
      ETH: 0.0005,
      MATIC: 0.75,
      USDC: 1,
    },
  };

  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = mockRates[fromCurrency]?.[toCurrency] || 1;
  const converted = parseFloat(amount) * rate;

  return converted.toFixed(6);
}

/**
 * Get gas estimate for transaction
 */
export async function estimateGas(params: {
  to: string;
  amount: string;
  data?: string;
}): Promise<{
  gasLimit: string;
  gasPrice: string;
  gasCost: string;
  gasCostUSD: string;
}> {
  // Simulate gas estimation
  await new Promise(resolve => setTimeout(resolve, 300));

  const baseGas = params.data ? 50000 : 21000;
  const gasLimit = (baseGas + Math.floor(Math.random() * 10000)).toString();
  const gasPrice = (Math.random() * 20 + 10).toFixed(2); // 10-30 gwei
  const gasCost = ((parseFloat(gasLimit) * parseFloat(gasPrice)) / 1e9).toFixed(6);
  const gasCostUSD = (parseFloat(gasCost) * 2000).toFixed(2); // Assuming $2000 ETH price

  return {
    gasLimit,
    gasPrice,
    gasCost,
    gasCostUSD,
  };
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Generate QR code data for campaign sharing
 */
export function generateCampaignQR(campaignId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/campaigns/${campaignId}`;
}

/**
 * Mock wallet event listeners
 */
export class WalletEventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Mock events that could be emitted
  simulateAccountChange(newAddress: string) {
    this.emit("accountsChanged", [newAddress]);
  }

  simulateNetworkChange(chainId: number) {
    this.emit("chainChanged", `0x${chainId.toString(16)}`);
  }

  simulateDisconnect() {
    this.emit("disconnect");
  }
}

// Global wallet event emitter instance
export const walletEvents = new WalletEventEmitter();

// Mock periodic events for demo
if (typeof window !== "undefined") {
  // Simulate occasional account changes
  setInterval(() => {
    if (Math.random() < 0.01 && getStoredWallet()) { // 1% chance every 10 seconds
      const newAddress = generateWalletAddress();
      walletEvents.simulateAccountChange(newAddress);
    }
  }, 10000);
}
