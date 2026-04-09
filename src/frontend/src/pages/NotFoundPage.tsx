import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { BrainCircuit, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-6">
        <BrainCircuit className="h-8 w-8 text-primary" />
      </div>
      <h1 className="font-display text-4xl font-bold text-foreground mb-2">
        404
      </h1>
      <p className="text-lg text-muted-foreground mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link to="/interview/login">
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Link>
      </Button>
    </div>
  );
}
