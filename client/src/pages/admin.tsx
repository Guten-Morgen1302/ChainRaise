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
  
  // Show sleek access screen if not authenticated
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        </div>
        
        {/* Glassmorphism container */}
        <div className="flex items-center justify-center min-h-screen p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-lg w-full"
          >
            {/* Main card with glassmorphism effect */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
              {/* Terminal-style header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="flex-1 h-px bg-white/20 ml-4"></div>
                <Terminal className="h-4 w-4 text-cyan-400" />
              </div>
              
              {/* Content */}
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    CryptoFund Admin
                  </h1>
                  <p className="text-slate-300 text-sm">Secure access to mission control</p>
                </div>
                
                {/* Animated typing text */}
                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400 mb-1">$ admin_access --authenticate</div>
                  <div className="text-cyan-300 animate-pulse">{hackerText}</div>
                  <div className="text-yellow-400 mt-2">Authentication required...</div>
                </div>
                
                {/* Login button */}
                <motion.button
                  onClick={() => setLocation("/auth")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5" />
                    Authenticate Access
                  </div>
                </motion.button>
                
                {/* Status indicators */}
                <div className="flex justify-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    System Online
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    Secure Connection
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full opacity-60 animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full opacity-40 animate-pulse"></div>
          </motion.div>
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
  
  // Show access denied with style
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-red-900 flex items-center justify-center relative overflow-hidden">
        {/* Error particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-400 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 bg-black/50 backdrop-blur-lg p-8 rounded-2xl border border-red-500/30"
        >
          <div className="text-6xl">🔒</div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-red-400 font-mono tracking-wider">ACCESS DENIED</h1>
            <p className="text-red-300 font-mono text-sm">INSUFFICIENT PRIVILEGES</p>
          </div>
          <div className="bg-red-950/50 p-4 rounded-lg font-mono text-xs text-red-300 border border-red-500/30">
            ERROR_CODE: 0x403_FORBIDDEN<br/>
            REQUIRED_ROLE: ADMIN<br/>
            CURRENT_ROLE: {user?.role || 'NONE'}
          </div>
          <button 
            onClick={() => setLocation("/")}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </motion.div>
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