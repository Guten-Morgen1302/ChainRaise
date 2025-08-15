import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Menu, X, Wallet } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = isAuthenticated ? [
    { href: "/", label: "Home" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/create", label: "Create" },
    { href: "/explorer", label: "Explorer" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/kyc", label: "KYC" },
    { href: "/switch-user", label: "Switch User" },
  ] : [
    { href: "#home", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "#campaigns", label: "Campaigns" },
    { href: "#create", label: "Create" },
    { href: "#explorer", label: "Explorer" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-morphism border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            <div className="text-2xl font-bold gradient-text">
              CryptoFund
            </div>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium transition-colors duration-300 ${
                    location === item.href 
                      ? "text-cyber-blue" 
                      : "text-muted-foreground hover:text-cyber-blue"
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
            
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-morphism border-white/20 hover:bg-white/20"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  <span className="font-mono text-sm">
                    {user?.walletAddress 
                      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                      : "0x1a2b...c3d4"
                    }
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="glass-morphism hover:bg-white/20"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:scale-105 transition-transform duration-300"
                onClick={() => window.location.href = '/api/login'}
              >
                Connect Wallet
              </Button>
            )}
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
            className="md:hidden border-t border-white/10 py-4"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
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
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full glass-morphism"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      <span className="font-mono text-sm">0x1a2b...c3d4</span>
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
                  <Button
                    className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
