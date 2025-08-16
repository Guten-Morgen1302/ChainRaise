import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThreeBackground } from "@/components/three/ThreeBackground";
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff,
  Shield,
  Zap,
  Globe,
  UserPlus
} from "lucide-react";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginForm) => {
      return await apiRequest("POST", "/api/login", credentials);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.username}`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterForm) => {
      return await apiRequest("POST", "/api/register", credentials);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created!",
        description: `Welcome to FundIndia, ${user.firstName || user.username}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating gradient orbs */}
        <motion.div 
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            y: [0, -10, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a855f7' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10">
        <section className="py-12 min-h-screen flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-8"
                  >
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-purple-300 text-sm font-semibold">India's #1 Crowdfunding Platform</span>
                    </div>
                  </motion.div>
                  
                  <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
                    Fund India's
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      Dreams
                    </span>
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed mb-8">
                    Join thousands of visionaries building tomorrow's India. Launch campaigns, 
                    support innovation, and be part of the revolution.
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span>12L+ Active Users</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                      <span>₹500C+ Raised</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                      <span>Bank Grade Security</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-white mb-2">Military-Grade Security</h3>
                      <p className="text-sm text-gray-400">Blockchain verified & encrypted</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-white mb-2">Lightning Fast</h3>
                      <p className="text-sm text-gray-400">Instant settlements & transfers</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm hover:border-emerald-400/40 transition-all duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                        <Globe className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-white mb-2">Global Reach</h3>
                      <p className="text-sm text-gray-400">Connect with investors worldwide</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Auth Forms */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full max-w-md mx-auto"
              >
                <Card className="relative backdrop-blur-xl bg-black/20 border border-white/10 shadow-2xl shadow-purple-500/10 overflow-hidden">
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 animate-pulse"></div>
                  <div className="absolute inset-[1px] rounded-lg bg-black/40 backdrop-blur-xl"></div>
                  <CardHeader className="text-center relative z-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <CardTitle className="text-3xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-3">
                        Welcome to FundIndia
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        Ready to make history? ✨
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-white/10 p-1">
                        <TabsTrigger 
                          value="login" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-gray-300 font-semibold transition-all duration-300"
                        >
                          Sign In
                        </TabsTrigger>
                        <TabsTrigger 
                          value="register" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-300 font-semibold transition-all duration-300"
                        >
                          Sign Up
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="login">
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-200 font-semibold">Username</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        placeholder="Enter your username"
                                        className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                        {...field}
                                        data-testid="input-username"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-200 font-semibold">Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                        {...field}
                                        data-testid="input-password"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                        data-testid="button-toggle-password"
                                      >
                                        {showPassword ? (
                                          <EyeOff className="w-4 h-4" />
                                        ) : (
                                          <Eye className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 text-lg py-4 rounded-xl font-bold relative overflow-hidden group"
                                disabled={loginMutation.isPending}
                                data-testid="button-login"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                {loginMutation.isPending ? "Signing In..." : "Sign In to FundIndia"}
                              </Button>
                            </motion.div>
                          </form>
                        </Form>
                      </TabsContent>
                      
                      <TabsContent value="register">
                        <Form {...registerForm}>
                          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={registerForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-200 font-semibold">First Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="John"
                                        className="bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                                        {...field}
                                        data-testid="input-firstname"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={registerForm.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-200 font-semibold">Last Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Doe"
                                        className="bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                                        {...field}
                                        data-testid="input-lastname"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-200 font-semibold">Username *</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        placeholder="Choose a username"
                                        className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                                        {...field}
                                        data-testid="input-username-register"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-200 font-semibold">Email *</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                                        {...field}
                                        data-testid="input-email"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-200 font-semibold">Password *</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Choose a strong password"
                                        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                                        {...field}
                                        data-testid="input-password-register"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                        data-testid="button-toggle-password-register"
                                      >
                                        {showPassword ? (
                                          <EyeOff className="w-4 h-4" />
                                        ) : (
                                          <Eye className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:via-blue-500 hover:to-cyan-500 text-white shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 text-lg py-4 rounded-xl font-bold relative overflow-hidden group"
                                disabled={registerMutation.isPending}
                                data-testid="button-register"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                {registerMutation.isPending ? (
                                  <>
                                    <UserPlus className="w-5 h-5 mr-2 animate-spin" />
                                    Creating Account...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    Join FundIndia
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </form>
                        </Form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}