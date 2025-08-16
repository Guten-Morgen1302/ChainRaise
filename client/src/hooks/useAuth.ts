import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors (401/403)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Only retry twice for other errors
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      window.location.replace("/");
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const login = () => {
    window.location.href = "/auth";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    login,
  };
}
