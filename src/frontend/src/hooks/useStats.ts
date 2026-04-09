import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export function useStats() {
  const { actor, isFetching } = useActor(createActor);
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
  const { actor, isFetching } = useActor(createActor);
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
