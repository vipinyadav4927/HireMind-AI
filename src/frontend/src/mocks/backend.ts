import type { backendInterface } from "../backend";
import type {
  Candidate,
  DepartmentStat,
  EvaluationResult,
  InterviewSession,
  Stats,
} from "../types";

const mockAdminEmail = "vipinyadav4926@gmail.com";
const mockAdminPassword = "1234";

function nowTs() {
  return BigInt(Date.now()) * BigInt(1_000_000);
}

function cloneCandidate(candidate: Candidate): Candidate {
  return { ...candidate };
}

function buildQuestions() {
  return [
    "Tell me about yourself and your professional background.",
    "What motivated you to apply for this position?",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "How do you prioritize tasks when working on multiple projects simultaneously?",
    "What are your key technical strengths relevant to this role?",
    "Describe your experience with agile development methodologies.",
    "How do you handle disagreements with team members or stakeholders?",
    "What is your approach to debugging a complex issue in production?",
    "Tell me about a time you had to learn a new technology quickly.",
    "How do you ensure code quality and maintainability in your projects?",
    "Where do you see yourself professionally in the next 3-5 years?",
    "Do you have any questions for us about the role or company?",
  ];
}

function generatePasscode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const initialNow = nowTs();

let mockCandidates: Candidate[] = [
  {
    id: "cand-001",
    status: "Completed",
    weaknesses: "Could improve system design depth",
    strengths: "Strong problem-solving and communication skills",
    passcode: "abc123",
    name: "Priya Sharma",
    designation: "Senior Software Engineer",
    createdAt: initialNow - BigInt(7 * 24 * 3600 * 1e9),
    audioLink: "https://example.com/audio/priya.webm",
    email: "priya.sharma@example.com",
    score: BigInt(8),
    interviewDate: initialNow - BigInt(2 * 24 * 3600 * 1e9),
    department: "Engineering",
    recommendation: "Hire",
    technicalRating: BigInt(8),
    communicationRating: BigInt(9),
    confidenceRating: BigInt(8),
  },
  {
    id: "cand-002",
    status: "Pending",
    weaknesses: undefined,
    strengths: undefined,
    passcode: "def456",
    name: "Rahul Verma",
    designation: "Product Manager",
    createdAt: initialNow - BigInt(3 * 24 * 3600 * 1e9),
    audioLink: undefined,
    email: "rahul.verma@example.com",
    score: undefined,
    interviewDate: undefined,
    department: "Product",
  },
  {
    id: "cand-003",
    status: "InProgress",
    weaknesses: undefined,
    strengths: undefined,
    passcode: "ghi789",
    name: "Ananya Patel",
    designation: "UX Designer",
    createdAt: initialNow - BigInt(1 * 24 * 3600 * 1e9),
    audioLink: undefined,
    email: "ananya.patel@example.com",
    score: undefined,
    interviewDate: initialNow,
    department: "Design",
  },
  {
    id: "cand-004",
    status: "Completed",
    weaknesses: "Needs more experience with distributed systems",
    strengths: "Excellent analytical thinking and leadership",
    passcode: "jkl012",
    name: "Vikram Singh",
    designation: "Backend Engineer",
    createdAt: initialNow - BigInt(10 * 24 * 3600 * 1e9),
    audioLink: "https://example.com/audio/vikram.webm",
    email: "vikram.singh@example.com",
    score: BigInt(9),
    interviewDate: initialNow - BigInt(5 * 24 * 3600 * 1e9),
    department: "Engineering",
    recommendation: "Hire",
    technicalRating: BigInt(9),
    communicationRating: BigInt(8),
    confidenceRating: BigInt(9),
  },
];

const mockSessions = new Map<string, InterviewSession>();
const candidateSessions = new Map<string, string>();

function findCandidateByEmail(email: string) {
  return mockCandidates.find((candidate) => candidate.email === email);
}

function findCandidateById(id: string) {
  return mockCandidates.find((candidate) => candidate.id === id);
}

function updateCandidate(candidate: Candidate) {
  mockCandidates = mockCandidates.map((current) =>
    current.id === candidate.id ? cloneCandidate(candidate) : current,
  );
}

function buildStats(): Stats {
  const completed = mockCandidates.filter((candidate) => candidate.status === "Completed");
  const inProgress = mockCandidates.filter(
    (candidate) => candidate.status === "InProgress",
  );
  const pending = mockCandidates.filter((candidate) => candidate.status === "Pending");
  const scored = completed.filter((candidate) => candidate.score != null);
  const average =
    scored.length === 0
      ? 0
      : Math.round(
          scored.reduce((sum, candidate) => sum + Number(candidate.score), 0) /
            scored.length,
        );

  return {
    total: BigInt(mockCandidates.length),
    completed: BigInt(completed.length),
    pending: BigInt(pending.length),
    inProgress: BigInt(inProgress.length),
    avgScore: BigInt(average),
  };
}

function buildDepartmentStats(): DepartmentStat[] {
  const grouped = new Map<
    string,
    { count: number; totalScore: number; scoredCount: number }
  >();

  for (const candidate of mockCandidates) {
    const current = grouped.get(candidate.department) ?? {
      count: 0,
      totalScore: 0,
      scoredCount: 0,
    };
    current.count += 1;
    if (candidate.score != null) {
      current.totalScore += Number(candidate.score);
      current.scoredCount += 1;
    }
    grouped.set(candidate.department, current);
  }

  return Array.from(grouped.entries()).map(([department, value]) => ({
    department,
    count: BigInt(value.count),
    avgScore: BigInt(
      value.scoredCount === 0
        ? 0
        : Math.round(value.totalScore / value.scoredCount),
    ),
  }));
}

export const mockBackend: backendInterface = {
  adminLogin: async (email: string, password: string) => {
    if (email === mockAdminEmail && password === mockAdminPassword) {
      return { __kind__: "ok" as const, ok: "mock-admin-token-123" };
    }
    return { __kind__: "err" as const, err: "Invalid credentials" };
  },

  adminLogout: async (_token: string) => true,

  candidateLogin: async (email: string, passcode: string) => {
    const found = findCandidateByEmail(email);
    if (!found) {
      return { __kind__: "err" as const, err: "Candidate not found" };
    }
    if (found.status === "Completed") {
      return {
        __kind__: "err" as const,
        err: "Interview already completed. You cannot log in again.",
      };
    }
    if (found.passcode !== passcode) {
      return { __kind__: "err" as const, err: "Invalid passcode" };
    }

    const token = generateToken("mock-candidate-token");
    candidateSessions.set(token, found.email);
    return { __kind__: "ok" as const, ok: token };
  },

  completeInterview: async (
    sessionId: string,
    evaluation: EvaluationResult,
    audioLinks: string[],
  ) => {
    const session = mockSessions.get(sessionId);
    if (!session) {
      return { __kind__: "err" as const, err: "Session not found" };
    }

    const candidate = findCandidateByEmail(session.candidateEmail);
    if (!candidate) {
      return { __kind__: "err" as const, err: "Candidate not found" };
    }

    const completedAt = nowTs();
    mockSessions.set(sessionId, {
      ...session,
      status: "completed",
      completedAt,
    });

    updateCandidate({
      ...candidate,
      status: "Completed",
      score: evaluation.score,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      recommendation: evaluation.recommendation,
      technicalRating: evaluation.technicalRating,
      communicationRating: evaluation.communicationRating,
      confidenceRating: evaluation.confidenceRating,
      audioLink: audioLinks[0] || candidate.audioLink,
      interviewDate: completedAt,
    });

    return { __kind__: "ok" as const, ok: null };
  },

  createAdmin: async () => ({ __kind__: "ok" as const, ok: null }),

  createCandidate: async (email, name, department, designation) => {
    if (findCandidateByEmail(email)) {
      return { __kind__: "err" as const, err: "Candidate already exists" };
    }

    const candidate: Candidate = {
      id: generateToken("cand"),
      status: "Pending",
      weaknesses: undefined,
      strengths: undefined,
      passcode: generatePasscode(),
      name,
      designation,
      createdAt: nowTs(),
      audioLink: undefined,
      email,
      score: undefined,
      interviewDate: undefined,
      department,
    };

    mockCandidates = [candidate, ...mockCandidates];

    return {
      __kind__: "ok" as const,
      ok: cloneCandidate(candidate),
    };
  },

  createInterviewSession: async (candidateEmail: string) => {
    const candidate = findCandidateByEmail(candidateEmail);
    if (!candidate) {
      return { __kind__: "err" as const, err: "Candidate not found" };
    }
    if (candidate.status === "Completed") {
      return { __kind__: "err" as const, err: "Interview already completed" };
    }

    const startedAt = nowTs();
    const session: InterviewSession = {
      status: "Active",
      completedAt: undefined,
      startedAt,
      candidateEmail,
      questions: buildQuestions(),
      sessionId: generateToken("session-mock"),
      currentQuestionIndex: BigInt(0),
      tabSwitchCount: BigInt(0),
    };

    mockSessions.set(session.sessionId, session);
    updateCandidate({
      ...candidate,
      status: "InProgress",
      interviewDate: startedAt,
    });

    return { __kind__: "ok" as const, ok: session };
  },

  getCandidateByEmail: async (email: string) => {
    const candidate = findCandidateByEmail(email);
    return candidate ? cloneCandidate(candidate) : null;
  },

  getCandidateByToken: async (token: string) => {
    const candidate = findCandidateById(token) ?? findCandidateByEmail(token);
    return candidate ? cloneCandidate(candidate) : null;
  },

  getCandidates: async () => mockCandidates.map(cloneCandidate),

  getCandidatesForSync: async () => mockCandidates.map(cloneCandidate),

  getDepartmentStats: async () => buildDepartmentStats(),

  getInterviewSession: async (sessionId: string) => mockSessions.get(sessionId) ?? null,

  getStats: async () => buildStats(),

  syncFromSheets: async () => ({
    __kind__: "ok" as const,
    ok: BigInt(mockCandidates.length),
  }),

  updateTabSwitchCount: async (sessionId: string) => {
    const session = mockSessions.get(sessionId);
    if (!session) {
      return { __kind__: "err" as const, err: "Session not found" };
    }

    const nextCount = session.tabSwitchCount + BigInt(1);
    mockSessions.set(sessionId, {
      ...session,
      tabSwitchCount: nextCount,
    });

    return { __kind__: "ok" as const, ok: nextCount };
  },

  validateAdminSession: async (token: string) => token === "mock-admin-token-123",

  validateCandidateSession: async (token: string) =>
    candidateSessions.get(token) ?? null,
};
