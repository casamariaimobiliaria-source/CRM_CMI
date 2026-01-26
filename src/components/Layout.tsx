import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, LogOut, Cloud, RefreshCw, Columns3, BarChart3, Users2, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import { useLead } from '../contexts/LeadContext';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC = () => {
    const { isSyncing, signOut, session, userProfile, leads } = useLead();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        { icon: Users, label: 'LEADS', path: '/' },
        { icon: Columns3, label: 'FUNIL', path: '/kanban' },
        { icon: BarChart3, label: 'RELATÓRIOS', path: '/reports' },
        { icon: LayoutDashboard, label: 'PAINEL', path: '/dashboard' },
        { icon: SettingsIcon, label: 'CONFIG', path: '/settings' },
    ];

    if (userProfile?.organization_id) {
        menuItems.push({ icon: Users2, label: 'EQUIPE', path: '/team' });
    }

    if (userProfile?.is_super_admin) {
        menuItems.push({ icon: ShieldAlert, label: 'ADMIN', path: '/admin' });
    }

    return (
        <div className="min-h-screen bg-background flex flex-col selection:bg-primary/30 selection:text-foreground">
            {/* Elegant Header */}
            <header className="sticky top-0 z-50 h-20 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex flex-col">
                        <h1 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tighter leading-tight bg-gradient-to-r from-primary via-primary/80 to-primary-foreground bg-clip-text text-transparent">
                            IMOBLEADS
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] md:text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase hidden sm:inline">Exclusivity CRM</span>
                            <div className={cn(
                                "w-1 h-1 rounded-full",
                                isSyncing ? "bg-amber-500 animate-pulse" : "bg-primary"
                            )} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    {userProfile?.organization && (
                        <div className="hidden lg:flex flex-col items-end border-r border-white/10 pr-6">
                            <span className="text-[10px] font-bold tracking-[0.15em] text-primary uppercase mb-1">
                                {userProfile.organization.plan_tier} MEMBER
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${Math.min(100, ((leads?.length || 0) / (userProfile.organization.max_leads || 100)) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                    {leads?.length || 0}/{userProfile.organization.max_leads}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] md:text-xs font-bold font-display text-foreground tracking-widest uppercase truncate max-w-[80px] md:max-w-none">
                                {session?.user?.user_metadata?.name?.split(' ')[0] || 'Membro'}
                            </span>
                            <span className="text-[9px] md:text-[10px] font-medium text-muted-foreground/60 tracking-wider hidden sm:inline">
                                {userProfile?.organization?.name}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/5 transition-all duration-500"
                        >
                            <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-0 relative">
                <div className="absolute inset-0 subtle-pattern opacity-10 pointer-events-none" />
                <div className="relative z-10 flex-1 px-4 md:px-8 py-6">
                    <Outlet />
                </div>
            </main>

            {/* Refined Dock Navigation */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-2xl">
                <nav className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => cn(
                                        "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-500 relative group",
                                        isActive
                                            ? "bg-white/5 text-primary"
                                            : "text-muted-foreground hover:text-white"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5 transition-transform duration-500 group-hover:scale-110", isActive && "stroke-[2.5px]")} />
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(184,134,11,0.8)]"
                                        />
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>

                    <Button
                        onClick={() => navigate('/add')}
                        variant="primary"
                        size="icon"
                        className="h-10 w-10 md:h-12 md:w-12 rounded-xl shadow-gold-glow hover:scale-110 active:scale-95 transition-all ml-1"
                        aria-label="New Lead"
                    >
                        <PlusCircle className="w-5 h-5 md:w-6 md:h-6" />
                    </Button>
                </nav>
            </div>
        </div>
    );
};

export default Layout;
