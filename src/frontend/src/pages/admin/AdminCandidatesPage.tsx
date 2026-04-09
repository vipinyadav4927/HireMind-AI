import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  Copy,
  KeyRound,
  Link2,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { EmptyState } from "../../components/shared/EmptyState";
import {
  useCandidates,
  useCreateCandidate,
  useSyncFromSheets,
} from "../../hooks/useCandidates";
import type { Candidate } from "../../types";

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
];

interface AddCandidateForm {
  email: string;
  name: string;
  department: string;
  designation: string;
}

interface CreatedInfo {
  candidate: Candidate;
  interviewLink: string;
}

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

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label ?? "value"}`}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-smooth"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CreatedModal({
  info,
  onClose,
}: {
  info: CreatedInfo;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <DialogTitle className="font-display font-semibold text-foreground">
              Candidate Created
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Share these credentials with{" "}
            <strong className="text-foreground">{info.candidate.name}</strong>{" "}
            to begin their interview.
          </p>

          {/* Passcode */}
          <div className="rounded-xl border border-border bg-secondary/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <KeyRound className="h-3.5 w-3.5" />
              Passcode
            </div>
            <div className="flex items-center justify-between gap-3">
              <code className="font-mono text-lg font-bold text-primary tracking-widest">
                {info.candidate.passcode}
              </code>
              <CopyButton text={info.candidate.passcode} label="passcode" />
            </div>
          </div>

          {/* Interview link */}
          <div className="rounded-xl border border-border bg-secondary/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Link2 className="h-3.5 w-3.5" />
              Interview Link
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-foreground font-mono break-all leading-relaxed truncate min-w-0">
                {info.interviewLink}
              </span>
              <CopyButton text={info.interviewLink} label="link" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 border border-border">
            ⚠️ Save this passcode now — it won't be shown again. Send the link
            and passcode to the candidate separately.
          </p>

          <Button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="created-modal-close"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ViewPasscodeModal({
  candidate,
  onClose,
}: {
  candidate: Candidate;
  onClose: () => void;
}) {
  const interviewLink = `${window.location.origin}/interview/login?token=${candidate.id}`;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="font-display font-semibold text-foreground">
            Candidate Credentials
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              {candidate.name}
            </p>
            <p className="text-xs text-muted-foreground">{candidate.email}</p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <KeyRound className="h-3.5 w-3.5" />
              Passcode
            </div>
            <div className="flex items-center justify-between gap-3">
              <code className="font-mono text-lg font-bold text-primary tracking-widest">
                {candidate.passcode}
              </code>
              <CopyButton text={candidate.passcode} label="passcode" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Link2 className="h-3.5 w-3.5" />
              Interview Link
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-foreground font-mono break-all leading-relaxed truncate min-w-0">
                {interviewLink}
              </span>
              <CopyButton text={interviewLink} label="link" />
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full"
            data-ocid="view-passcode-close"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddCandidateDrawer({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (info: CreatedInfo) => void;
}) {
  const { mutate: createCandidate, isPending } = useCreateCandidate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AddCandidateForm>({
    defaultValues: { email: "", name: "", department: "", designation: "" },
  });

  const onSubmit = (data: AddCandidateForm) => {
    createCandidate(data, {
      onSuccess: (candidate) => {
        const interviewLink = `${window.location.origin}/interview/login?token=${candidate.id}`;
        reset();
        onCreated({ candidate, interviewLink });
      },
      onError: (err: Error) => {
        toast.error("Failed to create candidate", { description: err.message });
      },
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border max-w-lg mx-4 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display font-semibold text-foreground">
              Add Candidate
            </DialogTitle>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Fill in candidate details. A unique passcode and interview link will
            be generated.
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-1 px-1">
          <form
            id="add-candidate-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 mt-2 pb-2"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label
                  htmlFor="cand-name"
                  className="text-sm font-medium text-foreground"
                >
                  Full Name
                </Label>
                <Input
                  id="cand-name"
                  placeholder="Jane Smith"
                  data-ocid="add-candidate-name"
                  className="bg-secondary border-input focus:border-ring"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label
                  htmlFor="cand-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="cand-email"
                  type="email"
                  placeholder="jane@company.com"
                  data-ocid="add-candidate-email"
                  className="bg-secondary border-input focus:border-ring"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  Department
                </Label>
                <Controller
                  name="department"
                  control={control}
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className="bg-secondary border-input focus:border-ring"
                        data-ocid="add-candidate-department"
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department && (
                  <p className="text-xs text-red-400">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="cand-designation"
                  className="text-sm font-medium text-foreground"
                >
                  Designation / Role
                </Label>
                <Input
                  id="cand-designation"
                  placeholder="Senior Engineer"
                  data-ocid="add-candidate-designation"
                  className="bg-secondary border-input focus:border-ring"
                  {...register("designation", {
                    required: "Designation is required",
                  })}
                />
                {errors.designation && (
                  <p className="text-xs text-red-400">
                    {errors.designation.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-candidate-form"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isPending}
            data-ocid="add-candidate-submit"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Creating…
              </span>
            ) : (
              "Create Candidate"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCandidatesPage() {
  const { data: candidates, isLoading } = useCandidates();
  const { mutate: syncFromSheets, isPending: isSyncing } = useSyncFromSheets();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<CreatedInfo | null>(null);
  const [viewPasscodeFor, setViewPasscodeFor] = useState<Candidate | null>(
    null,
  );

  const handleSync = useCallback(() => {
    syncFromSheets([], {
      onSuccess: (count) => {
        toast.success("Sync complete", {
          description: `${count} candidate(s) synced from Google Sheets.`,
        });
      },
      onError: (err: Error) => {
        toast.error("Sync failed", { description: err.message });
      },
    });
  }, [syncFromSheets]);

  const filtered = (candidates ?? []).filter((c) => {
    const matchSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.designation.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">
              Candidates
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {candidates
                ? `${candidates.length} candidate${candidates.length !== 1 ? "s" : ""} total`
                : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="gap-2 text-muted-foreground hover:text-foreground border border-border hover:border-primary/40"
              data-ocid="sync-sheets-btn"
            >
              <RefreshCw
                className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing…" : "Sync Sheets"}
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              onClick={() => setShowAddDrawer(true)}
              data-ocid="open-add-candidate-btn"
            >
              <Plus className="h-4 w-4" />
              Add Candidate
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, email, department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="candidates-search"
              className="pl-10 bg-card border-border focus:border-ring max-w-sm"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger
              className="w-full sm:w-40 bg-card border-border"
              data-ocid="candidates-status-filter"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="InProgress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Candidates table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={
                search || filterStatus !== "all"
                  ? "No matching candidates"
                  : "No candidates yet"
              }
              description={
                search || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Add your first candidate to get started with AI interviews."
              }
              action={
                !search && filterStatus === "all"
                  ? {
                      label: "Add Candidate",
                      onClick: () => setShowAddDrawer(true),
                      "data-ocid": "empty-add-candidate",
                    }
                  : undefined
              }
              data-ocid="candidates-empty-state"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Candidate
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Department
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Designation
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right hidden md:table-cell">
                      Score
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      data-ocid="candidate-row"
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {c.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {c.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {c.designation}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{statusBadge(c.status)}</td>
                      <td className="py-3.5 px-4 text-right hidden md:table-cell">
                        <span className="text-sm font-mono text-foreground tabular-nums">
                          {c.score != null ? `${c.score}/10` : "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            aria-label="View passcode"
                            title="View credentials"
                            data-ocid="view-passcode-btn"
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-smooth"
                            onClick={() => setViewPasscodeFor(c)}
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                              Credentials
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label="Copy interview link"
                            title="Copy interview link"
                            data-ocid="copy-link-btn"
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-smooth"
                            onClick={async () => {
                              const link = `${window.location.origin}/interview/login?token=${c.id}`;
                              await navigator.clipboard.writeText(link);
                              toast.success("Interview link copied!");
                            }}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Link</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Result count */}
        {!isLoading && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {filtered.length} of {candidates?.length ?? 0} candidate(s)
          </p>
        )}
      </div>

      {/* Add Candidate Modal */}
      {showAddDrawer && (
        <AddCandidateDrawer
          onClose={() => setShowAddDrawer(false)}
          onCreated={(info) => {
            setShowAddDrawer(false);
            setCreatedInfo(info);
          }}
        />
      )}

      {/* Created confirmation modal */}
      {createdInfo && (
        <CreatedModal info={createdInfo} onClose={() => setCreatedInfo(null)} />
      )}

      {/* View passcode modal */}
      {viewPasscodeFor && (
        <ViewPasscodeModal
          candidate={viewPasscodeFor}
          onClose={() => setViewPasscodeFor(null)}
        />
      )}
    </AdminLayout>
  );
}
