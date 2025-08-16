import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Shield, Lock } from "lucide-react";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [time, setTime] = useState(new Date());
  
  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  

  
  // Show loading state first
  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show clean login prompt if not authenticated
  if (!user) {
    return (
      <div className="dark min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Admin Access
                </h1>
                <p className="text-gray-400">
                  Please log in to access the admin panel
                </p>
              </div>
              
              <button
                onClick={() => setLocation("/auth")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Sign In
              </button>
              
              <p className="text-xs text-gray-400">
                Secure authentication required
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Show clean access denied if not admin
  if (user && user.role !== 'admin') {
    return (
      <div className="dark min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700 text-center space-y-6">
            <div className="w-16 h-16 bg-red-900/30 rounded-full mx-auto flex items-center justify-center">
              <Lock className="h-8 w-8 text-red-400" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Access Denied</h1>
              <p className="text-gray-400">
                You don't have permission to access this area
              </p>
              <p className="text-sm text-gray-500">
                Current role: {user?.role || 'None'} • Required: Admin
              </p>
            </div>
            
            <button 
              onClick={() => setLocation("/")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="dark min-h-screen bg-gray-900">
      {/* Clean header */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {user.username}</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {time.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main dashboard content */}
      <div className="p-6">
        <AdminDashboard />
      </div>
    </div>
  );
}