import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  event?: string;
  data?: any;
  timestamp?: string;
}

export function useAdminWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      setConnectionStatus('connecting');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/admin`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Admin WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Authenticate as admin
        wsRef.current?.send(JSON.stringify({
          type: 'authenticate',
          role: 'admin',
          userId: 'admin', // In a real app, get from user context
        }));

        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Admin WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);
    
    switch (message.type) {
      case 'authenticated':
        console.log('Admin authenticated');
        break;
        
      case 'update':
        handleRealTimeUpdate(message.event, message.data);
        setLastUpdate(message.timestamp || new Date().toISOString());
        break;
        
      case 'pong':
        // Keep-alive response
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const handleRealTimeUpdate = (event: string | undefined, data: any) => {
    if (!event) return;

    console.log(`Real-time update: ${event}`, data);

    switch (event) {
      case 'user_created':
      case 'user_updated':
      case 'user_flagged':
      case 'user_unflagged':
        // Invalidate user-related queries
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        break;

      case 'user_deleted':
        // Remove user from cache and refresh lists
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        break;

      case 'campaign_created':
      case 'campaign_updated':
      case 'campaign_status_changed':
        // Invalidate campaign-related queries
        queryClient.invalidateQueries({ queryKey: ['/api/admin/campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        break;

      case 'kyc_submitted':
      case 'kyc_status_changed':
        // Invalidate KYC-related queries
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc/applications'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        break;

      default:
        console.log('Unknown event type:', event);
    }
  };

  // Send keep-alive ping every 30 seconds
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const refreshData = () => {
    // Invalidate all admin-related queries to force refresh
    queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/campaigns'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc/applications'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/reinstatement-requests'] });
    queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    
    setLastUpdate(new Date().toISOString());
  };

  return {
    isConnected,
    lastUpdate,
    connectionStatus,
    sendMessage,
    reconnect: connect,
    refreshData,
  };
}