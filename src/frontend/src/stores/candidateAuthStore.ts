import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Candidate } from "../types";

interface CandidateAuthState {
  candidateToken: string | null;
  candidateEmail: string | null;
  isAuthenticated: boolean;
  currentCandidate: Candidate | null;
  setCandidateAuth: (
    token: string,
    email: string,
    candidate?: Candidate,
  ) => void;
  setCurrentCandidate: (candidate: Candidate) => void;
  clearCandidateAuth: () => void;
}

export const useCandidateAuthStore = create<CandidateAuthState>()(
  persist(
    (set) => ({
      candidateToken: null,
      candidateEmail: null,
      isAuthenticated: false,
      currentCandidate: null,
      setCandidateAuth: (token, email, candidate) =>
        set({
          candidateToken: token,
          candidateEmail: email,
          isAuthenticated: true,
          currentCandidate: candidate ?? null,
        }),
      setCurrentCandidate: (candidate) => set({ currentCandidate: candidate }),
      clearCandidateAuth: () =>
        set({
          candidateToken: null,
          candidateEmail: null,
          isAuthenticated: false,
          currentCandidate: null,
        }),
    }),
    {
      name: "candidate-auth-storage",
      partialize: (state) => ({
        candidateToken: state.candidateToken,
        candidateEmail: state.candidateEmail,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
