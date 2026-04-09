import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendInterviewResultToWebhook } from "../lib/googleSheetsWebhook";
import { useCandidateAuthStore } from "../stores/candidateAuthStore";
import type { EvaluationResult } from "../types";
import { useBackendActor } from "./useBackendActor";

export function useInterviewSession(sessionId: string | null) {
  const { actor, isFetching } = useBackendActor();

  return useQuery({
    queryKey: ["interview-session", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getInterviewSession(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    refetchInterval: 5000,
  });
}

export function useCreateInterviewSession() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateEmail: string) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createInterviewSession(candidateEmail);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (session) => {
      queryClient.setQueryData(
        ["interview-session", session.sessionId],
        session,
      );
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}

export function useUpdateTabSwitchCount() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateTabSwitchCount(sessionId);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: ["interview-session", sessionId],
      });
    },
  });
}

export function useCompleteInterview() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      evaluation,
      audioLinks,
    }: {
      sessionId: string;
      evaluation: EvaluationResult;
      audioLinks: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.completeInterview(
        sessionId,
        evaluation,
        audioLinks,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      const { candidateEmail, currentCandidate } =
        useCandidateAuthStore.getState();
      try {
        await sendInterviewResultToWebhook({
          candidate: currentCandidate,
          candidateEmail,
          sessionId,
          evaluation,
          audioLinks,
        });
      } catch (error) {
        console.error("Failed to send interview result to webhook", error);
      }
      return result.ok;
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["interview-session", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
