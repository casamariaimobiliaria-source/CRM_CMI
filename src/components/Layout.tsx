import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, LogOut, Cloud, RefreshCw, Columns3, BarChart3, Users2, Settings as SettingsIcon } from 'lucide-react';
import { useLead } from '../contexts/LeadContext';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
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
        { icon: Users, label: 'Leads', path: '/' },
        { icon: Columns3, label: 'Funil', path: '/kanban' },
        { icon: BarChart3, label: 'Painel', path: '/dashboard' },
        { icon: SettingsIcon, label: 'Config', path: '/settings' },
    ];

    if (userProfile?.role === 'admin' || userProfile?.role === 'owner') {
        menuItems.push({ icon: Users2, label: 'Equipe', path: '/team' });
    }

    return (
        <div className="min-h-screen bg-background flex flex-col selection:bg-primary/10 selection:text-primary">
            {/* Premium Header */}
            <header className="sticky top-0 z-50 h-16 md:h-20 bg-background/60 backdrop-blur-xl border-b border-border/50 px-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                    <motion.div
                        initial={{ rotate: -10, opacity: 0 }}
                        animate={{ rotate: 3, opacity: 1 }}
                        whileHover={{ rotate: 0, scale: 1.05 }}
                        className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg md:rounded-xl flex items-center justify-center text-primary-foreground font-black text-lg md:text-xl shadow-lg shadow-primary/20 cursor-default"
                    >
                        L
                    </motion.div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-foreground tracking-tight leading-none text-base md:text-lg">ImobLeads</h1>
                        <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5 md:mt-1 flex items-center gap-1.5 md:gap-2">
                            <span className="hidden sm:inline">Premium CRM</span>
                            <AnimatePresence mode="wait">
                                {isSyncing ? (
                                    <motion.span
                                        key="syncing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-1 text-primary"
                                    >
                                        <RefreshCw className="w-2 md:w-2.5 h-2 md:h-2.5 animate-spin" />
                                        SYNC
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="online"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-1 text-emerald-500"
                                    >
                                        <Cloud className="w-2 md:w-2.5 h-2 md:h-2.5" />
                                        ONLINE
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 font-jakarta">
                    {/* Plan Usage Indicator */}
                    {userProfile?.organization && (
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {userProfile.organization.plan_tier}
                            </div>
                            <div className="text-xs font-medium text-foreground">
                                {leads?.length || 0} / {userProfile.organization.max_leads} Leads
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col items-end mr-1 md:mr-2 max-w-[120px] md:max-w-none">
                        <span className="text-[10px] md:text-sm font-bold text-foreground uppercase tracking-tight truncate w-full text-right">
                            {session?.user?.user_metadata?.name || 'Corretor'}
                        </span>
                        <span className="text-[8px] md:text-xs text-muted-foreground truncate w-full text-right">
                            {userProfile?.organization?.name || session?.user?.email}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 w-8 h-8 md:w-10 md:h-10"
                    >
                        <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-0 relative">
                <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/0.1)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40 px-6" />
                <div className="relative z-10 flex-1">
                    <Outlet />
                </div>
            </main>

            {/* Premium Float Bottom Navigation */}
            <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
                <motion.nav
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between w-full"
                >
                    <div className="flex items-center gap-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => cn(
                                        "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 relative overflow-hidden",
                                        isActive
                                            ? "text-white"
                                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5 relative z-10", isActive && "stroke-[2.5px]")} />
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-bg"
                                            className="absolute inset-x-0 inset-y-0 bg-primary/20 rounded-xl"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-dot"
                                            className="absolute bottom-1 w-1 h-1 bg-white rounded-full z-10"
                                        />
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>

                    <div className="relative pr-1">
                        <Button
                            onClick={() => navigate('/add')}
                            variant="primary"
                            size="icon"
                            className="w-11 h-11 rounded-xl shadow-xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 bg-white text-slate-950 hover:bg-slate-200 border-0"
                        >
                            <PlusCircle className="w-6 h-6" />
                        </Button>
                    </div>
                </motion.nav>
            </div>
        </div>
    );
};

export default Layout;
