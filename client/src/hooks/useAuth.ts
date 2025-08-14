import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      window.location.href = "/auth";
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
