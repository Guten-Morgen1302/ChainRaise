import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, Twitter, MessageSquareDiff } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-muted py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-3xl font-bold gradient-text mb-4">
                CryptoFund
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                The future of crowdfunding is here. Launch campaigns, raise funds transparently on blockchain, and build the next generation of innovative projects.
              </p>
              <div className="flex space-x-6">
                <Button variant="ghost" size="icon" className="hover:text-cyber-blue">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-cyber-blue">
                  <Github className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-cyber-blue">
                  <MessageSquareDiff className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-cyber-blue transition-colors duration-300">Browse Campaigns</a></li>
              <li><a href="#" className="hover:text-cyber-blue transition-colors duration-300">Create Campaign</a></li>
              <li><a href="#" className="hover:text-cyber-blue transition-colors duration-300">KYC Verification</a></li>
              <li><a href="#" className="hover:text-cyber-blue transition-colors duration-300">Blockchain Explorer</a></li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-cyber-blue transition-colors duration-300">How It Works</a></li>
              <li><a href="#" className="hover:text-cyber-blue transition-colors duration-300">Documentation</a></li>
              <li><a href="#" className="hover:text-cyber-blue transition-colors duration-300">Support</a></li>
              <li><a href="#" className="hover:text-cyber-blue transition-colors duration-300">API</a></li>
            </ul>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-muted mt-12 pt-8 text-center text-muted-foreground"
        >
          <p>&copy; 2024 CryptoFund. Powering the future of decentralized crowdfunding.</p>
        </motion.div>
      </div>
    </footer>
  );
}
