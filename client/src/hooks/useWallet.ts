import { useState, useEffect } from 'react';
import { BrowserProvider, formatEther, parseEther } from 'ethers';
import { DEFAULT_NETWORK } from '@shared/contract';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface WalletState {
  isConnected: boolean;
  address: string;
  balance: string;
  loading: boolean;
  error: string | null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: '',
    balance: '0',
    loading: false,
    error: null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if already connected on mount
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const address = accounts[0].address;
        const balance = await provider.getBalance(address);
        
        setWallet({
          isConnected: true,
          address,
          balance: formatEther(balance),
          loading: false,
          error: null,
        });

        // Save wallet connection to user profile
        await saveWalletToProfile(address);
      }
    } catch (error) {
      console.error('Wallet check error:', error);
    }
  };

  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate wallet connection process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock connection failure occasionally for realism
      if (Math.random() < 0.1) {
        throw new Error("User rejected the connection request");
      }

      // Generate mock wallet data
      const mockAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockBalance = (Math.random() * 5 + 0.5).toFixed(4); // Random balance between 0.5-5.5 AVAX

      setWallet({
        isConnected: true,
        address: mockAddress,
        balance: mockBalance,
        loading: false,
        error: null,
      });

      // Save wallet connection to user profile
      await saveWalletToProfile(mockAddress);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
      });

    } catch (error: any) {
      setWallet(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to connect wallet' 
      }));
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const switchToAvalanche = async () => {
    // Mock network switch for demo
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const saveWalletToProfile = async (address: string) => {
    try {
      await apiRequest('PUT', '/api/user/wallet', { walletAddress: address });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    } catch (error) {
      console.error('Failed to save wallet to profile:', error);
    }
  };

  const makePayment = async (campaignId: string, amount: string) => {
    if (!wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock transaction failure occasionally for realism
    if (Math.random() < 0.05) {
      throw new Error('Transaction failed due to network congestion. Please try again.');
    }

    // Generate mock transaction hash
    const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Mock balance update (subtract amount + gas fee)
    const currentBalance = parseFloat(wallet.balance);
    const paymentAmount = parseFloat(amount);
    const gasFee = 0.001; // Mock gas fee
    const newBalance = Math.max(0, currentBalance - paymentAmount - gasFee);
    
    setWallet(prev => ({ ...prev, balance: newBalance.toFixed(6) }));

    // Log transaction in database
    const transactionData = {
      transactionHash: mockHash,
      amount: amount,
      walletAddress: wallet.address,
      campaignId: campaignId,
      status: 'completed',
      transactionType: 'funding'
    };

    try {
      await apiRequest('POST', '/api/public/transactions/avalanche', transactionData);
    } catch (error) {
      console.warn('Failed to log transaction to database:', error);
    }
    
    // Invalidate queries to refresh transaction data
    queryClient.invalidateQueries({ queryKey: ['/api/transactions/avalanche'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions/avalanche'] });
    queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    
    return {
      hash: mockHash,
      amount,
      timestamp: new Date().toISOString(),
    };
  };

  const refreshBalance = async () => {
    if (!wallet.isConnected) return;
    
    try {
      // Mock balance refresh
      const mockBalance = (Math.random() * 5 + 0.5).toFixed(4);
      setWallet(prev => ({ ...prev, balance: mockBalance }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: '',
      balance: '0',
      loading: false,
      error: null,
    });
  };

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    makePayment,
    refreshBalance,
  };
}