import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Menu, X, Wallet } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function Navbar() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = isAuthenticated ? [
    { href: "/home", label: "Home" },
    { href: "/campaigns", label: "Explore" },
    { href: "/create", label: "Create" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "My Payments" },
    { href: "/contract-demo", label: "Blockchain Demo" },
    { href: "/live-transactions", label: "Live Tx + AI" },
  ] : [
    { href: "#hero", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#campaigns", label: "Explore" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 noise-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            <div className="text-2xl font-bold heading-display gradient-text">
              FundIndia
            </div>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isLoading && navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium transition-all duration-200 ${
                    location === item.href 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {!isLoading && (isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-glass"
                  onClick={() => window.location.href = '/profile'}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  <span className="font-mono text-sm">
                    {user?.walletAddress 
                      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                      : user?.username || "Profile"
                    }
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="btn-glass"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="btn-glass"
                  onClick={() => window.location.href = '/campaigns'}
                >
                  Explore
                </Button>
                <Button
                  className="gradient-primary text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
                  onClick={() => window.location.href = '/auth'}
                >
                  Get Started
                </Button>
              </>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/10 py-4 glass"
          >
            <div className="flex flex-col space-y-2">
              {!isLoading && navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              
              <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                <ThemeToggle />
                {!isLoading && (isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full btn-glass"
                      onClick={() => window.location.href = '/profile'}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      <span className="font-mono text-sm">
                        {user?.username || "Profile"}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = '/api/logout'}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full btn-glass"
                      onClick={() => window.location.href = '/campaigns'}
                    >
                      Explore Campaigns
                    </Button>
                    <Button
                      className="w-full gradient-primary text-white"
                      onClick={() => window.location.href = '/auth'}
                    >
                      Get Started
                    </Button>
                  </>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
