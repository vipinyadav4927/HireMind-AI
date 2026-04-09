export type Timestamp = bigint;

export interface Candidate {
  id: string;
  email: string;
  name: string;
  department: string;
  designation: string;
  status: "Pending" | "InProgress" | "Completed" | string;
  score?: bigint;
  strengths?: string;
  weaknesses?: string;
  audioLink?: string;
  passcode: string;
  createdAt: Timestamp;
  interviewDate?: Timestamp;
  recommendation?: string;
  technicalRating?: bigint;
  communicationRating?: bigint;
  confidenceRating?: bigint;
}

export interface SheetCandidate {
  email: string;
  name: string;
  department: string;
  designation: string;
  status: string;
  score?: bigint;
  strengths?: string;
  weaknesses?: string;
  audioLink?: string;
}

export interface InterviewSession {
  sessionId: string;
  candidateEmail: string;
  questions: string[];
  currentQuestionIndex: bigint;
  tabSwitchCount: bigint;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  status: string;
}

export interface EvaluationResult {
  score: bigint;
  technicalRating: bigint;
  communicationRating: bigint;
  confidenceRating: bigint;
  strengths: string;
  weaknesses: string;
  recommendation: string;
}

export interface Stats {
  total: bigint;
  completed: bigint;
  pending: bigint;
  inProgress: bigint;
  avgScore: bigint;
}

export interface DepartmentStat {
  department: string;
  avgScore: bigint;
  count: bigint;
}

export type CandidateStatus = "Pending" | "InProgress" | "Completed";
