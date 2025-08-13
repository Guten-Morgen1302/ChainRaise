import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Shield, 
  Sparkles, 
  Wallet, 
  Database, 
  Zap,
  BarChart3,
  CreditCard,
  Globe,
  Users,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function FeatureShowcase() {
  const features = [
    {
      title: "KYC Verification System",
      description: "Complete identity verification with document upload and AI-powered validation",
      icon: Shield,
      status: "✅ Complete",
      path: "/kyc-verification",
      color: "from-green-400 to-green-600",
      details: [
        "Document upload (ID, Passport, Driver's License)",
        "Personal information validation",
        "Address verification",
        "Source of funds documentation",
        "Real-time status tracking"
      ]
    },
    {
      title: "AI-Powered Campaign Creation",
      description: "Smart campaign optimization with title suggestions and credibility analysis",
      icon: Sparkles,
      status: "✅ Complete",
      path: "/create",
      color: "from-purple-400 to-purple-600",
      details: [
        "AI title optimization",
        "Description enhancement",
        "Credibility scoring (0-10)",
        "Success probability prediction",
        "Market analysis insights"
      ]
    },
    {
      title: "Web3 Wallet Integration",
      description: "Connect MetaMask and other Web3 wallets for crypto contributions",
      icon: Wallet,
      status: "✅ Complete",
      path: "/campaigns",
      color: "from-blue-400 to-blue-600",
      details: [
        "MetaMask connection",
        "Multi-network support (Ethereum, Polygon)",
        "Balance checking",
        "Transaction simulation",
        "Network switching"
      ]
    },
    {
      title: "PostgreSQL Database",
      description: "Production-ready database with Drizzle ORM and real-time updates",
      icon: Database,
      status: "✅ Complete",
      path: "/dashboard",
      color: "from-indigo-400 to-indigo-600",
      details: [
        "User management",
        "Campaign storage",
        "Transaction logging",
        "AI interaction tracking",
        "Real-time statistics"
      ]
    },
    {
      title: "Crypto Payment Processing",
      description: "Accept ETH, MATIC, and USDC with blockchain transaction recording",
      icon: Zap,
      status: "✅ Complete",
      path: "/campaigns",
      color: "from-yellow-400 to-yellow-600",
      details: [
        "Multi-currency support",
        "Gas fee estimation",
        "Transaction confirmation",
        "On-chain recording",
        "Payment status tracking"
      ]
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive platform statistics and campaign performance metrics",
      icon: BarChart3,
      status: "✅ Complete",
      path: "/dashboard",
      color: "from-red-400 to-red-600",
      details: [
        "Total funds raised tracking",
        "Active campaigns monitoring",
        "Success rate analytics",
        "Transaction history",
        "Real-time updates"
      ]
    },
    {
      title: "Fiat Payment Integration",
      description: "Stripe and Razorpay integration for credit card payments",
      icon: CreditCard,
      status: "🚧 Coming Soon",
      path: "#",
      color: "from-gray-400 to-gray-600",
      details: [
        "Credit/Debit card processing",
        "Bank transfer support",
        "Multi-currency fiat support",
        "Payment method selection",
        "Instant conversion to crypto"
      ]
    },
    {
      title: "Three.js 3D Effects",
      description: "Immersive 3D visualizations and cyberpunk UI enhancements",
      icon: Globe,
      status: "🚧 Coming Soon",
      path: "#",
      color: "from-gray-400 to-gray-600",
      details: [
        "3D campaign visualization",
        "Interactive funding meters",
        "Particle effects",
        "Holographic elements",
        "Immersive user experience"
      ]
    },
    {
      title: "Social Features",
      description: "User profiles, comments, and community interaction features",
      icon: Users,
      status: "🚧 Coming Soon",
      path: "#",
      color: "from-gray-400 to-gray-600",
      details: [
        "User profiles",
        "Campaign comments",
        "Social sharing",
        "Follow creators",
        "Community forums"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8" data-testid="feature-showcase">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-4">
          Platform Features
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore all the cutting-edge features of our Web3 crowdfunding platform. 
          Click on any feature to access it directly or learn more about its capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-cyan-200 dark:hover:border-cyan-800"
            data-testid={`feature-card-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <Badge variant={feature.status.includes('Complete') ? 'default' : 'secondary'}>
                  {feature.status}
                </Badge>
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Key Features:</h4>
                <ul className="space-y-1">
                  {feature.details.slice(0, 3).map((detail, i) => (
                    <li key={i} className="flex items-center text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                  {feature.details.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{feature.details.length - 3} more features...
                    </li>
                  )}
                </ul>
              </div>

              <div className="pt-4 border-t">
                {feature.status.includes('Complete') ? (
                  <Button asChild className="w-full group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-purple-600">
                    <Link href={feature.path} data-testid={`button-access-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      Access Feature
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                  1
                </div>
                <h4 className="font-semibold">Complete KYC</h4>
                <p className="text-muted-foreground">
                  Verify your identity to create campaigns
                </p>
                <Button size="sm" asChild variant="outline">
                  <Link href="/kyc-verification">Start KYC</Link>
                </Button>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                  2
                </div>
                <h4 className="font-semibold">Create Campaign</h4>
                <p className="text-muted-foreground">
                  Launch your project with AI assistance
                </p>
                <Button size="sm" asChild variant="outline">
                  <Link href="/create">Create Now</Link>
                </Button>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                  3
                </div>
                <h4 className="font-semibold">Accept Payments</h4>
                <p className="text-muted-foreground">
                  Receive crypto contributions
                </p>
                <Button size="sm" asChild variant="outline">
                  <Link href="/campaigns">Explore</Link>
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600">
                <Link href="/dashboard" data-testid="button-view-dashboard">
                  View Dashboard
                  <BarChart3 className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}