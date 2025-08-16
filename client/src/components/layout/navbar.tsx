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

  // Debug log
  console.log('Navbar Auth State:', { isAuthenticated, user, isLoading });

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
              FundIndia
            </div>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isLoading && navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium transition-colors duration-300 ${
                    location === item.href 
                      ? "text-indigo-600 dark:text-indigo-400" 
                      : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
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
                  className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 hover:bg-white/30 dark:hover:bg-gray-800/30"
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
                  className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 hover:bg-white/30 dark:hover:bg-gray-800/30"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 hover:bg-white/30 dark:hover:bg-gray-800/30"
                  onClick={() => window.location.href = '/campaigns'}
                >
                  Explore
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
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
            className="md:hidden border-t border-white/10 py-4"
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
                      className="w-full backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30"
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
                      className="w-full backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30"
                      onClick={() => window.location.href = '/campaigns'}
                    >
                      Explore Campaigns
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
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
