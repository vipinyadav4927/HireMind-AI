import type { Candidate, EvaluationResult } from "../types";

const GOOGLE_SHEETS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxtLmv0qFnWl8bf0p3VMKL40nt5czc9KxbmwG_ijrMHQXFDfpuMOuyQEIQKJAakMbo7tA/exec";
const NS_PER_MS = BigInt(1_000_000);

function toIsoTimestamp(timestamp?: bigint) {
  if (timestamp == null) return null;
  return new Date(Number(timestamp / NS_PER_MS)).toISOString();
}

function getInterviewLink(candidateId: string) {
  if (typeof window === "undefined") return null;
  return `${window.location.origin}/interview/login?token=${candidateId}`;
}

export function serializeCandidate(candidate: Candidate) {
  return {
    id: candidate.id,
    email: candidate.email,
    name: candidate.name,
    department: candidate.department,
    designation: candidate.designation,
    status: candidate.status,
    passcode: candidate.passcode,
    score: candidate.score != null ? Number(candidate.score) : null,
    strengths: candidate.strengths ?? null,
    weaknesses: candidate.weaknesses ?? null,
    audioLink: candidate.audioLink ?? null,
    createdAt: toIsoTimestamp(candidate.createdAt),
    interviewDate: toIsoTimestamp(candidate.interviewDate),
    interviewLink: getInterviewLink(candidate.id),
    recommendation: candidate.recommendation ?? null,
    technicalRating:
      candidate.technicalRating != null
        ? Number(candidate.technicalRating)
        : null,
    communicationRating:
      candidate.communicationRating != null
        ? Number(candidate.communicationRating)
        : null,
    confidenceRating:
      candidate.confidenceRating != null
        ? Number(candidate.confidenceRating)
        : null,
  };
}

async function postWebhook(payload: unknown) {
  const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return response;
}

export async function sendCandidateCreatedToWebhook(candidate: Candidate) {
  await postWebhook({
    action: "candidate_created",
    sentAt: new Date().toISOString(),
    candidate: serializeCandidate(candidate),
  });
}

export async function sendCandidatesToWebhook(candidates: Candidate[]) {
  await postWebhook({
    action: "candidates_sync",
    sentAt: new Date().toISOString(),
    count: candidates.length,
    candidates: candidates.map(serializeCandidate),
  });

  return candidates.length;
}

export async function sendInterviewResultToWebhook({
  candidate,
  candidateEmail,
  sessionId,
  evaluation,
  audioLinks,
}: {
  candidate?: Candidate | null;
  candidateEmail?: string | null;
  sessionId: string;
  evaluation: EvaluationResult;
  audioLinks: string[];
}) {
  await postWebhook({
    action: "interview_completed",
    sentAt: new Date().toISOString(),
    sessionId,
    candidateEmail: candidate?.email ?? candidateEmail ?? null,
    candidate: candidate ? serializeCandidate(candidate) : null,
    evaluation: {
      score: Number(evaluation.score),
      technicalRating: Number(evaluation.technicalRating),
      communicationRating: Number(evaluation.communicationRating),
      confidenceRating: Number(evaluation.confidenceRating),
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      recommendation: evaluation.recommendation,
    },
    audioLinks,
  });
}
