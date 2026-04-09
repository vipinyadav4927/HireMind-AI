import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@tanstack/react-router";
import { BrainCircuit, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAdminLogin } from "../../hooks/useAdminAuth";
import { useBackendActor } from "../../hooks/useBackendActor";
import { useAdminAuthStore } from "../../stores/adminAuthStore";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { mutate: login, isPending } = useAdminLogin();
  const { isAdminAuthenticated } = useAdminAuthStore();
  const { actor, isFetching: actorFetching } = useBackendActor();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "vipinyadav4926@gmail.com",
      password: "1234",
    },
  });

  if (isAdminAuthenticated) {
    router.navigate({ to: "/admin" });
    return null;
  }

  const onSubmit = (data: LoginFormValues) => {
    if (!actor || actorFetching) {
      toast.error("Service is connecting, please try again in a moment");
      return;
    }
    login(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          toast.success("Welcome back!", {
            description: "Redirecting to dashboard…",
          });
          router.navigate({ to: "/admin" });
        },
        onError: (err: Error) => {
          toast.error("Login failed", {
            description:
              err.message ?? "Invalid credentials. Please try again.",
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/6 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-primary/4 blur-[100px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 shadow-elevated">
            <BrainCircuit className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">
              InterviewAI
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Admin Panel — Secure Access
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-elevated p-8">
          <div className="mb-6">
            <h2 className="font-display font-semibold text-lg text-foreground">
              Sign in
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your admin credentials to continue
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  autoComplete="email"
                  data-ocid="admin-login-email"
                  className="pl-10 bg-secondary border-input focus:border-ring transition-colors"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  data-ocid="admin-login-password"
                  className="pl-10 pr-10 bg-secondary border-input focus:border-ring transition-colors"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 4,
                      message: "At least 4 characters required",
                    },
                  })}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={0}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-smooth shadow-card mt-2"
              disabled={isPending}
              data-ocid="admin-login-submit"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in to Admin Panel"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} HireMind AI. Authorised personnel only.
        </p>
      </div>
    </div>
  );
}
