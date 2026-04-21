import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  Lock,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CandidateLayout } from "../../components/layouts/CandidateLayout";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import {
  useCandidateByToken,
  useCandidateLogin,
} from "../../hooks/useCandidates";
import { useCandidateAuthStore } from "../../stores/candidateAuthStore";

export default function CandidateLoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { id?: string; token?: string };
  const interviewId = search?.id ?? null;
  const token = search?.token ?? null;

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const { isAuthenticated } = useCandidateAuthStore();
  const { setCandidateAuth, setCurrentCandidate } = useCandidateAuthStore();
  const { data: tokenCandidate, isLoading: isLookingUp } = useCandidateByToken(token);
  const loginMutation = useCandidateLogin();

  // OTP functions
  const sendOTP = async () => {
    if (!interviewId || !email) return;
    setIsSendingOTP(true);
    try {
      const res = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendOTP', email, interviewId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('OTP sent to email!');
        setStep('otp');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Send OTP failed');
    }
    setIsSendingOTP(false);
  };

  const verifyOTP = async () => {
    if (!interviewId || !email || !otp) return;
    setIsVerifyingOTP(true);
    try {
      const res = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyOTP', email, otp, interviewId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('OTP verified!');
        navigate({ to: '/interview/dashboard' });
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Verify OTP failed');
    }
    setIsVerifyingOTP(false);
  };

  // Already authenticated → go to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/interview/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  // Prefill email from token lookup
  useEffect(() => {
    if (tokenCandidate) {
      const c = tokenCandidate as { email?: string; name?: string; status?: string } | null;
      if (c?.email) setEmail(c.email);
    }
  }, [tokenCandidate]);

  const candidate = tokenCandidate as {
    email?: string;
    name?: string;
    status?: string;
  } | null;

  const isCompleted = candidate?.status === "Completed";

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !interviewId) return;
    sendOTP();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOTP();
  };

  // Fallback passcode if no interviewId
  const handlePasscodeLogin = async (e: React.FormEvent) => {
    // old passcode logic...
  };

  return (
    <CandidateLayout showHeader={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 shadow-elevated">
            <BrainCircuit className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              InterviewAI
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Secure Candidate Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-elevated p-8"
          data-ocid="candidate-login-card"
        >
          {isLookingUp && token ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <LoadingSpinner
                size="md"
                label="Looking up your interview link…"
              />
            </div>
          ) : isCompleted ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary border border-border">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Interview Already Completed
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  You have already completed your interview. Results have been
                  submitted to our team.
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Status: Completed
              </Badge>
            </div>
          ) : (
            <>
              {/* Candidate preview (token-based) */}
              {candidate && !isCompleted && (
                <div className="mb-6 p-4 rounded-xl bg-primary/8 border border-primary/20">
                  <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
                    Welcome back
                  </p>
                  <p className="font-display font-semibold text-foreground text-lg">
                    {candidate.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {candidate.email}
                  </p>
                </div>
              )}

              {!candidate && !token && (
                <div className="mb-6 text-center">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Candidate Login
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your credentials to begin
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
                data-ocid="login-form"
              >
                {/* Email field — only show if no token candidate */}
                {!candidate && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                        autoComplete="email"
                        data-ocid="login-email-input"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="passcode" className="text-sm font-medium">
                    Access Passcode
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="passcode"
                      type="password"
                      placeholder="Enter your passcode"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="pl-9"
                      required
                      autoComplete="current-password"
                      data-ocid="login-passcode-input"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Passcode provided by your recruiter
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-1 h-11 font-medium gap-2"
                  disabled={
                    loginMutation.isPending ||
                    !passcode.trim() ||
                    (!candidate && !email.trim())
                  }
                  data-ocid="login-submit-btn"
                >
                  {loginMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Access Interview
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </CandidateLayout>
  );
}
