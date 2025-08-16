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
  
  // Show clean login prompt if not authenticated
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin Access
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Please log in to access the admin panel
                </p>
              </div>
              
              <button
                onClick={() => setLocation("/auth")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Sign In
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Secure authentication required
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Redirect if logged in but not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  // Show clean access denied if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have permission to access this area
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Clean header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user.username}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
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