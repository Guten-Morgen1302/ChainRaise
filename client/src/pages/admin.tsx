import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  Terminal, 
  Shield, 
  Cpu, 
  Activity, 
  Zap, 
  Globe, 
  Eye, 
  Lock,
  Wifi,
  Server,
  Database,
  Code,
  Command
} from "lucide-react";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [time, setTime] = useState(new Date());
  const [hackerText, setHackerText] = useState("");
  
  // Show login form if not authenticated
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 border border-green-500 p-8 rounded-lg shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-green-400 mb-6 text-center">Admin Access Required</h1>
          <p className="text-gray-300 mb-6 text-center">Please log in to access the admin panel.</p>
          <button 
            onClick={() => setLocation("/auth")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Redirect if logged in but not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Hacker typing effect
  useEffect(() => {
    const messages = [
      "INITIALIZING CRYPTO_FUND MAINFRAME...",
      "ACCESSING BLOCKCHAIN PROTOCOLS...",
      "SCANNING NETWORK SECURITY...",
      "MONITORING TRANSACTION FLOWS...",
      "ANALYZING SMART CONTRACTS...",
      "TRACKING FUND MOVEMENTS...",
      "SYSTEM STATUS: OPTIMAL"
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    
    const typeText = () => {
      if (charIndex < messages[messageIndex].length) {
        setHackerText(messages[messageIndex].substring(0, charIndex + 1));
        charIndex++;
        setTimeout(typeText, 50);
      } else {
        setTimeout(() => {
          charIndex = 0;
          messageIndex = (messageIndex + 1) % messages.length;
          setHackerText("");
          setTimeout(typeText, 500);
        }, 2000);
      }
    };
    
    typeText();
  }, []);
  
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl animate-pulse">
          ACCESS DENIED - INVALID CREDENTIALS
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      {/* Matrix-style falling code background */}
      <div className="absolute inset-0">
        {/* Animated grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
        
        {/* Animated scanlines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse" />
        
        {/* Floating hex particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400/20 font-mono text-xs select-none"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: -20,
              opacity: 0 
            }}
            animate={{ 
              y: window.innerHeight + 20,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          >
            0x{Math.random().toString(16).substr(2, 8).toUpperCase()}
          </motion.div>
        ))}
        
        {/* Circuit board pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-green-400">
            <defs>
              <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
                <path d="M2 2h16M2 2v16" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>
      </div>
      
      {/* Terminal Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-green-400/30 bg-black/80 backdrop-blur-sm"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Terminal Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50" style={{ animationDelay: '0.5s' }} />
                <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse shadow-lg shadow-red-400/50" style={{ animationDelay: '1s' }} />
              </div>
              
              <div className="text-green-400 font-bold text-xl tracking-wider">
                <Terminal className="inline w-6 h-6 mr-2" />
                CRYPTOFUND://ADMIN_TERMINAL
              </div>
            </div>
            
            {/* System Stats */}
            <div className="flex items-center space-x-8 text-green-400 text-sm">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>SYS_ONLINE</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>SEC_LEVEL: MAX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4" />
                <span>CPU: 94%</span>
              </div>
              <div className="font-mono">
                {time.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
          </div>
          
          {/* Hacker typing effect */}
          <div className="mt-3 text-green-400/80 text-sm font-mono">
            &gt; {hackerText}<span className="animate-pulse">_</span>
          </div>
        </div>
      </motion.div>
      
      {/* Command Icons Bar */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20"
      >
        <div className="bg-black/90 border border-green-400/30 rounded-r-lg p-2 space-y-3">
          {[
            { icon: Database, label: "DB" },
            { icon: Server, label: "SRV" },
            { icon: Globe, label: "NET" },
            { icon: Eye, label: "MON" },
            { icon: Lock, label: "SEC" },
            { icon: Code, label: "API" },
            { icon: Zap, label: "PWR" }
          ].map(({ icon: Icon, label }, index) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.1, x: 5 }}
              className="relative group cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-400/10 border border-green-400/30 rounded-lg flex items-center justify-center text-green-400 hover:bg-green-400/20 transition-all duration-300">
                <Icon className="w-5 h-5" />
              </div>
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black border border-green-400/30 px-2 py-1 rounded text-green-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="relative z-10 p-6">
        <AdminDashboard />
      </div>
      
      {/* Bottom Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-green-400/30 px-6 py-2 text-green-400 text-xs font-mono z-20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>[ADMIN@CRYPTOFUND]</span>
            <span className="text-green-400/60">|</span>
            <span>USER: {user.username}</span>
            <span className="text-green-400/60">|</span>
            <span>SESSION: ENCRYPTED</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>NET_STATUS: SECURE</span>
            <span className="text-green-400/60">|</span>
            <span>BLOCKCHAIN_SYNC: 100%</span>
            <span className="text-green-400/60">|</span>
            <span className="animate-pulse">MONITORING_ACTIVE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}