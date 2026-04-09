import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  Minus,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect } from "react";
import { CandidateLayout } from "../../components/layouts/CandidateLayout";
import { useCandidateAuthStore } from "../../stores/candidateAuthStore";

type Recommendation = "Hire" | "Maybe" | "No-Hire" | string;

const REC_CONFIG: Record<
  string,
  { label: string; icon: typeof ThumbsUp; className: string }
> = {
  Hire: {
    label: "Recommended to Hire",
    icon: ThumbsUp,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  Maybe: {
    label: "Needs Further Review",
    icon: Minus,
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  },
  "No-Hire": {
    label: "Not Recommended",
    icon: ThumbsDown,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 10) * circumference;
  const color =
    score >= 7
      ? "text-emerald-400"
      : score >= 5
        ? "text-yellow-400"
        : "text-destructive";
  const strokeClass =
    score >= 7
      ? "stroke-emerald-400"
      : score >= 5
        ? "stroke-amber-400"
        : "stroke-destructive";

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg
        className="w-32 h-32 -rotate-90"
        viewBox="0 0 120 120"
        role="img"
        aria-label="Score ring"
      >
        <title>Score ring</title>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${strokeClass}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`font-display text-3xl font-bold ${color}`}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/10</span>
      </div>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const width = `${(value / 10) * 100}%`;
  const color =
    value >= 7
      ? "bg-emerald-400"
      : value >= 5
        ? "bg-yellow-400"
        : "bg-destructive";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">
        {label}
      </span>
      <div className="flex-1 bg-secondary rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width }}
        />
      </div>
      <span className="text-xs font-medium text-foreground w-6 text-right">
        {value}
      </span>
    </div>
  );
}

export default function InterviewCompletePage() {
  const navigate = useNavigate();
  const { currentCandidate, clearCandidateAuth, isAuthenticated } =
    useCandidateAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/interview/login" });
    }
  }, [isAuthenticated, navigate]);

  const candidate = currentCandidate as {
    name?: string;
    department?: string;
    designation?: string;
    score?: bigint | null;
    strengths?: string;
    weaknesses?: string;
    recommendation?: string;
    technicalRating?: bigint | null;
    communicationRating?: bigint | null;
    confidenceRating?: bigint | null;
  } | null;

  const score = candidate?.score != null ? Number(candidate.score) : null;
  const technicalRating =
    candidate?.technicalRating != null
      ? Number(candidate.technicalRating)
      : null;
  const communicationRating =
    candidate?.communicationRating != null
      ? Number(candidate.communicationRating)
      : null;
  const confidenceRating =
    candidate?.confidenceRating != null
      ? Number(candidate.confidenceRating)
      : null;
  const recommendation: Recommendation = candidate?.recommendation ?? "Maybe";
  const recConfig = REC_CONFIG[recommendation] ?? REC_CONFIG.Maybe;

  const strengthsList = candidate?.strengths
    ? candidate.strengths.split(/[.,;]\s*/).filter(Boolean)
    : ["Strong communication skills", "Good problem-solving approach"];

  const weaknessesList = candidate?.weaknesses
    ? candidate.weaknesses.split(/[.,;]\s*/).filter(Boolean)
    : ["More specific examples needed", "Technical depth can be improved"];

  function handleDone() {
    clearCandidateAuth();
    navigate({ to: "/interview/login" });
  }

  if (!isAuthenticated) return null;

  return (
    <CandidateLayout>
      <div className="flex flex-col gap-8 pb-4" data-ocid="interview-complete">
        {/* Success header */}
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 border border-primary/30 mb-1">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Interview Completed
          </h1>
          <p className="text-muted-foreground max-w-md text-sm sm:text-base">
            Thank you{candidate?.name ? `, ${candidate.name}` : ""}! Your
            responses have been recorded and evaluated. Our team will review
            your results and be in touch soon.
          </p>
          {(candidate?.department || candidate?.designation) && (
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {candidate.designation && (
                <Badge variant="secondary" className="text-xs">
                  {candidate.designation}
                </Badge>
              )}
              {candidate.department && (
                <Badge variant="outline" className="text-xs border-border">
                  {candidate.department}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Score + Recommendation row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Score ring */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4 shadow-card">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2 self-start w-full">
              <Award className="h-4 w-4 text-primary" />
              Overall Score
            </h2>
            {score !== null ? (
              <ScoreRing score={score} />
            ) : (
              <div className="h-32 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  Score pending review
                </span>
              </div>
            )}
          </div>

          {/* Recommendation */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-card">
            <h2 className="font-display font-semibold text-foreground">
              Recommendation
            </h2>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${recConfig.className}`}
            >
              <recConfig.icon className="h-5 w-5 shrink-0" />
              <span className="font-medium text-sm">{recConfig.label}</span>
            </div>

            {(technicalRating || communicationRating || confidenceRating) && (
              <div className="flex flex-col gap-3 mt-1">
                {technicalRating !== null && technicalRating !== undefined && (
                  <RatingBar label="Technical" value={technicalRating} />
                )}
                {communicationRating !== null &&
                  communicationRating !== undefined && (
                    <RatingBar
                      label="Communication"
                      value={communicationRating}
                    />
                  )}
                {confidenceRating !== null &&
                  confidenceRating !== undefined && (
                    <RatingBar label="Confidence" value={confidenceRating} />
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Strengths
            </h2>
            <ul className="flex flex-col gap-2">
              {strengthsList.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2 mb-4">
              <TrendingDown className="h-4 w-4 text-yellow-400" />
              Areas to Improve
            </h2>
            <ul className="flex flex-col gap-2">
              {weaknessesList.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Footer action */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground max-w-sm">
            This interview session is now closed. You cannot retake the
            interview.
          </p>
          <button
            type="button"
            onClick={handleDone}
            className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
            data-ocid="done-btn"
          >
            Return to Portal →
          </button>
        </div>
      </div>
    </CandidateLayout>
  );
}
