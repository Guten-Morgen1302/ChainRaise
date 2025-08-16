import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BrowserProvider, formatEther, parseEther } from 'ethers';

export interface Web3Provider {
  isConnected: boolean;
  account?: string;
  chainId?: number;
  balance?: string;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: string;
  gasUsed?: string;
  gasPrice?: string;
}

export function useWeb3() {
  const [provider, setProvider] = useState<Web3Provider>({
    isConnected: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      const ethProvider = new BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request?.({ method: 'eth_accounts' }) || [];
      
      if (accounts.length > 0) {
        const account = accounts[0];
        const network = await ethProvider.getNetwork();
        const balance = await ethProvider.getBalance(account);
        
        setProvider({
          isConnected: true,
          account,
          chainId: Number(network.chainId),
          balance: formatEther(balance),
        });
      }
    } catch (error) {
      console.error('Wallet check error:', error);
    }
  };

  const connectWallet = async (): Promise<boolean> => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      const ethProvider = new BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request?.({ method: 'eth_requestAccounts' }) || [];
      if (!accounts.length) {
        throw new Error('No accounts found');
      }
      
      const account = accounts[0];
      const network = await ethProvider.getNetwork();
      const balance = await ethProvider.getBalance(account);
      
      setProvider({
        isConnected: true,
        account,
        chainId: Number(network.chainId),
        balance: formatEther(balance),
      });

      toast({
        title: "Wallet Connected",
        description: `Connected to ${account.slice(0, 6)}...${account.slice(-4)}`,
      });

      return true;
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setProvider({ isConnected: false });
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from wallet",
    });
  };

  const sendTransaction = async (
    to: string,
    amount: string,
    campaignId?: string
  ): Promise<TransactionResult | null> => {
    if (!provider.isConnected || !window.ethereum) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      const ethProvider = new BrowserProvider(window.ethereum);
      const signer = await ethProvider.getSigner();
      
      // Send transaction
      const tx = await signer.sendTransaction({
        to,
        value: parseEther(amount),
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      const result: TransactionResult = {
        hash: receipt.hash,
        status: 'confirmed',
        blockNumber: receipt.blockNumber?.toString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: receipt.gasPrice?.toString(),
      };

      toast({
        title: "Transaction Successful",
        description: `Sent ${amount} ETH successfully`,
      });

      return result;
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Transaction was rejected or failed",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const switchNetwork = async (chainId: number): Promise<boolean> => {
    if (!window.ethereum) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      setProvider(prev => ({ ...prev, chainId }));
      
      const networkName = getNetworkName(chainId);
      toast({
        title: "Network Switched",
        description: `Switched to ${networkName}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Network switch error:', error);
      toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch network",
        variant: "destructive",
      });
      return false;
    }
  };

  const getNetworkName = (chainId?: number): string => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Polygon Mumbai';
      case 43114: return 'Avalanche Mainnet';
      case 43113: return 'Avalanche Fuji';
      case 56: return 'BSC Mainnet';
      case 97: return 'BSC Testnet';
      default: return `Chain ID: ${chainId || 'Unknown'}`;
    }
  };

  const formatBalance = (balance?: string): string => {
    if (!balance) return '0.00';
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  return {
    provider,
    isLoading,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    switchNetwork,
    getNetworkName,
    formatBalance,
    isConnected: provider.isConnected,
    account: provider.account,
    balance: provider.balance,
    chainId: provider.chainId,
  };
}