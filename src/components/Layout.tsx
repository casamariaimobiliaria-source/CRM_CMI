import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    LogOut,
    BarChart3,
    Settings as SettingsIcon,
    Inbox,
    KanbanSquare,
    Menu,
    Shield,
    Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC = () => {
    const { signOut } = useAuth();
    const { userProfile, systemSettings, impersonatedOrgId, setImpersonatedOrg } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: KanbanSquare, label: 'Pipeline', path: '/kanban' },
        { icon: Inbox, label: 'Meus Leads', path: '/' },
        { icon: Users, label: 'Equipe', path: '/team' },
        { icon: Database, label: 'Dados', path: '/administration', adminOnly: true },
        { icon: BarChart3, label: 'Relatórios', path: '/reports' },
        { icon: SettingsIcon, label: 'Configurações', path: '/settings' },
    ];



    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                        {(userProfile?.organization?.logo_url || systemSettings?.app_logo_url) ? (
                            <img
                                src={userProfile?.organization?.logo_url || systemSettings?.app_logo_url}
                                alt="Logo"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            (userProfile?.organization?.brand_display_name || userProfile?.organization?.name || systemSettings?.app_name || 'N')[0]
                        )}
                    </div>
                    <span className={cn("font-display font-bold text-xl tracking-tighter italic", impersonatedOrgId && "text-amber-500")}>
                        {userProfile?.organization?.brand_display_name || userProfile?.organization?.name || systemSettings?.app_name || 'NossoCRM'}
                    </span>
                </div>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems
                    .filter(item => !item.adminOnly || userProfile?.role === 'admin' || userProfile?.role === 'owner')
                    .map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-500 group relative overflow-hidden",
                                isActive
                                    ? "text-primary bg-primary/10 border border-primary/20 shadow-luxury"
                                    : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5 border border-transparent"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                location.pathname === item.path ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            {item.label}
                            {location.pathname === item.path && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </NavLink>
                    ))}
            </nav>

            <div className="p-4 border-t border-border/50 mt-auto">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium border border-border/50">
                        {userProfile?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {userProfile?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {userProfile?.role === 'owner' ? 'Proprietário' :
                                userProfile?.role === 'admin' ? 'Administrador' :
                                    'Corretor'}
                        </p>
                    </div>
                    <ThemeToggle />
                </div>
                <Button
                    variant="ghost"
                    className="w-full mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start gap-2"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs">Sair da conta</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 selection:text-primary relative">
            <aside className="hidden md:flex w-72 flex-col border-r border-border/50 bg-card/40 dark:bg-black/40 backdrop-blur-3xl relative">
                <div className="absolute inset-0 subtle-dot-grid opacity-10 pointer-events-none" />
                <SidebarContent />
            </aside>

            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-64 bg-card z-50 md:hidden border-r border-white/10"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col min-w-0 bg-background relative">
                <div className="md:hidden h-16 border-b border-border/50 flex items-center px-4 justify-between bg-card/50 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </Button>
                        <span className="font-display font-bold text-lg">
                            {userProfile?.organization?.brand_display_name || userProfile?.organization?.name || systemSettings?.app_name || 'NossoCRM'}
                        </span>
                    </div>
                    <ThemeToggle />
                </div>



                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
