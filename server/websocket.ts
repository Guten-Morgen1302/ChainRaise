import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import type { IncomingMessage } from 'http';
import url from 'url';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAdmin?: boolean;
  isAuthenticated?: boolean;
}

class AdminWebSocketManager {
  private wss: WebSocketServer;
  private adminClients: Set<AuthenticatedWebSocket> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/admin'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(ws: AuthenticatedWebSocket, request: IncomingMessage) {
    console.log('New WebSocket connection attempt');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleMessage(ws, data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      this.adminClients.delete(ws);
      console.log('Admin WebSocket disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private handleMessage(ws: AuthenticatedWebSocket, data: any) {
    switch (data.type) {
      case 'authenticate':
        // Accept both admin and user connections for live transactions
        if (data.role === 'admin') {
          ws.isAdmin = true;
          ws.isAuthenticated = true;
          ws.userId = data.userId;
          this.adminClients.add(ws);
          
          ws.send(JSON.stringify({
            type: 'authenticated',
            success: true
          }));
          
          console.log('Admin authenticated via WebSocket');
        } else if (data.role === 'user') {
          ws.isAuthenticated = true;
          ws.userId = data.userId || 'anonymous';
          this.adminClients.add(ws); // Add users to broadcast list for live transactions
          
          ws.send(JSON.stringify({
            type: 'authenticated',
            success: true
          }));
          
          console.log('User authenticated via WebSocket for live updates');
        }
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  }

  // Broadcast real-time updates to all connected admin clients
  public broadcastToAdmins(event: string, data: any) {
    const message = JSON.stringify({
      type: 'update',
      event,
      data,
      timestamp: new Date().toISOString()
    });

    this.adminClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.isAdmin) {
        client.send(message);
      }
    });

    console.log(`Broadcasted ${event} to ${this.adminClients.size} admin clients`);
  }

  // Specific broadcast methods for different events
  public userCreated(user: any) {
    this.broadcastToAdmins('user_created', user);
  }

  public userUpdated(user: any) {
    this.broadcastToAdmins('user_updated', user);
  }

  public userDeleted(userId: string) {
    this.broadcastToAdmins('user_deleted', { userId });
  }

  public userFlagged(user: any) {
    this.broadcastToAdmins('user_flagged', user);
  }

  public userUnflagged(user: any) {
    this.broadcastToAdmins('user_unflagged', user);
  }

  public campaignCreated(campaign: any) {
    this.broadcastToAdmins('campaign_created', campaign);
  }

  public campaignUpdated(campaign: any) {
    this.broadcastToAdmins('campaign_updated', campaign);
  }

  public campaignStatusChanged(campaign: any) {
    this.broadcastToAdmins('campaign_status_changed', campaign);
  }

  public kycSubmitted(application: any) {
    this.broadcastToAdmins('kyc_submitted', application);
  }

  public kycStatusChanged(application: any) {
    this.broadcastToAdmins('kyc_status_changed', application);
  }

  public transactionCreated(transaction: any) {
    this.broadcastToAdmins('transaction_created', transaction);
  }
}

let adminWSManager: AdminWebSocketManager | null = null;

export function setupWebSocket(server: Server): AdminWebSocketManager {
  if (!adminWSManager) {
    adminWSManager = new AdminWebSocketManager(server);
  }
  return adminWSManager;
}

export function getWebSocketManager(): AdminWebSocketManager | null {
  return adminWSManager;
}