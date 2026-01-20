import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LeadProvider, useLead } from './contexts/LeadContext';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import LeadList from './pages/LeadList';
import LeadForm from './pages/LeadForm';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import SetupOrganization from './pages/SetupOrganization';
import Team from './pages/Team';
import JoinOrganization from './pages/JoinOrganization';
import Settings from './pages/Settings';
import { Toaster } from 'sonner';

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
                <Route path="edit/:id" element={<LeadForm />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="team" element={<Team />} />
                <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <LeadProvider>
            <BrowserRouter>
                <AppRoutes />
                <Toaster position="top-center" richColors />
            </BrowserRouter>
        </LeadProvider>
    );
};

export default App;
