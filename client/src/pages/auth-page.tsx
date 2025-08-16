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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-teal-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-teal-900/20 relative">
      <ThreeBackground />
      
      <div className="relative z-10">
        <section className="py-12 min-h-screen flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                    Fund India's Dreams
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Join thousands of Indians building the future. Launch campaigns, support innovation, 
                    and be part of India's largest crowdfunding community.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Secure</h3>
                      <p className="text-sm text-muted-foreground">Blockchain verified</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-cyan-600 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Fast</h3>
                      <p className="text-sm text-muted-foreground">Instant transactions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Global</h3>
                      <p className="text-sm text-muted-foreground">Worldwide access</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Auth Forms */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full max-w-md mx-auto"
              >
                <Card className="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border-white/30">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Welcome to FundIndia
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Ready to make history? Sign in or create your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Sign In</TabsTrigger>
                        <TabsTrigger value="register">Sign Up</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="login">
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        placeholder="Enter your username"
                                        className="pl-10 form-focus"
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
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10 form-focus"
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
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg py-3 rounded-full font-semibold"
                              disabled={loginMutation.isPending}
                              data-testid="button-login"
                            >
                              {loginMutation.isPending ? "Signing In..." : "Sign In to FundIndia"}
                            </Button>
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
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="John"
                                        className="form-focus"
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
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Doe"
                                        className="form-focus"
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
                                  <FormLabel>Username *</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        placeholder="Choose a username"
                                        className="pl-10 form-focus"
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
                                  <FormLabel>Email *</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="pl-10 form-focus"
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
                                  <FormLabel>Password *</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                      <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Choose a strong password"
                                        className="pl-10 pr-10 form-focus"
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
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg py-3 rounded-full font-semibold"
                              disabled={registerMutation.isPending}
                              data-testid="button-register"
                            >
                              {registerMutation.isPending ? (
                                <>
                                  <UserPlus className="w-4 h-4 mr-2 animate-spin" />
                                  Creating Account...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Join FundIndia
                                </>
                              )}
                            </Button>
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