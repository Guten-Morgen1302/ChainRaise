/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] | Record<string, any> }) => Promise<any>;
    send?: (method: string, params?: any[]) => Promise<any>;
    on?: (event: string, callback: (data: any) => void) => void;
    removeListener?: (event: string, callback: (data: any) => void) => void;
  };
}