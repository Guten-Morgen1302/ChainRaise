import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function NotFound() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Card className="w-full max-w-lg mx-4 border-muted">
            <CardContent className="pt-12 pb-8 px-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
              
              <p className="text-muted-foreground mb-2">
                The page you're looking for doesn't exist.
              </p>
              
              <p className="text-sm text-muted-foreground mb-8">
                Requested path: <code className="bg-muted px-2 py-1 rounded text-xs">{location}</code>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button className="w-full sm:w-auto" data-testid="button-home">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                  className="w-full sm:w-auto"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg text-left">
                <h3 className="text-sm font-medium mb-2">Available Pages:</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• <Link href="/" className="hover:underline">/</Link> - Home</div>
                  <div>• <Link href="/campaigns" className="hover:underline">/campaigns</Link> - Browse Campaigns</div>
                  <div>• <Link href="/create" className="hover:underline">/create</Link> - Create Campaign</div>
                  <div>• <Link href="/dashboard" className="hover:underline">/dashboard</Link> - Dashboard</div>
                  <div>• <Link href="/kyc" className="hover:underline">/kyc</Link> - KYC Verification</div>
                  <div>• <Link href="/explorer" className="hover:underline">/explorer</Link> - Explorer</div>
                  <div>• <Link href="/auth" className="hover:underline">/auth</Link> - Authentication</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
