import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useAdminAuthStore } from "./stores/adminAuthStore";
import { useCandidateAuthStore } from "./stores/candidateAuthStore";

// Lazy-loaded page imports
import { Suspense, lazy } from "react";
import { PageLoader } from "./components/shared/LoadingSpinner";

const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage"),
);
const AdminCandidatesPage = lazy(
  () => import("./pages/admin/AdminCandidatesPage"),
);
const AdminAnalyticsPage = lazy(
  () => import("./pages/admin/AdminAnalyticsPage"),
);
const CandidateLoginPage = lazy(
  () => import("./pages/candidate/CandidateLoginPage"),
);
const CandidateDashboardPage = lazy(
  () => import("./pages/candidate/CandidateDashboardPage"),
);
const InterviewPage = lazy(() => import("./pages/candidate/InterviewPage"));
const InterviewCompletePage = lazy(
  () => import("./pages/candidate/InterviewCompletePage"),
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// Admin guard component
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAdminAuthStore();
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  return <>{children}</>;
}

// Candidate guard component
function CandidateGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useCandidateAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/interview/login" />;
  }
  return <>{children}</>;
}

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/interview/login" />,
});

// ── Admin routes ──────────────────────────────────────────────────────────────
const adminRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => <Outlet />,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/login",
  component: () => (
    <Wrap>
      <AdminLoginPage />
    </Wrap>
  ),
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/",
  component: () => (
    <AdminGuard>
      <Wrap>
        <AdminDashboardPage />
      </Wrap>
    </AdminGuard>
  ),
});

const adminCandidatesRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/candidates",
  component: () => (
    <AdminGuard>
      <Wrap>
        <AdminCandidatesPage />
      </Wrap>
    </AdminGuard>
  ),
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: "/analytics",
  component: () => (
    <AdminGuard>
      <Wrap>
        <AdminAnalyticsPage />
      </Wrap>
    </AdminGuard>
  ),
});

// ── Candidate / Interview routes ──────────────────────────────────────────────
const interviewRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/interview",
  component: () => <Outlet />,
});

const candidateLoginRoute = createRoute({
  getParentRoute: () => interviewRootRoute,
  path: "/login",
  component: () => (
    <Wrap>
      <CandidateLoginPage />
    </Wrap>
  ),
});

const candidateDashboardRoute = createRoute({
  getParentRoute: () => interviewRootRoute,
  path: "/dashboard",
  component: () => (
    <CandidateGuard>
      <Wrap>
        <CandidateDashboardPage />
      </Wrap>
    </CandidateGuard>
  ),
});

const interviewSessionRoute = createRoute({
  getParentRoute: () => interviewRootRoute,
  path: "/session",
  component: () => (
    <CandidateGuard>
      <Wrap>
        <InterviewPage />
      </Wrap>
    </CandidateGuard>
  ),
});

const interviewCompleteRoute = createRoute({
  getParentRoute: () => interviewRootRoute,
  path: "/complete",
  component: () => (
    <CandidateGuard>
      <Wrap>
        <InterviewCompletePage />
      </Wrap>
    </CandidateGuard>
  ),
});

// ── Not found ─────────────────────────────────────────────────────────────────
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => (
    <Wrap>
      <NotFoundPage />
    </Wrap>
  ),
});

// ── Route tree ────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRootRoute.addChildren([
    adminLoginRoute,
    adminIndexRoute,
    adminCandidatesRoute,
    adminAnalyticsRoute,
  ]),
  interviewRootRoute.addChildren([
    candidateLoginRoute,
    candidateDashboardRoute,
    interviewSessionRoute,
    interviewCompleteRoute,
  ]),
  notFoundRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
