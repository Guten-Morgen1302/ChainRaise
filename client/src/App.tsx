import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Campaigns from "@/pages/campaigns";
import CampaignDetail from "@/pages/campaign-detail";
import CreateCampaign from "@/pages/create-campaign";
import KYCVerification from "@/pages/KYCVerification";
import FeatureShowcase from "@/pages/FeatureShowcase";
import AccessGuide from "@/pages/AccessGuide";
import Dashboard from "@/pages/dashboard";
import KYC from "@/pages/kyc";
import Explorer from "@/pages/explorer";
import AdminPage from "@/pages/admin";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaigns/:id" component={CampaignDetail} />
      <Route path="/create" component={CreateCampaign} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/kyc" component={KYC} />
      <Route path="/kyc-verification" component={KYCVerification} />
      <Route path="/features" component={FeatureShowcase} />
      <Route path="/access-guide" component={AccessGuide} />
      <Route path="/explorer" component={Explorer} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/landing" component={Landing} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
