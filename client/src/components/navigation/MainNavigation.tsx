import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  PlusCircle, 
  BarChart3, 
  Shield, 
  Wallet, 
  User,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function MainNavigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const navigationItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/campaigns", label: "Campaigns", icon: Search },
    { path: "/create", label: "Create", icon: PlusCircle, requiresAuth: true },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3, requiresAuth: true },
    { path: "/explorer", label: "Explorer", icon: Wallet },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const getKYCStatus = () => {
    if (!user?.kycStatus) return "Not Started";
    return user.kycStatus === "verified" ? "Verified" : 
           user.kycStatus === "pending" ? "Pending" : "Rejected";
  };

  const getKYCBadgeVariant = () => {
    if (!user?.kycStatus) return "outline";
    return user.kycStatus === "verified" ? "default" : 
           user.kycStatus === "pending" ? "secondary" : "destructive";
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              CryptoFund
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                    data-testid={`nav-link-${item.label.toLowerCase()}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* KYC Status */}
                <Link href="/kyc-verification">
                  <Badge variant={getKYCBadgeVariant()} className="cursor-pointer">
                    <Shield className="w-3 h-3 mr-1" />
                    KYC: {getKYCStatus()}
                  </Badge>
                </Link>

                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {user?.firstName || 'User'}
                  </span>
                </div>

                {/* Logout */}
                <Button variant="outline" size="sm" asChild>
                  <a href="/api/logout" data-testid="button-logout">
                    Logout
                  </a>
                </Button>
              </>
            ) : (
              <Button asChild data-testid="button-login">
                <a href="/api/login">Login</a>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                      data-testid={`mobile-nav-link-${item.label.toLowerCase()}`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}

              <div className="pt-4 border-t mt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link href="/kyc-verification">
                      <div className="flex items-center space-x-2 p-2">
                        <Badge variant={getKYCBadgeVariant()}>
                          <Shield className="w-3 h-3 mr-1" />
                          KYC: {getKYCStatus()}
                        </Badge>
                      </div>
                    </Link>

                    <div className="flex items-center space-x-2 p-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">{user?.firstName || 'User'}</span>
                    </div>

                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href="/api/logout">Logout</a>
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <a href="/api/login">Login</a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}