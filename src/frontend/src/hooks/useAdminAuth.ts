import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export function useAdminLogin() {
  const { actor } = useActor(createActor);
  const { setAdminAuth } = useAdminAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: { email: string; password: string }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.adminLogin(email, password);
      if (result.__kind__ === "err") throw new Error(result.err);
      return { token: result.ok, email };
    },
    onSuccess: ({ token, email }) => {
      setAdminAuth(token, email);
      queryClient.invalidateQueries({ queryKey: ["admin-session"] });
    },
  });
}

export function useAdminLogout() {
  const { actor } = useActor(createActor);
  const { adminToken, clearAdminAuth } = useAdminAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !adminToken) throw new Error("No active session");
      await actor.adminLogout(adminToken);
    },
    onSuccess: () => {
      clearAdminAuth();
      queryClient.clear();
    },
  });
}

export function useValidateAdminSession() {
  const { actor, isFetching } = useActor(createActor);
  const { adminToken } = useAdminAuthStore();

  return useQuery({
    queryKey: ["admin-session", adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return false;
      return actor.validateAdminSession(adminToken);
    },
    enabled: !!actor && !isFetching && !!adminToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAdmin() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: { email: string; password: string }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createAdmin(email, password);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
  });
}
