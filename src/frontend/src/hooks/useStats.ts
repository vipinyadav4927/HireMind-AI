import { useQuery } from "@tanstack/react-query";
import { useAdminAuthStore } from "../stores/adminAuthStore";
import { useBackendActor } from "./useBackendActor";

export function useStats() {
  const { actor, isFetching } = useBackendActor();
  const { isAdminAuthenticated } = useAdminAuthStore();

  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching && isAdminAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useDepartmentStats() {
  const { actor, isFetching } = useBackendActor();
  const { isAdminAuthenticated } = useAdminAuthStore();

  return useQuery({
    queryKey: ["department-stats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDepartmentStats();
    },
    enabled: !!actor && !isFetching && isAdminAuthenticated,
    staleTime: 60 * 1000,
  });
}
