import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/PageLayout";
import CampaignCard from "@/components/campaign/campaign-card";
import { Search, Filter, Loader2 } from "lucide-react";
import type { Campaign } from "@shared/schema";

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns", selectedCategory !== "all" ? selectedCategory : undefined],
    retry: false,
  });

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "Technology", label: "Technology" },
    { id: "Gaming", label: "Gaming" },
    { id: "DeFi", label: "DeFi" },
    { id: "Creative", label: "Creative" },
    { id: "GreenTech", label: "GreenTech" },
    { id: "Research", label: "Research" },
  ];

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout backTo="/" backLabel="Back to Home">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">
                Discover Campaigns
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore groundbreaking projects and help bring innovative ideas to life
              </p>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-morphism border-white/20 focus:border-cyber-blue form-focus"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-cyber-blue to-cyber-purple"
                        : "glass-morphism hover:bg-cyber-blue/20 border-cyber-blue/50"
                    }
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Campaigns Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyber-blue" />
                <span className="ml-2 text-muted-foreground">Loading campaigns...</span>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <Card className="glass-morphism max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredCampaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CampaignCard campaign={campaign} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Load More Button */}
            {filteredCampaigns.length > 0 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  className="glass-morphism hover:bg-white/20"
                >
                  Load More Campaigns
                </Button>
              </div>
            )}
        </div>
      </section>
    </PageLayout>
  );
}
