import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLayout } from "@/components/layout/PageLayout";
import CampaignCard from "@/components/campaign/campaign-card";
import { Search, Filter, Loader2, X, Grid, List, SlidersHorizontal } from "lucide-react";
import { useLocation } from "wouter";
import type { Campaign } from "@shared/schema";

export default function Campaigns() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"comfortable" | "compact">("comfortable");
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    retry: false,
  });

  const categories = [
    { id: "Technology", label: "Technology" },
    { id: "Gaming", label: "Gaming" },
    { id: "DeFi", label: "DeFi" },
    { id: "Creative", label: "Creative" },
    { id: "GreenTech", label: "GreenTech" },
    { id: "Research", label: "Research" },
  ];

  const sortOptions = [
    { id: "newest", label: "Newest" },
    { id: "mostFunded", label: "Most Funded" },
    { id: "endingSoon", label: "Ending Soon" },
  ];

  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = searchTerm === "" ||
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(campaign.category || "Technology");
      
      return matchesSearch && matchesCategory;
    });

    // Sort campaigns
    switch (sortBy) {
      case "mostFunded":
        filtered.sort((a, b) => parseFloat(b.currentAmount || "0") - parseFloat(a.currentAmount || "0"));
        break;
      case "endingSoon":
        filtered.sort((a, b) => new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime());
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }

    return filtered;
  }, [campaigns, searchTerm, selectedCategories, sortBy]);

  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSortBy("newest");
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return (
    <PageLayout backTo="/" backLabel="Back to Home">
      {/* Header */}
      <section className="py-16 noise-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-6xl heading-display mb-4 gradient-text">
                Discover Campaigns
              </h1>
              <p className="text-xl body-text max-w-2xl mx-auto opacity-90">
                Explore groundbreaking projects and help bring innovative ideas to life
              </p>
            </motion.div>

            {/* Search and Controls */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-12 h-14 text-lg rounded-full glass border-white/20 focus:border-primary/50 transition-all duration-200"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-glass"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {selectedCategories.length > 0 && (
                      <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 btn-glass">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/20">
                      {sortOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "comfortable" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("comfortable")}
                    className={viewMode === "comfortable" ? "bg-primary" : "btn-glass"}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "compact" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("compact")}
                    className={viewMode === "compact" ? "bg-primary" : "btn-glass"}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Filter Chips */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card-premium p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="heading-display text-lg">Categories</h3>
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategories([])}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.id);
                      return (
                        <motion.button
                          key={category.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleCategory(category.id)}
                          className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/25"
                              : "glass border-white/20 hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          {category.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Active Filters */}
              {(selectedCategories.length > 0 || searchTerm) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="body-text text-sm opacity-70">Active filters:</span>
                  {searchTerm && (
                    <Badge className="bg-accent/20 text-accent border-accent/30">
                      Search: "{searchTerm}"
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="ml-1 h-4 w-4 p-0 hover:bg-accent/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedCategories.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    return (
                      <Badge key={categoryId} className="bg-primary/20 text-primary border-primary/30">
                        {category?.label}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(categoryId)}
                          className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                </div>
              )}
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
              <div className="card-premium max-w-lg mx-auto p-12 text-center">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="heading-display text-2xl mb-3">No matches found</h3>
                <p className="body-text opacity-70 mb-6">
                  {selectedCategories.length > 0 
                    ? "Try exploring other categories or adjusting your filters"
                    : "Try different search terms or browse all categories"
                  }
                </p>
                <Button
                  onClick={clearAllFilters}
                  className="btn-glass"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className={`grid gap-6 ${
                  viewMode === "comfortable"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2 gap-4"
                }`}
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

            {/* Results count and Load More */}
            {filteredCampaigns.length > 0 && (
              <div className="text-center mt-12 space-y-4">
                <p className="body-text text-sm opacity-70">
                  Showing {filteredCampaigns.length} of {campaigns.length} campaigns
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="btn-glass"
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
