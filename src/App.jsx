import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ServerWakingNotice } from './components/ui/ServerWakingNotice';

// Central QueryClient instance with warm caching defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes cache validity
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Code-split route bundles via React.lazy
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const ExplorePage = lazy(() => import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })));
const FrameDetailPage = lazy(() => import('./pages/FrameDetailPage').then((m) => ({ default: m.FrameDetailPage })));
const WanderPage = lazy(() => import('./pages/WanderPage').then((m) => ({ default: m.WanderPage })));
const ThoughtsPage = lazy(() => import('./pages/ThoughtsPage').then((m) => ({ default: m.ThoughtsPage })));
const MomentPage = lazy(() => import('./pages/MomentPage').then((m) => ({ default: m.MomentPage })));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage').then((m) => ({ default: m.CollectionsPage })));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage').then((m) => ({ default: m.CollectionDetailPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const UploadPage = lazy(() => import('./pages/UploadPage').then((m) => ({ default: m.UploadPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const PhotographerPage = lazy(() => import('./pages/PhotographerPage').then((m) => ({ default: m.PhotographerPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-muted">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      <span className="text-2xs font-mono uppercase tracking-widest text-muted">
        Loading View...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/frame/:id" element={<FrameDetailPage />} />
                    <Route path="/wander" element={<WanderPage />} />
                    <Route path="/thoughts" element={<ThoughtsPage />} />
                    <Route path="/moment" element={<MomentPage />} />
                    <Route path="/collections" element={<CollectionsPage />} />
                    <Route path="/collections/:id" element={<CollectionDetailPage />} />
                    <Route path="/u/:username" element={<ProfilePage />} />
                    <Route
                      path="/upload"
                      element={
                        <ProtectedRoute>
                          <UploadPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/photographer" element={<PhotographerPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
                <ServerWakingNotice />
              </Layout>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
