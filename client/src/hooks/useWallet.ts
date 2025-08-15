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
    if (!window.ethereum) {
      setWallet(prev => ({ ...prev, error: 'MetaMask not found. Please install MetaMask.' }));
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    setWallet(prev => ({ ...prev, loading: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      // Check and switch network
      await switchToAvalanche();
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
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

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
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
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xa869' }], // 43113 hex
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xa869',
            chainName: DEFAULT_NETWORK.name,
            nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
            rpcUrls: [DEFAULT_NETWORK.rpcHttpUrl],
            blockExplorerUrls: ['https://testnet.snowtrace.io/']
          }]
        });
      } else {
        throw error;
      }
    }
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
    if (!wallet.isConnected || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Send transaction
    const tx = await signer.sendTransaction({
      to: '0x0000000000000000000000000000000000000000', // Burn address for demo
      value: parseEther(amount),
    });

    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed');
    }

    // Log transaction in database
    const transactionData = {
      transactionHash: receipt.hash,
      amount: amount,
      walletAddress: wallet.address,
      campaignId: campaignId,
      status: 'completed',
    };

    await apiRequest('POST', '/api/transactions/avalanche', transactionData);
    
    // Update wallet balance
    const newBalance = await provider.getBalance(wallet.address);
    setWallet(prev => ({ ...prev, balance: formatEther(newBalance) }));
    
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    
    return {
      hash: receipt.hash,
      amount,
      timestamp: new Date().toISOString(),
    };
  };

  const refreshBalance = async () => {
    if (!wallet.isConnected || !window.ethereum) return;
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(wallet.address);
      setWallet(prev => ({ ...prev, balance: formatEther(balance) }));
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