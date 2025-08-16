import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, DEFAULT_NETWORK } from '../../../shared/contract';

declare global {
  interface Window { 
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] | Record<string, any> }) => Promise<any>;
      send?: (method: string, params?: any[]) => Promise<any>;
      on?: (event: string, callback: (data: any) => void) => void;
      removeListener?: (event: string, callback: (data: any) => void) => void;
    }
  }
}

export async function getProviderAndSigner() {
  if (!window.ethereum) throw new Error('Please install MetaMask or another Web3 wallet to continue');
  
  try {
    const provider = new BrowserProvider(window.ethereum);

    // Request account access first
    await provider.send('eth_requestAccounts', []);

    // Check current network
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    
    if (currentChainId !== DEFAULT_NETWORK.chainId) {
      // Attempt to switch to Avalanche Fuji testnet
      try {
        await window.ethereum!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xa869' }], // 43113 hex
        });
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum!.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xa869',
                chainName: DEFAULT_NETWORK.name,
                nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
                rpcUrls: [DEFAULT_NETWORK.rpcHttpUrl],
                blockExplorerUrls: ['https://testnet.snowtrace.io/']
              }]
            });
          } catch (addError: any) {
            throw new Error(`Failed to add Avalanche Fuji network: ${addError.message || 'Unknown error'}`);
          }
        } else if (switchError.code === 4001) {
          throw new Error('Please switch to Avalanche Fuji testnet to continue');
        } else {
          throw new Error(`Failed to switch to Avalanche Fuji: ${switchError.message || 'Unknown error'}`);
        }
      }
    }

    const signer = await provider.getSigner();
    return { provider, signer };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Please connect your wallet to continue');
    }
    throw error;
  }
}

export async function getReadOnlyContract() {
  // Read via your backend (recommended) OR direct RPC:
  if (!window.ethereum) throw new Error('MetaMask not found');
  const provider = new BrowserProvider(window.ethereum);
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function getWriteContract() {
  const { signer } = await getProviderAndSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// Actions
export async function fund(amountEth: string) {
  try {
    // Validate amount
    const amount = parseFloat(amountEth);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Please enter a valid funding amount greater than 0');
    }

    // Get contract instance
    const c = await getWriteContract();
    
    // Check wallet balance
    const { signer } = await getProviderAndSigner();
    const balance = await signer.provider.getBalance(signer.address);
    const requiredAmount = parseEther(amountEth);
    
    if (balance < requiredAmount) {
      throw new Error(`Insufficient balance. Required: ${amountEth} AVAX, Available: ${(Number(balance) / 1e18).toFixed(4)} AVAX`);
    }

    // Send transaction with proper gas estimation
    const tx = await c.fund({ 
      value: requiredAmount,
      gasLimit: 100000 // Set reasonable gas limit
    });
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (!receipt || !receipt.hash) {
      throw new Error('Transaction failed - no receipt received');
    }
    
    // Save transaction to database
    try {
      const walletAddress = await signer.getAddress();
      
      const response = await fetch(`${window.location.origin}/api/public/transactions/avalanche`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionHash: receipt.hash,
          amount: amountEth,
          walletAddress,
          campaignId: 'contract-demo',
          status: 'completed',
          transactionType: 'funding'
        })
      });
      
      if (!response.ok) {
        console.warn('Failed to save transaction to database:', await response.text());
      }
    } catch (error) {
      console.warn('Failed to save transaction to database:', error);
      // Don't throw here - transaction succeeded even if DB save failed
    }
    
    return receipt;
  } catch (error: any) {
    // Provide more specific error messages
    if (error.code === 4001) {
      throw new Error('Transaction was rejected by user');
    } else if (error.code === -32603) {
      throw new Error('Transaction failed - please check your wallet balance and network connection');
    } else if (error.reason) {
      throw new Error(`Smart contract error: ${error.reason}`);
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Transaction failed - unknown error occurred');
    }
  }
}

export async function completeMilestone() {
  try {
    const c = await getWriteContract();
    const tx = await c.completeMilestone({ gasLimit: 100000 });
    const receipt = await tx.wait();
    
    if (!receipt || !receipt.hash) {
      throw new Error('Transaction failed - no receipt received');
    }
    
    // Save transaction to database
    try {
      const { signer } = await getProviderAndSigner();
      const walletAddress = await signer.getAddress();
      
      const response = await fetch(`${window.location.origin}/api/public/transactions/avalanche`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionHash: receipt.hash,
          amount: '0',
          walletAddress,
          campaignId: 'milestone-completion',
          status: 'completed',
          transactionType: 'milestone'
        })
      });
      
      if (!response.ok) {
        console.warn('Failed to save transaction to database:', await response.text());
      }
    } catch (error) {
      console.warn('Failed to save transaction to database:', error);
    }
    
    return receipt;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Transaction was rejected by user');
    } else if (error.reason) {
      throw new Error(`Smart contract error: ${error.reason}`);
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to complete milestone - unknown error occurred');
    }
  }
}

export async function refund() {
  try {
    // First check if user has any contributions to refund
    const { signer } = await getProviderAndSigner();
    const walletAddress = await signer.getAddress();
    
    // Check user's contribution amount from the contract
    const backerInfo = await getBackerAmount(walletAddress);
    const contributionAmount = backerInfo.amount;
    
    if (!contributionAmount || contributionAmount === '0') {
      throw new Error('No contributions found to refund. You must contribute first before requesting a refund.');
    }

    const c = await getWriteContract();
    
    // Estimate gas before sending transaction
    try {
      const gasEstimate = await c.refund.estimateGas();
      const gasLimit = Math.floor(Number(gasEstimate) * 1.5); // Add 50% buffer
      
      const tx = await c.refund({ gasLimit });
      const receipt = await tx.wait();
      
      if (!receipt || !receipt.hash) {
        throw new Error('Transaction failed - no receipt received');
      }
      
      // Save transaction to database
      try {
        await fetch(`${window.location.origin}/api/public/transactions/avalanche`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionHash: receipt.hash,
            amount: contributionAmount,
            walletAddress,
            campaignId: 'refund-request',
            status: 'completed',
            transactionType: 'refund'
          })
        });
      } catch (error) {
        console.warn('Failed to save transaction to database:', error);
      }
      
      return receipt;
    } catch (gasError: any) {
      if (gasError.reason) {
        throw new Error(`Cannot process refund: ${gasError.reason}`);
      }
      throw gasError;
    }
  } catch (error: any) {
    console.error('Refund error details:', error);
    
    if (error.code === 4001) {
      throw new Error('Transaction was rejected by user');
    } else if (error.code === -32603) {
      throw new Error('Refund not available - campaign may still be active or you may not have contributed to this campaign');
    } else if (error.reason) {
      throw new Error(`Smart contract error: ${error.reason}`);
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Refund failed - please check if the campaign allows refunds and you have contributed funds');
    }
  }
}

// Views
export async function fetchStateFromServer() {
  const res = await fetch(`${window.location.origin}/api/contract/state`);
  if (!res.ok) throw new Error('Server state fetch failed');
  return res.json();
}

export async function getBackerAmount(addr: string) {
  const res = await fetch(`${window.location.origin}/api/contract/backers/${addr}`);
  if (!res.ok) throw new Error('Backer fetch failed');
  return res.json();
}

// Live events via SSE
export function subscribeEvents(onEvent: (type: string, payload: any) => void) {
  const es = new EventSource(`${window.location.origin}/api/contract/events`);
  es.addEventListener('Funded', (e: MessageEvent) => onEvent('Funded', JSON.parse(e.data)));
  es.addEventListener('Refunded', (e: MessageEvent) => onEvent('Refunded', JSON.parse(e.data)));
  es.addEventListener('MilestoneCompleted', (e: MessageEvent) => onEvent('MilestoneCompleted', JSON.parse(e.data)));
  es.addEventListener('error', (e) => {
    console.error('SSE Error:', e);
  });
  return () => es.close();
}