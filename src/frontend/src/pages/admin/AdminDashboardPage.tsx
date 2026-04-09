import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { EmptyState } from "../../components/shared/EmptyState";
import { StatCard } from "../../components/shared/StatCard";
import { useCandidates } from "../../hooks/useCandidates";
import { useStats } from "../../hooks/useStats";
import type { Candidate } from "../../types";

function statusBadge(status: string) {
  if (status === "Completed")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
        Completed
      </Badge>
    );
  if (status === "InProgress")
    return (
      <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">
        In Progress
      </Badge>
    );
  return (
    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
      Pending
    </Badge>
  );
}

function RecentRow({ candidate }: { candidate: Candidate }) {
  return (
    <tr
      data-ocid="dashboard-recent-row"
      className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors"
    >
      <td className="py-3 px-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {candidate.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {candidate.email}
          </p>
        </div>
      </td>
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className="text-sm text-muted-foreground">
          {candidate.department}
        </span>
      </td>
      <td className="py-3 px-4 hidden md:table-cell">
        <span className="text-sm text-muted-foreground">
          {candidate.designation}
        </span>
      </td>
      <td className="py-3 px-4">{statusBadge(candidate.status)}</td>
      <td className="py-3 px-4 text-right hidden sm:table-cell">
        <span className="text-sm font-mono text-foreground tabular-nums">
          {candidate.score != null ? `${candidate.score}/10` : "—"}
        </span>
      </td>
    </tr>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();

  const recentCandidates = candidates
    ? [...candidates]
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
        .slice(0, 5)
    : [];

  const avgScore = stats ? Number(stats.avgScore) : 0;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">
              Recruitment Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time insights across all interview activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/candidates">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                data-ocid="dashboard-add-candidate-cta"
              >
                <Users className="h-4 w-4" />
                Manage Candidates
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Candidates"
              value={stats ? Number(stats.total) : 0}
              icon={Users}
              data-ocid="stat-total"
            />
            <StatCard
              label="Completed"
              value={stats ? Number(stats.completed) : 0}
              icon={CheckCircle2}
              accent
              data-ocid="stat-completed"
            />
            <StatCard
              label="Pending"
              value={stats ? Number(stats.pending) : 0}
              icon={Clock}
              data-ocid="stat-pending"
            />
            <StatCard
              label="Avg. Score"
              value={avgScore > 0 ? `${avgScore}/10` : "—"}
              icon={Trophy}
              trend={
                avgScore > 7
                  ? "Above benchmark"
                  : avgScore > 0
                    ? "Below benchmark"
                    : undefined
              }
              trendUp={avgScore > 7}
              data-ocid="stat-avg-score"
            />
          </div>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent candidates table */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-foreground">
                Recent Candidates
              </h2>
              <Link to="/admin/candidates">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5 text-xs"
                  data-ocid="dashboard-view-all-candidates"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            {candidatesLoading ? (
              <div className="p-5 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : recentCandidates.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No candidates yet"
                description="Add your first candidate to get started."
                action={{
                  label: "Add Candidate",
                  onClick: () => {},
                  "data-ocid": "dashboard-empty-add",
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Candidate
                      </th>
                      <th className="py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                        Dept.
                      </th>
                      <th className="py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                        Role
                      </th>
                      <th className="py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Status
                      </th>
                      <th className="py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right hidden sm:table-cell">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCandidates.map((c) => (
                      <RecentRow key={c.id} candidate={c} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick actions panel */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
              <h2 className="font-display font-semibold text-foreground">
                Quick Actions
              </h2>
              <div className="space-y-2.5">
                <Link to="/admin/candidates" className="block">
                  <div
                    data-ocid="dashboard-quick-candidates"
                    className="flex items-center gap-3 rounded-lg p-3 border border-border hover:border-primary/40 hover:bg-primary/5 transition-smooth cursor-pointer group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Candidates
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Add & manage candidates
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </Link>

                <Link to="/admin/analytics" className="block">
                  <div
                    data-ocid="dashboard-quick-analytics"
                    className="flex items-center gap-3 rounded-lg p-3 border border-border hover:border-primary/40 hover:bg-primary/5 transition-smooth cursor-pointer group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Analytics
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Department insights
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Status breakdown */}
            {stats && (
              <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
                <h2 className="font-display font-semibold text-foreground">
                  Pipeline Status
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      label: "Completed",
                      count: Number(stats.completed),
                      total: Number(stats.total),
                      color: "bg-emerald-400",
                    },
                    {
                      label: "In Progress",
                      count: Number(stats.inProgress),
                      total: Number(stats.total),
                      color: "bg-blue-400",
                    },
                    {
                      label: "Pending",
                      count: Number(stats.pending),
                      total: Number(stats.total),
                      color: "bg-amber-400",
                    },
                  ].map(({ label, count, total, color }) => {
                    const pct =
                      total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium text-foreground tabular-nums">
                            {count}
                            <span className="text-muted-foreground ml-1">
                              ({pct}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Refresh hint */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-start gap-3">
              <RefreshCw className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stats refresh every 30 seconds. Visit{" "}
                <Link
                  to="/admin/candidates"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Candidates
                </Link>{" "}
                to send the latest candidate data to Google Sheets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
