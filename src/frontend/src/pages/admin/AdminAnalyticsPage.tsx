import { AdminLayout } from "@/components/layouts/AdminLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidates } from "@/hooks/useCandidates";
import { useDepartmentStats, useStats } from "@/hooks/useStats";
import type { Candidate, DepartmentStat, Stats } from "@/types/index";
import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Recharts needs explicit color strings — not oklch() CSS vars
const CHART_COLORS = [
  "hsl(187 58% 50%)", // chart-1: teal
  "hsl(150 42% 47%)", // chart-2: green
  "hsl(85 36% 54%)", // chart-3: olive-yellow
  "hsl(305 36% 47%)", // chart-4: purple
  "hsl(50 42% 54%)", // chart-5: amber
];

const STATUS_COLORS: Record<string, string> = {
  Pending: CHART_COLORS[4],
  Completed: CHART_COLORS[0],
  InProgress: CHART_COLORS[1],
};

const SCORE_RANGE_COLORS = [CHART_COLORS[3], CHART_COLORS[2], CHART_COLORS[0]];

const GRID_STROKE = "rgba(255,255,255,0.06)";
const TICK_FILL = "rgba(255,255,255,0.38)";
const CURSOR_FILL = "rgba(255,255,255,0.04)";

// --- Custom Tooltips ---
function DeptTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { count: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-primary">
        Avg Score: <span className="font-bold">{payload[0].value}</span>
      </p>
      <p className="text-muted-foreground">
        Candidates:{" "}
        <span className="font-semibold text-foreground">
          {payload[0].payload.count}
        </span>
      </p>
    </div>
  );
}

function DistTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Candidates:{" "}
        <span className="font-bold text-foreground">{payload[0].value}</span>
      </p>
    </div>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-sm">
      <p className="font-medium text-foreground">{payload[0].name}</p>
      <p className="text-muted-foreground">
        Count:{" "}
        <span className="font-bold text-foreground">{payload[0].value}</span>
      </p>
    </div>
  );
}

// --- Skeleton ---
function ChartCardSkeleton({
  title,
  subtitle,
}: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-display font-semibold text-foreground text-base">
        {title}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 mb-5">{subtitle}</p>
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}

// --- Data helpers ---
function buildScoreDistribution(candidates: Candidate[]) {
  const completed = candidates.filter(
    (c) => c.status === "Completed" && c.score != null,
  );
  return [
    { name: "Needs Work", range: "0–50", min: 0, max: 50 },
    { name: "Good", range: "51–75", min: 51, max: 75 },
    { name: "Excellent", range: "76–100", min: 76, max: 100 },
  ].map((r) => ({
    name: `${r.name} (${r.range})`,
    count: completed.filter((c) => {
      const s = Number(c.score);
      return s >= r.min && s <= r.max;
    }).length,
  }));
}

function buildStatusData(stats: Stats) {
  return [
    { name: "Pending", value: Number(stats.pending) },
    { name: "Completed", value: Number(stats.completed) },
    { name: "In Progress", value: Number(stats.inProgress) },
  ].filter((d) => d.value > 0);
}

function getTopPerformers(candidates: Candidate[], limit = 10) {
  return candidates
    .filter((c) => c.status === "Completed" && c.score != null)
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, limit);
}

// --- Score Badge ---
function ScoreBadge({ score }: { score: number }) {
  // excellent ≥76: teal  |  good 51-75: olive/green  |  needs work <51: purple
  const cls =
    score >= 76
      ? "border-teal-500/30 bg-teal-500/10 text-teal-400"
      : score >= 51
        ? "border-lime-500/30 bg-lime-500/10 text-lime-400"
        : "border-purple-500/35 bg-purple-500/10 text-purple-400";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tabular-nums ${cls}`}
    >
      {score}
    </span>
  );
}

// ====== Main Page ======
export default function AdminAnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: rawDeptStats, isLoading: deptLoading } = useDepartmentStats();
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();

  const isAnyLoading = statsLoading || deptLoading || candidatesLoading;

  const deptChartData = (rawDeptStats ?? []).map((d: DepartmentStat) => ({
    department: d.department,
    avgScore: Number(d.avgScore),
    count: Number(d.count),
  }));

  const scoreDistData = candidates
    ? buildScoreDistribution(candidates as Candidate[])
    : [];
  const statusData = stats ? buildStatusData(stats as Stats) : [];
  const topPerformers = candidates
    ? getTopPerformers(candidates as Candidate[])
    : [];
  const completedCount = stats ? Number((stats as Stats).completed) : 0;

  return (
    <AdminLayout>
      <div
        className="space-y-6 max-w-7xl mx-auto pb-8"
        data-ocid="analytics-page"
      >
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interview performance, scores, and department-wise insights
          </p>
        </div>

        {/* Stat cards */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(["total", "completed", "pending", "avg"] as const).map((k) => (
              <div
                key={k}
                className="rounded-xl border border-border bg-card p-5"
              >
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-8 w-14 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Candidates"
              value={stats ? Number((stats as Stats).total) : 0}
              icon={Users}
              data-ocid="stat-total"
            />
            <StatCard
              label="Completed"
              value={stats ? Number((stats as Stats).completed) : 0}
              icon={CheckCircle2}
              accent
              data-ocid="stat-completed"
            />
            <StatCard
              label="Pending"
              value={stats ? Number((stats as Stats).pending) : 0}
              icon={Clock}
              data-ocid="stat-pending"
            />
            <StatCard
              label="Avg Score"
              value={stats ? `${Number((stats as Stats).avgScore)}` : "—"}
              icon={TrendingUp}
              data-ocid="stat-avg-score"
            />
          </div>
        )}

        {/* Row 2: Dept performance + Status breakdown */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Department Performance */}
          {deptLoading ? (
            <div className="xl:col-span-2">
              <ChartCardSkeleton
                title="Department Performance"
                subtitle="Average interview score by department"
              />
            </div>
          ) : (
            <div
              className="xl:col-span-2 rounded-xl border border-border bg-card p-5"
              data-ocid="chart-dept-performance"
            >
              <h2 className="font-display font-semibold text-foreground text-base">
                Department Performance
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 mb-5">
                Average interview score by department
              </p>
              {deptChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] rounded-lg bg-muted/30 border border-border gap-2">
                  <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No department data yet
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={deptChartData}
                    margin={{ top: 20, right: 8, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID_STROKE}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="department"
                      tick={{ fontSize: 11, fill: TICK_FILL }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: TICK_FILL }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<DeptTooltip />}
                      cursor={{ fill: CURSOR_FILL }}
                    />
                    <Bar
                      dataKey="avgScore"
                      radius={[5, 5, 0, 0]}
                      label={{ position: "top", fontSize: 10, fill: TICK_FILL }}
                    >
                      {deptChartData.map(
                        (entry: { department: string }, idx: number) => (
                          <Cell
                            key={entry.department}
                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Status Breakdown */}
          {statsLoading ? (
            <ChartCardSkeleton
              title="Status Breakdown"
              subtitle="Candidate interview status distribution"
            />
          ) : (
            <div
              className="rounded-xl border border-border bg-card p-5"
              data-ocid="chart-status-breakdown"
            >
              <h2 className="font-display font-semibold text-foreground text-base">
                Status Breakdown
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 mb-5">
                Candidate interview status distribution
              </p>
              {statusData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">No data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="44%"
                      innerRadius={62}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={
                            STATUS_COLORS[entry.name.replace(" ", "")] ??
                            CHART_COLORS[idx]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ fontSize: 12, color: TICK_FILL }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

        {/* Score Distribution */}
        {candidatesLoading ? (
          <ChartCardSkeleton
            title="Score Distribution"
            subtitle="Number of completed candidates in each score band"
          />
        ) : (
          <div
            className="rounded-xl border border-border bg-card p-5"
            data-ocid="chart-score-distribution"
          >
            <h2 className="font-display font-semibold text-foreground text-base">
              Score Distribution
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-5">
              Number of completed candidates in each score band
            </p>
            {completedCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] rounded-lg bg-muted/30 border border-border gap-2">
                <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No completed interviews yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={scoreDistData}
                  margin={{ top: 20, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={GRID_STROKE}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: TICK_FILL }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: TICK_FILL }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<DistTooltip />}
                    cursor={{ fill: CURSOR_FILL }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={100}>
                    {scoreDistData.map(
                      (entry: { name: string }, idx: number) => (
                        <Cell
                          key={entry.name}
                          fill={
                            SCORE_RANGE_COLORS[idx % SCORE_RANGE_COLORS.length]
                          }
                        />
                      ),
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Top Performers */}
        <div
          className="rounded-xl border border-border bg-card overflow-hidden"
          data-ocid="top-performers-table"
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground text-base leading-tight">
                Top Performers
              </h2>
              <p className="text-xs text-muted-foreground">
                Top 10 completed candidates ranked by score
              </p>
            </div>
          </div>

          {candidatesLoading || isAnyLoading ? (
            <div className="p-5 space-y-3">
              {(["sk-a", "sk-b", "sk-c", "sk-d", "sk-e"] as const).map((k) => (
                <div key={k} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-md" />
                </div>
              ))}
            </div>
          ) : topPerformers.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No top performers yet"
              description="Completed candidate scores will appear here once interviews are done."
              data-ocid="top-performers-empty"
            />
          ) : (
            <>
              {/* Header row — desktop only */}
              <div className="hidden md:grid md:grid-cols-[2.5fr_1.5fr_1.5fr_90px] gap-4 px-5 py-2.5 bg-muted/30 border-b border-border">
                {["Candidate", "Department", "Designation", "Score"].map(
                  (col, i) => (
                    <span
                      key={col}
                      className={`text-[11px] font-medium text-muted-foreground uppercase tracking-wide ${i === 3 ? "text-right" : ""}`}
                    >
                      {col}
                    </span>
                  ),
                )}
              </div>

              <div className="divide-y divide-border">
                {topPerformers.map((c, idx) => (
                  <div
                    key={c.id}
                    data-ocid={`top-performer-row-${idx}`}
                    className="flex md:grid md:grid-cols-[2.5fr_1.5fr_1.5fr_90px] gap-3 md:gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors"
                  >
                    {/* Rank + name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tabular-nums">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate md:hidden">
                          {c.department} · {c.designation}
                        </p>
                      </div>
                    </div>
                    <span className="hidden md:block text-sm text-muted-foreground truncate">
                      {c.department}
                    </span>
                    <span className="hidden md:block text-sm text-muted-foreground truncate">
                      {c.designation}
                    </span>
                    <div className="flex md:justify-end shrink-0">
                      <ScoreBadge score={Number(c.score)} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
