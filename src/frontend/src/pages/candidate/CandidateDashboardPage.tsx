import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mic,
  MicOff,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CandidateLayout } from "../../components/layouts/CandidateLayout";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { useCreateInterviewSession } from "../../hooks/useInterviewSession";
import { useCandidateAuthStore } from "../../stores/candidateAuthStore";

const INSTRUCTIONS = [
  {
    icon: Mic,
    title: "Microphone Required",
    desc: "Your answers are recorded as audio. Ensure you're in a quiet environment.",
  },
  {
    icon: MessageSquare,
    title: "12+ Questions",
    desc: "Adaptive questions based on your role, progressing in difficulty.",
  },
  {
    icon: Clock,
    title: "2 Minutes Per Answer",
    desc: "Each question has a 2-minute timer. Your answer is submitted when time ends.",
  },
  {
    icon: Shield,
    title: "No Tab Switching",
    desc: "Leaving this tab is monitored. After 5 violations, the interview auto-ends.",
  },
];

export default function CandidateDashboardPage() {
  const navigate = useNavigate();
  const { candidateEmail, currentCandidate, isAuthenticated } =
    useCandidateAuthStore();
  const createSession = useCreateInterviewSession();

  const [micStatus, setMicStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/interview/login" });
    }
  }, [isAuthenticated, navigate]);

  const candidate = currentCandidate as {
    name?: string;
    department?: string;
    designation?: string;
    status?: string;
    score?: bigint;
  } | null;

  const email = candidateEmail ?? "";
  const isCompleted = candidate?.status === "Completed";

  async function requestMic() {
    setMicStatus("requesting");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus("granted");
      toast.success("Microphone access granted");
    } catch {
      setMicStatus("denied");
      toast.error(
        "Microphone access denied. Please allow microphone to proceed.",
      );
    }
  }

  async function startInterview() {
    if (micStatus !== "granted") return;
    try {
      const session = await createSession.mutateAsync(email);
      navigate({
        to: "/interview/session",
        search: { sessionId: session.sessionId },
      });
    } catch {
      toast.error("Failed to start interview. Please try again.");
    }
  }

  if (!isAuthenticated) return null;

  return (
    <CandidateLayout>
      <div className="flex flex-col gap-8" data-ocid="candidate-dashboard">
        {/* Welcome card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground truncate">
                  {candidate?.name ?? email}
                </h1>
                <Badge
                  variant={isCompleted ? "secondary" : "outline"}
                  className={
                    isCompleted
                      ? ""
                      : "border-primary/30 text-primary bg-primary/10"
                  }
                >
                  {isCompleted ? "Completed" : "Pending"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{email}</p>
              {(candidate?.department || candidate?.designation) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {candidate.department && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {candidate.department}
                    </span>
                  )}
                  {candidate.designation && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {candidate.designation}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completed state */}
        {isCompleted ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-card">
            <CheckCircle2 className="h-14 w-14 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Interview Submitted
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Your interview has been completed and submitted for review. Our
              team will be in touch with you soon.
            </p>
            {candidate?.score !== undefined && candidate.score !== null && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
                <span className="text-sm text-muted-foreground">
                  Your Score:
                </span>
                <span className="font-display font-bold text-primary text-lg">
                  {String(candidate.score)}/10
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Instructions */}
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Before You Begin
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INSTRUCTIONS.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-3 p-4 bg-card border border-border rounded-xl"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Mic check + start */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card">
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                Ready to Start?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                First, grant microphone access. Then start your interview.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {/* Mic button */}
                <Button
                  variant="outline"
                  onClick={requestMic}
                  disabled={
                    micStatus === "granted" || micStatus === "requesting"
                  }
                  className="gap-2 h-11"
                  data-ocid="mic-permission-btn"
                >
                  {micStatus === "requesting" ? (
                    <LoadingSpinner size="sm" />
                  ) : micStatus === "granted" ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : micStatus === "denied" ? (
                    <MicOff className="h-4 w-4 text-destructive" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {micStatus === "granted"
                    ? "Microphone Ready"
                    : micStatus === "denied"
                      ? "Access Denied"
                      : micStatus === "requesting"
                        ? "Requesting…"
                        : "Enable Microphone"}
                </Button>

                {micStatus === "denied" && (
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Microphone required. Please allow access in browser
                    settings.
                  </p>
                )}

                {micStatus === "granted" && (
                  <Button
                    onClick={startInterview}
                    disabled={createSession.isPending}
                    className="gap-2 h-11 font-medium"
                    data-ocid="start-interview-btn"
                  >
                    {createSession.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        Start Interview
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {micStatus === "idle" && (
                <p className="text-xs text-muted-foreground mt-4">
                  Once microphone is enabled, the Start Interview button will
                  appear.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </CandidateLayout>
  );
}
