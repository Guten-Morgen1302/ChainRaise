import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, DEFAULT_NETWORK } from '../../../shared/contract';

declare global {
  interface Window { ethereum?: any }
}

export async function getProviderAndSigner() {
  if (!window.ethereum) throw new Error('MetaMask not found');
  const provider = new BrowserProvider(window.ethereum);

  // Ensure we are on Fuji (43113)
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== DEFAULT_NETWORK.chainId) {
    // attempt to switch
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xa869' }], // 43113 hex
    }).catch(async (e: any) => {
      // add then switch
      if (e.code === 4902) {
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
        throw e;
      }
    });
  }

  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getReadOnlyContract() {
  // Read via your backend (recommended) OR direct RPC:
  const provider = new BrowserProvider(window.ethereum ?? null);
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function getWriteContract() {
  const { signer } = await getProviderAndSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// Actions
export async function fund(amountEth: string) {
  const c = await getWriteContract();
  const tx = await c.fund({ value: parseEther(amountEth) });
  return await tx.wait();
}

export async function completeMilestone() {
  const c = await getWriteContract();
  const tx = await c.completeMilestone();
  return await tx.wait();
}

export async function refund() {
  const c = await getWriteContract();
  const tx = await c.refund();
  return await tx.wait();
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