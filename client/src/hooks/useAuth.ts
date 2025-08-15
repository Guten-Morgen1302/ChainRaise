import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      window.location.replace("/auth");
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
