import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CampaignCard from "@/components/campaign/campaign-card";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Users, Target, Shield, Heart, Sparkles, TrendingUp, Globe, CheckCircle } from "lucide-react";
import type { Campaign } from "@shared/schema";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Landing() {
  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    retry: false,
  });

  const { data: stats } = useQuery<{
    totalRaised: string;
    activeCampaigns: number;
    totalBackers: number;
  }>({
    queryKey: ["/api/stats"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-teal-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-teal-900/20">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Floating gradient orbs */}
          <motion.div 
            {...floatingAnimation}
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-3xl"
          />
          <motion.div 
            {...floatingAnimation}
            transition={{ duration: 4, delay: 1 }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-teal-400 rounded-full opacity-20 blur-3xl"
          />
          <motion.div 
            {...floatingAnimation}
            transition={{ duration: 5, delay: 2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-15 blur-3xl"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mb-8"
          >
            {/* Floating badge */}
            <motion.div {...fadeInUp} className="mb-6">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-6 py-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                #1 Crowdfunding Platform in India
              </Badge>
            </motion.div>
            
            <motion.h1 
              {...fadeInUp}
              className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent leading-tight"
            >
              Fund the Future,<br/>
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Build India's Dreams
              </span>
            </motion.h1>
            
            <motion.p 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8"
            >
              Join thousands of dreamers and believers who are creating impact across India. 
              From innovative startups to social causes - every rupee counts, every dream matters.
            </motion.p>
          </motion.div>
          
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-10 py-4 rounded-full font-semibold"
              onClick={() => window.location.href = '/campaigns'}
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Exploring
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 text-lg px-10 py-4 rounded-full font-semibold"
              onClick={() => window.location.href = '/auth'}
            >
              <Target className="w-5 h-5 mr-2" />
              Launch Campaign
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <Card className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  ₹{stats?.totalRaised ? `${parseFloat(stats.totalRaised) * 75}L+` : "18C+"}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-semibold">Funds Raised</div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-2">
                  {stats?.activeCampaigns || "2,500"}+
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-semibold">Success Stories</div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  {stats?.totalBackers ? `${stats.totalBackers}L+` : "12L+"}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-semibold">Supporters</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              Why Choose FundIndia?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for India, by Indians. We understand the unique challenges and opportunities of our diverse market.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "100% Secure & Transparent",
                description: "Blockchain-powered transparency with every transaction recorded and verifiable.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Users,
                title: "Community-Driven",
                description: "Connect with like-minded supporters and build lasting relationships beyond funding.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: TrendingUp,
                title: "Smart Analytics",
                description: "AI-powered insights help optimize your campaign for maximum impact and reach.",
                gradient: "from-green-500 to-teal-500"
              },
              {
                icon: Globe,
                title: "Global Reach, Local Heart",
                description: "Access international investors while staying rooted in Indian values and culture.",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: CheckCircle,
                title: "Verified Projects Only",
                description: "Every campaign goes through our rigorous verification process for investor protection.",
                gradient: "from-indigo-500 to-purple-500"
              },
              {
                icon: Heart,
                title: "Impact-First Approach",
                description: "Beyond profits - we prioritize projects that create positive social and environmental impact.",
                gradient: "from-pink-500 to-rose-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border-white/30 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-all duration-300 hover:shadow-xl group-hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${feature.gradient} mb-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Campaigns Section */}
      <section id="campaigns" className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Success Stories That Inspire
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From tech startups to social causes - see how ordinary Indians are achieving extraordinary dreams
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {["All Stories", "Technology", "Social Impact", "Creative Arts", "Healthcare"].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/30 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-300"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Campaign Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {campaigns.slice(0, 6).map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="transform group-hover:scale-105 transition-transform duration-300">
                  <CampaignCard campaign={campaign} />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-10 py-4 rounded-full font-semibold"
              onClick={() => window.location.href = '/campaigns'}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Explore All Campaigns
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="about" className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div 
            {...floatingAnimation}
            className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div 
            {...floatingAnimation}
            transition={{ duration: 4, delay: 1 }}
            className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to Make History?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
              Join thousands of visionaries who are shaping India's future. Whether you're funding dreams or building them, your journey starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-10 py-4 rounded-full font-bold"
                onClick={() => window.location.href = '/auth'}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your Campaign
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/50 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-300 text-lg px-10 py-4 rounded-full font-semibold"
                onClick={() => window.location.href = '/campaigns'}
              >
                <Heart className="w-5 h-5 mr-2" />
                Support Projects
              </Button>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-sm opacity-75 mb-4">Trusted by 12L+ Indians across 600+ cities</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-xs">🔒 Bank-grade Security</div>
                <div className="text-xs">✓ RBI Compliant</div>
                <div className="text-xs">🏆 Award Winning Platform</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-gray-800 dark:text-gray-200">
              Questions? We're Here to Help
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Our team of experts is available 24/7 to support your crowdfunding journey
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-10 py-4 rounded-full font-semibold"
            >
              Get Support
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
