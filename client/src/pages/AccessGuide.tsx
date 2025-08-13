import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  LogIn,
  Shield, 
  Sparkles, 
  Wallet, 
  Zap,
  BarChart3,
  CreditCard,
  Globe,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default function AccessGuide() {
  return (
    <div className="container mx-auto px-4 py-8" data-testid="access-guide">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-4">
            How to Access Everything
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete guide to accessing all features in our Web3 crowdfunding platform
          </p>
        </div>

        {/* Authentication Alert */}
        <Alert className="mb-8 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> You need to be logged in to access most features. The authentication system is currently experiencing issues. 
            You can still explore the feature overview and landing page without authentication.
          </AlertDescription>
        </Alert>

        {/* Step-by-Step Guide */}
        <div className="space-y-8">
          
          {/* Step 1: Login */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <LogIn className="w-5 h-5 text-blue-500" />
                Login/Authentication (Currently Having Issues)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The platform uses Replit's OpenID Connect for authentication. Currently experiencing connection errors.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">How to Login (when working):</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Click "Login" button on landing page</li>
                    <li>• Use Replit account credentials</li>
                    <li>• Complete OAuth flow</li>
                    <li>• Get redirected to dashboard</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Current Status:</h4>
                  <Badge variant="destructive" className="mb-2">
                    Authentication Error
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    OpenID Connect authorization response error. Working on fix.
                  </p>
                </div>
              </div>

              <Button disabled className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Login (Temporarily Disabled)
              </Button>
            </CardContent>
          </Card>

          {/* Available Without Login */}
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Available Without Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Button asChild className="w-full justify-start">
                    <a href="/" data-testid="button-landing-page">
                      <Globe className="w-4 h-4 mr-2" />
                      Landing Page
                    </a>
                  </Button>
                  
                  <Button asChild className="w-full justify-start">
                    <a href="/features" data-testid="button-features-page">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Feature Showcase
                    </a>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">What you can see:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Platform overview and features</li>
                    <li>• Database statistics (empty for now)</li>
                    <li>• UI components and design</li>
                    <li>• Feature documentation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Requiring Login */}
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                Features Requiring Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="font-medium">KYC Verification</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete identity verification with document upload
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Access: /kyc-verification
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">AI Campaign Creation</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Create campaigns with AI optimization
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Access: /create
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Web3 Wallet</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect MetaMask and make crypto payments
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Access: /campaigns (after login)
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Analytics Dashboard</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View campaign statistics and performance
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Access: /dashboard
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">Crypto Payments</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Process ETH, MATIC, USDC payments
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Access: Payment modals in campaigns
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium">Campaign Management</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manage your campaigns and contributions
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Access: /campaigns/:id
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Features */}
          <Card className="border-2 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-500" />
                Coming Soon Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <CreditCard className="w-8 h-8 text-gray-500 mx-auto" />
                  <h4 className="font-medium">Fiat Payments</h4>
                  <Badge variant="secondary">In Development</Badge>
                  <p className="text-xs text-muted-foreground">
                    Stripe & Razorpay integration
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <Globe className="w-8 h-8 text-gray-500 mx-auto" />
                  <h4 className="font-medium">3D Effects</h4>
                  <Badge variant="secondary">Planned</Badge>
                  <p className="text-xs text-muted-foreground">
                    Three.js cyberpunk visuals
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <Users className="w-8 h-8 text-gray-500 mx-auto" />
                  <h4 className="font-medium">Social Features</h4>
                  <Badge variant="secondary">Planned</Badge>
                  <p className="text-xs text-muted-foreground">
                    Profiles & community
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direct Access Links */}
          <Card className="border-2 border-cyan-200 dark:border-cyan-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-cyan-500" />
                Direct Access Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">✅ Available Now:</h4>
                    <div className="space-y-1">
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href="/">🏠 Landing Page</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href="/features">✨ Feature Showcase</a>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-600">🔒 Requires Login:</h4>
                    <div className="space-y-1 opacity-50">
                      <Button variant="outline" size="sm" disabled className="w-full justify-start">
                        🛡️ /kyc-verification
                      </Button>
                      <Button variant="outline" size="sm" disabled className="w-full justify-start">
                        🚀 /create
                      </Button>
                      <Button variant="outline" size="sm" disabled className="w-full justify-start">
                        📊 /dashboard
                      </Button>
                      <Button variant="outline" size="sm" disabled className="w-full justify-start">
                        💰 /campaigns
                      </Button>
                      <Button variant="outline" size="sm" disabled className="w-full justify-start">
                        🔍 /explorer
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> The database is working perfectly with PostgreSQL, all APIs are functional, 
                    and the UI components are fully built. Only the authentication system needs fixing to unlock full access.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}