import React, { useEffect, useMemo, useState } from 'react';
import { fetchStateFromServer, fund, refund, completeMilestone, subscribeEvents, getBackerAmount } from '../lib/contract';
import { getProviderAndSigner } from '../lib/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function weiToEth(wei: string) {
  return (Number(wei) / 1e18).toString();
}

export default function ContractDemo() {
  const [account, setAccount] = useState<string>('');
  const [state, setState] = useState<any>(null);
  const [amount, setAmount] = useState<string>('0.01');
  const [log, setLog] = useState<string[]>([]);
  const [myContribution, setMyContribution] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetchStateFromServer();
        setState(s);
      } catch (error) {
        console.error('Failed to load contract state:', error);
        toast({
          title: "Error",
          description: "Failed to load contract state",
          variant: "destructive",
        });
      }
    };
    load();

    const unsub = subscribeEvents((type, p) => {
      const timestamp = new Date().toLocaleTimeString();
      setLog(prev => [`${timestamp}: ${type} ${JSON.stringify(p)}`, ...prev].slice(0, 10));
      
      // refresh on any event
      fetchStateFromServer().then(setState).catch(() => {});
      if (account) {
        getBackerAmount(account).then((x) => setMyContribution(x.amount)).catch(() => {});
      }

      toast({
        title: `Contract Event: ${type}`,
        description: `${JSON.stringify(p)}`,
      });
    });
    
    return unsub;
  }, [account, toast]);

  const goalEth = useMemo(() => state ? weiToEth(state.fundingGoal) : '0', [state]);
  const totalEth = useMemo(() => state ? weiToEth(state.totalFunded) : '0', [state]);
  const balEth = useMemo(() => state ? weiToEth(state.contractBalance) : '0', [state]);
  const progressPercent = useMemo(() => {
    if (!state || !state.fundingGoal) return 0;
    return Math.min((Number(totalEth) / Number(goalEth)) * 100, 100);
  }, [totalEth, goalEth]);

  const connect = async () => {
    try {
      setLoading(true);
      const { signer } = await getProviderAndSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      
      const b = await getBackerAmount(addr);
      setMyContribution(b.amount);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${addr.slice(0, 6)}...${addr.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async () => {
    try {
      setLoading(true);
      const receipt = await fund(amount);
      toast({
        title: "Funding Successful",
        description: `Funded ${amount} AVAX successfully! Transaction: ${receipt.hash}`,
      });
      // Add to log for immediate feedback
      setLog(prev => [`${new Date().toLocaleTimeString()}: Fund transaction ${receipt.hash}`, ...prev].slice(0, 10));
    } catch (error: any) {
      toast({
        title: "Funding Failed",
        description: error.message || "Failed to fund campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMilestone = async () => {
    try {
      setLoading(true);
      const receipt = await completeMilestone();
      toast({
        title: "Milestone Completed",
        description: `Milestone completed successfully! Transaction: ${receipt.hash}`,
      });
      // Add to log for immediate feedback
      setLog(prev => [`${new Date().toLocaleTimeString()}: Milestone transaction ${receipt.hash}`, ...prev].slice(0, 10));
    } catch (error: any) {
      toast({
        title: "Milestone Failed",
        description: error.message || "Failed to complete milestone",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    try {
      setLoading(true);
      const receipt = await refund();
      toast({
        title: "Refund Successful",
        description: `Refund processed successfully! Transaction: ${receipt.hash}`,
      });
      // Add to log for immediate feedback
      setLog(prev => [`${new Date().toLocaleTimeString()}: Refund transaction ${receipt.hash}`, ...prev].slice(0, 10));
    } catch (error: any) {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Avalanche Crowdfund dApp
        </h1>
        <p className="text-muted-foreground">
          Connect to Avalanche Fuji testnet and interact with the smart contract
        </p>
      </div>

      {/* Wallet Connection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={connect} 
              disabled={!!account || loading}
              className="flex items-center gap-2"
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              {account ? `Connected: ${account.slice(0,6)}…${account.slice(-4)}` : 'Connect Wallet'}
            </Button>
            {account && (
              <Badge variant="outline" className="text-green-600">
                Connected to Avalanche Fuji
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaign State */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Campaign State
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!state ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading campaign data...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Creator</p>
                  <p className="font-mono text-sm">{state.creator}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline (Unix)</p>
                  <p className="font-mono">{state.deadline}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funding Goal</p>
                  <p className="text-xl font-semibold">{goalEth} AVAX</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Funded</p>
                  <p className="text-xl font-semibold text-green-600">{totalEth} AVAX</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Balance</p>
                  <p className="text-xl font-semibold">{balEth} AVAX</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{progressPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Goal Reached</p>
                  <Badge variant={state.goalReached ? "default" : "secondary"}>
                    {state.goalReached ? "✅ Yes" : "❌ No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Milestones</p>
                  <Badge variant="outline">
                    {state.milestonesCompleted}/{state.milestoneCount}
                  </Badge>
                </div>
              </div>
              
              {account && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Your Contribution</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {weiToEth(myContribution)} AVAX
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contract Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Amount (AVAX)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.01"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleFund}
                  disabled={!account || loading}
                  className="flex items-center gap-2"
                >
                  {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Fund
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCompleteMilestone}
                disabled={!account || loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                <CheckCircle className="h-4 w-4" />
                Complete Milestone
              </Button>
              <Button 
                onClick={handleRefund}
                disabled={!account || loading}
                variant="destructive"
                className="flex items-center gap-2"
              >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                Request Refund
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Note: completeMilestone/refund permissions depend on contract logic (creator, goal reached, deadline, etc.).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Live Events */}
      <Card>
        <CardHeader>
          <CardTitle>Live Contract Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-muted-foreground text-sm">No events yet. Interact with the contract to see live updates.</p>
            ) : (
              log.map((l, i) => (
                <div key={i} className="p-2 bg-muted rounded text-sm font-mono">
                  {l}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}