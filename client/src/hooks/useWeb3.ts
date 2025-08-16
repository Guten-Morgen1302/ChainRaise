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
    // Check if mock wallet is already connected
    const storedWallet = localStorage.getItem('mock_web3_wallet');
    if (storedWallet) {
      try {
        const walletData = JSON.parse(storedWallet);
        setProvider(walletData);
      } catch (error) {
        console.error('Failed to parse stored wallet:', error);
      }
    }
  };

  const connectWallet = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate wallet connection process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock connection failure occasionally for realism
      if (Math.random() < 0.1) {
        throw new Error("User rejected the connection request");
      }

      // Generate mock wallet data
      const mockAccount = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockBalance = (Math.random() * 5 + 0.5).toFixed(4); // Random balance between 0.5-5.5 ETH
      const mockChainId = 43113; // Avalanche Fuji testnet
      
      const walletData = {
        isConnected: true,
        account: mockAccount,
        chainId: mockChainId,
        balance: mockBalance,
      };
      
      setProvider(walletData);
      
      // Store wallet connection
      localStorage.setItem('mock_web3_wallet', JSON.stringify(walletData));

      toast({
        title: "Wallet Connected",
        description: `Connected to ${mockAccount.slice(0, 6)}...${mockAccount.slice(-4)}`,
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
    localStorage.removeItem('mock_web3_wallet');
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
    if (!provider.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      // Simulate payment processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock transaction failure occasionally for realism
      if (Math.random() < 0.05) {
        throw new Error('Transaction failed due to network congestion. Please try again.');
      }

      // Generate mock transaction hash
      const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Mock balance update (subtract amount + gas fee)
      const currentBalance = parseFloat(provider.balance || '0');
      const paymentAmount = parseFloat(amount);
      const gasFee = 0.001; // Mock gas fee
      const newBalance = Math.max(0, currentBalance - paymentAmount - gasFee);
      
      const updatedProvider = { ...provider, balance: newBalance.toFixed(6) };
      setProvider(updatedProvider);
      localStorage.setItem('mock_web3_wallet', JSON.stringify(updatedProvider));

      const result: TransactionResult = {
        hash: mockHash,
        status: 'confirmed',
        blockNumber: Math.floor(Math.random() * 1000000).toString(),
        gasUsed: '21000',
        gasPrice: '20',
      };

      // Try to log transaction to database
      if (campaignId) {
        try {
          const response = await fetch('/api/public/transactions/avalanche', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transactionHash: mockHash,
              amount: amount,
              walletAddress: provider.account,
              campaignId: campaignId,
              status: 'completed',
              transactionType: 'funding'
            })
          });
          
          if (!response.ok) {
            console.warn('Failed to log transaction to database');
          }
        } catch (error) {
          console.warn('Failed to log transaction to database:', error);
        }
      }

      toast({
        title: "Transaction Successful",
        description: `Sent ${amount} AVAX successfully`,
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
    try {
      // Simulate network switch
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProvider = { ...provider, chainId };
      setProvider(updatedProvider);
      localStorage.setItem('mock_web3_wallet', JSON.stringify(updatedProvider));
      
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