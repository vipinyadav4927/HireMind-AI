import type { backendInterface } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);

const sampleCandidates = [
  {
    id: "cand-001",
    status: "Completed",
    weaknesses: "Could improve system design depth",
    strengths: "Strong problem-solving and communication skills",
    passcode: "abc123",
    name: "Priya Sharma",
    designation: "Senior Software Engineer",
    createdAt: now - BigInt(7 * 24 * 3600 * 1e9),
    audioLink: "https://example.com/audio/priya.webm",
    email: "priya.sharma@example.com",
    score: BigInt(82),
    interviewDate: now - BigInt(2 * 24 * 3600 * 1e9),
    department: "Engineering",
  },
  {
    id: "cand-002",
    status: "Pending",
    weaknesses: undefined,
    strengths: undefined,
    passcode: "def456",
    name: "Rahul Verma",
    designation: "Product Manager",
    createdAt: now - BigInt(3 * 24 * 3600 * 1e9),
    audioLink: undefined,
    email: "rahul.verma@example.com",
    score: undefined,
    interviewDate: undefined,
    department: "Product",
  },
  {
    id: "cand-003",
    status: "In Progress",
    weaknesses: undefined,
    strengths: undefined,
    passcode: "ghi789",
    name: "Ananya Patel",
    designation: "UX Designer",
    createdAt: now - BigInt(1 * 24 * 3600 * 1e9),
    audioLink: undefined,
    email: "ananya.patel@example.com",
    score: undefined,
    interviewDate: now,
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
    createdAt: now - BigInt(10 * 24 * 3600 * 1e9),
    audioLink: "https://example.com/audio/vikram.webm",
    email: "vikram.singh@example.com",
    score: BigInt(91),
    interviewDate: now - BigInt(5 * 24 * 3600 * 1e9),
    department: "Engineering",
  },
];

export const mockBackend: backendInterface = {
  adminLogin: async (email: string, _password: string) => {
    if (email === "admin@interviewai.com") {
      return { __kind__: "ok" as const, ok: "mock-admin-token-123" };
    }
    return { __kind__: "err" as const, err: "Invalid credentials" };
  },

  adminLogout: async (_token: string) => true,

  candidateLogin: async (email: string, _passcode: string) => {
    const found = sampleCandidates.find((c) => c.email === email);
    if (found) {
      return { __kind__: "ok" as const, ok: "mock-candidate-token-456" };
    }
    return { __kind__: "err" as const, err: "Candidate not found" };
  },

  completeInterview: async () => ({ __kind__: "ok" as const, ok: null }),

  createAdmin: async () => ({ __kind__: "ok" as const, ok: null }),

  createCandidate: async (email, name, department, designation) => ({
    __kind__: "ok" as const,
    ok: {
      id: "cand-new-" + Date.now(),
      status: "Pending",
      weaknesses: undefined,
      strengths: undefined,
      passcode: "new123",
      name,
      designation,
      createdAt: now,
      audioLink: undefined,
      email,
      score: undefined,
      interviewDate: undefined,
      department,
    },
  }),

  createInterviewSession: async (candidateEmail: string) => ({
    __kind__: "ok" as const,
    ok: {
      status: "Active",
      completedAt: undefined,
      startedAt: now,
      candidateEmail,
      questions: [
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
      ],
      sessionId: "session-mock-" + Date.now(),
      currentQuestionIndex: BigInt(0),
      tabSwitchCount: BigInt(0),
    },
  }),

  getCandidateByEmail: async (email: string) =>
    sampleCandidates.find((c) => c.email === email) ?? null,

  getCandidateByToken: async (_token: string) => sampleCandidates[0],

  getCandidates: async () => sampleCandidates,

  getCandidatesForSync: async () => sampleCandidates,

  getDepartmentStats: async () => [
    { avgScore: BigInt(86), count: BigInt(8), department: "Engineering" },
    { avgScore: BigInt(74), count: BigInt(4), department: "Product" },
    { avgScore: BigInt(79), count: BigInt(3), department: "Design" },
    { avgScore: BigInt(68), count: BigInt(2), department: "Marketing" },
  ],

  getInterviewSession: async (_sessionId: string) => ({
    status: "Active",
    completedAt: undefined,
    startedAt: now,
    candidateEmail: "priya.sharma@example.com",
    questions: [
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
    ],
    sessionId: "session-mock-001",
    currentQuestionIndex: BigInt(0),
    tabSwitchCount: BigInt(0),
  }),

  getStats: async () => ({
    avgScore: BigInt(82),
    total: BigInt(17),
    pending: BigInt(5),
    completed: BigInt(10),
    inProgress: BigInt(2),
  }),

  syncFromSheets: async () => ({ __kind__: "ok" as const, ok: BigInt(4) }),

  updateTabSwitchCount: async () => ({ __kind__: "ok" as const, ok: BigInt(1) }),

  validateAdminSession: async (_token: string) => true,

  validateCandidateSession: async (_token: string) =>
    "priya.sharma@example.com",
};
