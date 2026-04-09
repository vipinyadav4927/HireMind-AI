import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export function useCandidates() {
  const { actor, isFetching } = useActor(createActor);
  const { isAdminAuthenticated } = useAdminAuthStore();

  return useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCandidates();
    },
    enabled: !!actor && !isFetching && isAdminAuthenticated,
  });
}

export function useCandidateByEmail(email: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: ["candidate", email],
    queryFn: async () => {
      if (!actor || !email) return null;
      return actor.getCandidateByEmail(email);
    },
    enabled: !!actor && !isFetching && !!email,
  });
}

export function useCandidateByToken(token: string | null) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: ["candidate-by-token", token],
    queryFn: async () => {
      if (!actor || !token) return null;
      return actor.getCandidateByToken(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useCreateCandidate() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      name,
      department,
      designation,
    }: {
      email: string;
      name: string;
      department: string;
      designation: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createCandidate(
        email,
        name,
        department,
        designation,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useCandidateLogin() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async ({
      email,
      passcode,
    }: { email: string; passcode: string }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.candidateLogin(email, passcode);
      if (result.__kind__ === "err") throw new Error(result.err);
      return { token: result.ok, email };
    },
  });
}

export function useValidateCandidateSession(token: string | null) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: ["candidate-session", token],
    queryFn: async () => {
      if (!actor || !token) return null;
      return actor.validateCandidateSession(token);
    },
    enabled: !!actor && !isFetching && !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSyncFromSheets() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      candidates: Array<{
        email: string;
        name: string;
        department: string;
        designation: string;
        status: string;
        score?: bigint;
        strengths?: string;
        weaknesses?: string;
        audioLink?: string;
      }>,
    ) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.syncFromSheets(candidates);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}
