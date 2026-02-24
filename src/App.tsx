import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { LeadProvider } from './contexts/LeadContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import { validateDatabaseInstance } from './lib/supabase';
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const LeadList = React.lazy(() => import('./pages/LeadList'));
const LeadForm = React.lazy(() => import('./pages/LeadForm'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Kanban = React.lazy(() => import('./pages/Kanban'));
const SetupOrganization = React.lazy(() => import('./pages/SetupOrganization'));
const Team = React.lazy(() => import('./pages/Team'));
const JoinOrganization = React.lazy(() => import('./pages/JoinOrganization'));
const UpdatePassword = React.lazy(() => import('./pages/UpdatePassword'));
const Settings = React.lazy(() => import('./pages/Settings'));
const PerformanceReports = React.lazy(() => import('./pages/PerformanceReports'));
const AdminData = React.lazy(() => import('./pages/AdminData'));
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';

console.log("Vite Env Check:", {
    hasOpenAI: !!import.meta.env.VITE_OPENAI_API_KEY,
    hasSupabase: !!import.meta.env.VITE_SUPABASE_URL,
    buildTimestamp: "2026-02-11T16:20:00Z"
});

// Error Boundary Component
const InstanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isVerified, setIsVerified] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        validateDatabaseInstance().then(valid => {
            setIsVerified(valid);
        });
    }, []);

    if (isVerified === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-10 text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 0h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Bloqueio de Segurança</h1>
                <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                    Detectamos uma inconsistência entre esta instalação do sistema e o Banco de Dados conectado.
                    <br /><br />
                    <span className="text-red-400/80 text-sm font-mono">Erro: DATABASE_INSTANCE_MISMATCH</span>
                </p>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-gray-500 max-w-lg text-left">
                    <p>Este sistema está configurado para um banco de dados específico. O acesso foi bloqueado para prevenir o cruzamento de dados de clientes diferentes.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background p-10 text-center">
                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Algo deu errado</h2>
                    <p className="text-muted-foreground max-w-md mb-8">Ocorreu um erro inesperado ao carregar esta página. Por favor, tente recarregar.</p>
                    <pre className="p-4 bg-muted rounded-xl text-[10px] text-left overflow-auto max-w-full mb-8 text-destructive max-h-40">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                        Recarregar Sistema
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session, isLoading } = useAuth();
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
    const { userProfile, isLoading } = useUser();

    if (isLoading) return null;

    if (!userProfile) {
        return <Navigate to="/setup" replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    const { session, isLoading: authLoading } = useAuth();
    const { userProfile, isLoading: userLoading } = useUser();

    const isLoading = authLoading || userLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-10 text-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-bold text-foreground mb-2 italic font-display">Iniciando Sistema</h2>
                <p className="text-muted-foreground text-[10px] uppercase tracking-[0.4em] animate-pulse">
                    Autenticando e carregando perfil exclusivo
                </p>
            </div>
        );
    }

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
            <Route path="/update-password" element={<UpdatePassword />} />
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
                <Route path="administration" element={<AdminData />} />
                <Route path="settings" element={<Settings />} />
                <Route path="reports" element={<PerformanceReports />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <UserProvider>
                        <LeadProvider>
                            <BrowserRouter>
                                <React.Suspense fallback={
                                    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] animate-pulse">Carregando Módulos</p>
                                    </div>
                                }>
                                    <ErrorBoundary>
                                        <InstanceGuard>
                                            <AppRoutes />
                                        </InstanceGuard>
                                    </ErrorBoundary>
                                </React.Suspense>
                                <Toaster position="top-center" richColors />
                            </BrowserRouter>
                        </LeadProvider>
                    </UserProvider>
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
};

export default App;
