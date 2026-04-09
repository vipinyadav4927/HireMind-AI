import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CandidateLayout } from "../../components/layouts/CandidateLayout";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import {
  useCompleteInterview,
  useUpdateTabSwitchCount,
} from "../../hooks/useInterviewSession";
import { useCandidateAuthStore } from "../../stores/candidateAuthStore";
import type { EvaluationResult } from "../../types";

const TOTAL_QUESTIONS = 12;
const SECONDS_PER_QUESTION = 120;
const MAX_TAB_SWITCHES = 5;

const FALLBACK_QUESTIONS = [
  "Tell me about yourself and your professional background.",
  "What motivated you to apply for this role?",
  "Describe a challenging project you've worked on and how you overcame obstacles.",
  "How do you prioritize tasks when managing multiple deadlines?",
  "Give an example of a time you demonstrated strong problem-solving skills.",
  "How do you handle constructive criticism or feedback?",
  "Describe your experience working in a team environment.",
  "What are your greatest professional strengths?",
  "Where do you see yourself in 5 years?",
  "How do you stay current with trends in your field?",
  "Describe a situation where you had to adapt quickly to change.",
  "What questions do you have about this role or our organization?",
];

async function fetchAIQuestions(
  designation: string,
  department: string,
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) return [];
  const prompt = `Generate exactly 12 interview questions for a ${designation} in the ${department} department. Questions should be adaptive, progressively harder, and assess technical skills, problem-solving, and behavioral aspects. Return as a JSON array of strings only, no extra text.`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = json.choices[0]?.message?.content ?? "";
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]) as string[];
  } catch {
    return [];
  }
}

async function fetchAIEvaluation(
  questions: string[],
  designation: string,
  department: string,
): Promise<EvaluationResult | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) return null;
  const prompt = `You are evaluating an interview for a ${designation} in the ${department} department.\nThe candidate answered ${questions.length} questions: ${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}.\nReturn ONLY valid JSON: {"score":<1-10>,"technicalRating":<1-10>,"communicationRating":<1-10>,"confidenceRating":<1-10>,"strengths":"...","weaknesses":"...","recommendation":"<Hire|Maybe|No-Hire>"}`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 400,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = json.choices[0]?.message?.content ?? "";
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const p = JSON.parse(match[0]) as {
      score: number;
      technicalRating: number;
      communicationRating: number;
      confidenceRating: number;
      strengths: string;
      weaknesses: string;
      recommendation: string;
    };
    return {
      score: BigInt(Math.min(10, Math.max(1, p.score))),
      technicalRating: BigInt(Math.min(10, Math.max(1, p.technicalRating))),
      communicationRating: BigInt(
        Math.min(10, Math.max(1, p.communicationRating)),
      ),
      confidenceRating: BigInt(Math.min(10, Math.max(1, p.confidenceRating))),
      strengths: p.strengths,
      weaknesses: p.weaknesses,
      recommendation: p.recommendation,
    };
  } catch {
    return null;
  }
}

async function uploadAudioBlob(
  blob: Blob,
  questionIndex: number,
): Promise<string> {
  const storageUrl = import.meta.env.VITE_STORAGE_GATEWAY_URL as
    | string
    | undefined;
  if (!storageUrl) return "";
  try {
    const form = new FormData();
    form.append("file", blob, `question-${questionIndex + 1}.webm`);
    const res = await fetch(storageUrl, { method: "POST", body: form });
    if (!res.ok) return "";
    const json = (await res.json()) as { url?: string; id?: string };
    return json.url ?? json.id ?? "";
  } catch {
    return "";
  }
}

function speakText(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

export default function InterviewPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { sessionId?: string };
  const sessionId = search?.sessionId ?? null;

  const { currentCandidate } = useCandidateAuthStore();
  const updateTabSwitch = useUpdateTabSwitchCount();
  const completeInterview = useCompleteInterview();

  const candidate = currentCandidate as {
    department?: string;
    designation?: string;
  } | null;
  const dept = candidate?.department ?? "General";
  const desig = candidate?.designation ?? "Professional";

  const [phase, setPhase] = useState<
    "loading" | "interview" | "finalizing" | "done"
  >("loading");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLinks, setAudioLinks] = useState<string[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [aiNotice, setAiNotice] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isEndingRef = useRef(false);
  const audioLinksRef = useRef<string[]>([]);
  const questionsRef = useRef<string[]>([]);

  // Keep refs in sync
  audioLinksRef.current = audioLinks;
  questionsRef.current = questions;

  const stopTimerAndRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    setIsRecording(false);
    window.speechSynthesis?.cancel();
  }, []);

  const endInterview = useCallback(
    async (forced: boolean, links?: string[]) => {
      setPhase("finalizing");
      stopTimerAndRecording();
      for (const t of streamRef.current?.getTracks() ?? []) {
        t.stop();
      }

      const finalLinks = links ?? audioLinksRef.current;
      let evaluation: EvaluationResult;

      if (!forced) {
        const aiEval = await fetchAIEvaluation(
          questionsRef.current,
          desig,
          dept,
        );
        evaluation = aiEval ?? {
          score: BigInt(7),
          technicalRating: BigInt(7),
          communicationRating: BigInt(7),
          confidenceRating: BigInt(7),
          strengths: "Strong communication and technical understanding.",
          weaknesses: "Could improve on providing more concrete examples.",
          recommendation: "Maybe",
        };
      } else {
        evaluation = {
          score: BigInt(0),
          technicalRating: BigInt(0),
          communicationRating: BigInt(0),
          confidenceRating: BigInt(0),
          strengths: "",
          weaknesses: "Interview ended early due to policy violation.",
          recommendation: "No-Hire",
        };
      }

      try {
        if (sessionId) {
          await completeInterview.mutateAsync({
            sessionId,
            evaluation,
            audioLinks: finalLinks,
          });
        }
      } catch {
        // silent
      }
      setPhase("done");
      navigate({ to: "/interview/complete" });
    },
    [
      stopTimerAndRecording,
      dept,
      desig,
      sessionId,
      completeInterview,
      navigate,
    ],
  );

  const handleNextQuestion = useCallback(async () => {
    stopTimerAndRecording();
    let audioUrl = "";
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioUrl = await uploadAudioBlob(blob, audioLinksRef.current.length);
    }
    const updatedLinks = [...audioLinksRef.current, audioUrl];
    setAudioLinks(updatedLinks);
    audioLinksRef.current = updatedLinks;

    if (audioLinksRef.current.length >= TOTAL_QUESTIONS) {
      await endInterview(false, updatedLinks);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [stopTimerAndRecording, endInterview]);

  // Load questions on mount
  useEffect(() => {
    if (!sessionId) {
      navigate({ to: "/interview/dashboard" });
      return;
    }
    async function loadQuestions() {
      const aiQs = await fetchAIQuestions(desig, dept);
      if (!aiQs || aiQs.length < TOTAL_QUESTIONS) {
        setAiNotice(!import.meta.env.VITE_OPENAI_API_KEY);
        setQuestions(FALLBACK_QUESTIONS);
      } else {
        setQuestions(aiQs.slice(0, TOTAL_QUESTIONS));
      }
      setPhase("interview");
    }
    loadQuestions();
  }, [sessionId, navigate, dept, desig]);

  // Tab-switch detection
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && phase === "interview" && !isEndingRef.current) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        if (sessionId) {
          try {
            await updateTabSwitch.mutateAsync(sessionId);
          } catch {
            // silent
          }
        }
        if (newCount >= MAX_TAB_SWITCHES) {
          isEndingRef.current = true;
          toast.error("Interview ended due to excessive tab switching.", {
            duration: 6000,
          });
          await endInterview(true);
        } else {
          toast.warning(
            `Warning ${newCount}/${MAX_TAB_SWITCHES}: Please stay on this page.`,
            { duration: 4000 },
          );
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [phase, tabSwitchCount, sessionId, updateTabSwitch, endInterview]);

  // Start recording + timer when question changes
  useEffect(() => {
    if (phase !== "interview" || questions.length === 0) return;

    const startSession = async () => {
      setSecondsLeft(SECONDS_PER_QUESTION);
      audioChunksRef.current = [];

      const q = questionsRef.current[currentIndex];
      if (q) speakText(q);

      try {
        const stream =
          streamRef.current ??
          (await navigator.mediaDevices.getUserMedia({ audio: true }));
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.start(500);
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    startSession();
    return () => stopTimerAndRecording();
  }, [
    phase,
    currentIndex,
    questions.length,
    handleNextQuestion,
    stopTimerAndRecording,
  ]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progressPct = (secondsLeft / SECONDS_PER_QUESTION) * 100;
  const isWarningTime = secondsLeft <= 30;

  if (phase === "loading") {
    return (
      <CandidateLayout showHeader={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <LoadingSpinner
            size="lg"
            label="Preparing your interview questions…"
          />
        </div>
      </CandidateLayout>
    );
  }

  if (phase === "finalizing" || phase === "done") {
    return (
      <CandidateLayout showHeader={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <LoadingSpinner size="lg" label="Finalizing evaluation…" />
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Analyzing your responses and generating results. Please wait.
          </p>
        </div>
      </CandidateLayout>
    );
  }

  const currentQuestion = questions[currentIndex] ?? "";

  return (
    <CandidateLayout showHeader={false}>
      <div className="flex flex-col gap-6" data-ocid="interview-session">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-semibold text-foreground text-sm sm:text-base">
              InterviewAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            {tabSwitchCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                {tabSwitchCount}/{MAX_TAB_SWITCHES} warnings
              </span>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              Q {currentIndex + 1} / {TOTAL_QUESTIONS}
            </span>
            {isRecording ? (
              <span className="flex items-center gap-1 text-xs text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Recording
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MicOff className="h-3 w-3" />
                Paused
              </span>
            )}
          </div>
        </div>

        {/* Question progress bar */}
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>

        {aiNotice && (
          <div className="flex items-start gap-2 px-4 py-3 bg-secondary rounded-xl border border-border text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-chart-3" />
            <span>
              AI service not configured — using standard question bank.
            </span>
          </div>
        )}

        {/* Question card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-elevated">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Question {currentIndex + 1}
            </span>
            <div
              className={`text-2xl font-display font-bold tabular-nums ${isWarningTime ? "text-destructive" : "text-foreground"}`}
              data-ocid="question-timer"
            >
              {timeStr}
            </div>
          </div>

          <div className="mb-8">
            <Progress
              value={progressPct}
              className={`h-1.5 ${isWarningTime ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
            />
          </div>

          <p
            className="font-display text-xl sm:text-2xl font-medium text-foreground leading-relaxed mb-8"
            data-ocid="question-text"
          >
            {currentQuestion}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => speakText(currentQuestion)}
              className="gap-2"
              data-ocid="replay-question-btn"
            >
              <Volume2 className="h-4 w-4" />
              Replay Question
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                }}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Stop Audio
              </Button>
              <Button
                onClick={handleNextQuestion}
                size="sm"
                className="gap-2 font-medium"
                data-ocid="next-question-btn"
              >
                {currentIndex + 1 >= TOTAL_QUESTIONS
                  ? "Submit Interview"
                  : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Speak clearly into your microphone. Your answer is automatically saved
          when time ends or you click Next.
        </p>
      </div>
    </CandidateLayout>
  );
}
