import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LeadProvider, useLead } from './contexts/LeadContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const LeadList = React.lazy(() => import('./pages/LeadList'));
const LeadForm = React.lazy(() => import('./pages/LeadForm'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Kanban = React.lazy(() => import('./pages/Kanban'));
const SetupOrganization = React.lazy(() => import('./pages/SetupOrganization'));
const Team = React.lazy(() => import('./pages/Team'));
const JoinOrganization = React.lazy(() => import('./pages/JoinOrganization'));
const Settings = React.lazy(() => import('./pages/Settings'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const PerformanceReports = React.lazy(() => import('./pages/PerformanceReports'));
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session, isLoading } = useLead();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const RequireProfile: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userProfile, isLoading } = useLead();

    if (isLoading) return null;

    if (!userProfile) {
        return <Navigate to="/setup" replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    const { session, userProfile, isLoading } = useLead();

    if (isLoading) return null;

    return (
        <Routes>
            <Route
                path="/setup"
                element={
                    session
                        ? (userProfile ? <Navigate to="/" replace /> : <SetupOrganization />)
                        : <Navigate to="/login" replace />
                }
            />
            <Route path="/join" element={<JoinOrganization />} />
            <Route
                path="/login"
                element={
                    session
                        ? <Navigate to={new URLSearchParams(window.location.search).get('redirectTo') || "/"} replace />
                        : <Onboarding />
                }
            />
            <Route path="/" element={
                <RequireAuth>
                    <RequireProfile>
                        <Layout />
                    </RequireProfile>
                </RequireAuth>
            }>
                <Route index element={<LeadList />} />
                <Route path="kanban" element={<Kanban />} />
                <Route path="add" element={<LeadForm />} />
                <Route path="edit/:id" element={<LeadForm />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="team" element={<Team />} />
                <Route path="settings" element={<Settings />} />
                <Route path="reports" element={<PerformanceReports />} />
                <Route
                    path="admin"
                    element={
                        userProfile?.is_super_admin
                            ? <AdminPanel />
                            : <Navigate to="/" replace />
                    }
                />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <LeadProvider>
                    <BrowserRouter>
                        <React.Suspense fallback={
                            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] animate-pulse">Carregando Módulos</p>
                            </div>
                        }>
                            <AppRoutes />
                        </React.Suspense>
                        <Toaster position="top-center" richColors />
                    </BrowserRouter>
                </LeadProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
};

export default App;
