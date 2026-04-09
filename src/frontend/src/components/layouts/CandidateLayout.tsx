import { BrainCircuit } from "lucide-react";

interface CandidateLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export function CandidateLayout({
  children,
  showHeader = true,
}: CandidateLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && (
        <header className="border-b border-border bg-card shadow-subtle">
          <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </div>
              <span className="font-display font-semibold text-foreground tracking-tight">
                InterviewAI
              </span>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Secure Interview Portal
            </span>
          </div>
        </header>
      )}

      <main className="flex-1 w-full mx-auto max-w-[800px] px-4 sm:px-6 py-8 md:py-12">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/40 py-4">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
