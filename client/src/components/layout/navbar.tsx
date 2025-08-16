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
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 noise-bg relative overflow-hidden">
      {/* Animated gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-success/5 opacity-0 hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4 group"
          >
            <motion.div 
              className="text-2xl font-bold heading-display gradient-text relative cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="relative z-10 text-foreground">FundIndia</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur-xl opacity-0 group-hover:opacity-30"
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isLoading && navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    <Button
                      variant="ghost"
                      className={`text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                        location === item.href 
                          ? "text-primary bg-primary/10" 
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      <span className="relative z-10">{item.label}</span>
                      {location === item.href && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-md"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 rounded-md"
                        transition={{ duration: 0.2 }}
                      />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
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
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    className="btn-premium relative overflow-hidden"
                    onClick={() => window.location.href = '/auth'}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent to-success"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 font-medium">Get Started</span>
                  </Button>
                </motion.div>
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
                      className="w-full btn-premium"
                      onClick={() => window.location.href = '/auth'}
                    >
                      <span>Get Started</span>
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
