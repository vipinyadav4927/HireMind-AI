import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EvaluationResult {
    weaknesses: string;
    strengths: string;
    confidenceRating: bigint;
    communicationRating: bigint;
    score: bigint;
    recommendation: string;
    technicalRating: bigint;
}
export interface Candidate {
    id: string;
    status: string;
    weaknesses?: string;
    strengths?: string;
    passcode: string;
    name: string;
    designation: string;
    createdAt: Timestamp;
    audioLink?: string;
    email: string;
    score?: bigint;
    interviewDate?: Timestamp;
    department: string;
}
export type Timestamp = bigint;
export interface SheetCandidate {
    status: string;
    weaknesses?: string;
    strengths?: string;
    name: string;
    designation: string;
    audioLink?: string;
    email: string;
    score?: bigint;
    department: string;
}
export interface InterviewSession {
    status: string;
    completedAt?: Timestamp;
    startedAt: Timestamp;
    candidateEmail: string;
    questions: Array<string>;
    sessionId: string;
    currentQuestionIndex: bigint;
    tabSwitchCount: bigint;
}
export interface Stats {
    avgScore: bigint;
    total: bigint;
    pending: bigint;
    completed: bigint;
    inProgress: bigint;
}
export interface DepartmentStat {
    avgScore: bigint;
    count: bigint;
    department: string;
}
export interface backendInterface {
    adminLogin(email: string, password: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminLogout(token: string): Promise<boolean>;
    candidateLogin(email: string, passcode: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    completeInterview(sessionId: string, evaluation: EvaluationResult, audioLinks: Array<string>): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createAdmin(email: string, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createCandidate(email: string, name: string, department: string, designation: string): Promise<{
        __kind__: "ok";
        ok: Candidate;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createInterviewSession(candidateEmail: string): Promise<{
        __kind__: "ok";
        ok: InterviewSession;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getCandidateByEmail(email: string): Promise<Candidate | null>;
    getCandidateByToken(token: string): Promise<Candidate | null>;
    getCandidates(): Promise<Array<Candidate>>;
    getCandidatesForSync(): Promise<Array<Candidate>>;
    getDepartmentStats(): Promise<Array<DepartmentStat>>;
    getInterviewSession(sessionId: string): Promise<InterviewSession | null>;
    getStats(): Promise<Stats>;
    syncFromSheets(sheetCandidates: Array<SheetCandidate>): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTabSwitchCount(sessionId: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    validateAdminSession(token: string): Promise<boolean>;
    validateCandidateSession(token: string): Promise<string | null>;
}
