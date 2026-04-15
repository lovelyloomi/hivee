import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

// ── Lazy-loaded pages ──────────────────────────────────────────────────────────
const Index           = lazy(() => import("./pages/Index"));
const Swipe           = lazy(() => import("./pages/Swipe"));
const UserProfile     = lazy(() => import("./pages/UserProfile"));
const Matches         = lazy(() => import("./pages/Matches"));
const Chat            = lazy(() => import("./pages/Chat"));
const Profile         = lazy(() => import("./pages/Profile"));
const Search          = lazy(() => import("./pages/Search"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Works           = lazy(() => import("./pages/Works"));
const Favorites       = lazy(() => import("./pages/Favorites"));
const Opportunities   = lazy(() => import("./pages/Opportunities"));
const BlockedUsers    = lazy(() => import("./pages/BlockedUsers"));
const Auth            = lazy(() => import("./pages/Auth"));
const Onboarding      = lazy(() => import("./pages/Onboarding"));
const Admin           = lazy(() => import("./pages/Admin"));
const PrivacySettingsPage = lazy(() =>
  import("./pages/PrivacySettings").then((m) => ({ default: m.PrivacySettingsPage }))
);
const ForgotPassword  = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword   = lazy(() => import("./pages/ResetPassword"));
const ProfileSetup    = lazy(() => import("./pages/ProfileSetup"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const NotFound        = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <OnboardingTutorial />
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/"                      element={<Index />} />
                    <Route path="/find"                  element={<Swipe />} />
                    <Route path="/search"                element={<Search />} />
                    <Route path="/recommendations"      element={<Recommendations />} />
                    <Route path="/works"                 element={<Works />} />
                    <Route path="/favorites"             element={<Favorites />} />
                    <Route path="/matches"               element={<Matches />} />
                    <Route path="/opportunities"         element={<Opportunities />} />
                    <Route path="/auth"                  element={<Auth />} />
                    <Route path="/forgot-password"      element={<ForgotPassword />} />
                    <Route path="/reset-password"       element={<ResetPassword />} />
                    <Route path="/profile-setup"        element={<ProfileSetup />} />
                    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                    <Route path="/chat/:matchId"        element={<Chat />} />
                    <Route path="/profile"               element={<Profile />} />
                    <Route path="/profile/:userId"      element={<UserProfile />} />
                    <Route path="/blocked-users"        element={<BlockedUsers />} />
                    <Route path="/admin"                 element={<Admin />} />
                    <Route path="/privacy-settings"     element={<PrivacySettingsPage />} />
                    <Route path="/onboarding"            element={<Onboarding />} />
                    <Route path="*"                      element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
