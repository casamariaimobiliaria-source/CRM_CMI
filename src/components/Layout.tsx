import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Home,
    Users,
    UserCircle,
    FileText,
    Calendar,
    DollarSign,
    BarChart3,
    Settings,
    LogOut,
    Search,
    Bell,
    Menu,
    Columns,
    Archive,
    Database,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC = () => {
    const { signOut } = useAuth();
    const { userProfile, systemSettings } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'DASHBOARD', path: '/dashboard' },
        { icon: Columns, label: 'PIPELINE', path: '/kanban' },
        { icon: Archive, label: 'MEUS LEADS', path: '/' },
        { icon: Users, label: 'EQUIPE', path: '/team' },
        { icon: Database, label: 'DADOS', path: '/administration' },
        { icon: BarChart3, label: 'RELATÓRIOS', path: '/reports' },
        { icon: Settings, label: 'CONFIGURAÇÕES', path: '/settings' },
    ];

    const SidebarContent = ({ isDesktop = false }: { isDesktop?: boolean }) => (
        <div className={cn(
            "flex flex-col h-full bg-[#161926] transition-all duration-300",
            isDesktop && isCollapsed ? "w-[80px]" : "w-full"
        )}>
            <div className={cn(
                "h-24 flex items-center transition-all duration-300",
                isDesktop && isCollapsed ? "justify-center px-0" : "px-8"
            )}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 min-w-[3rem] rounded-full bg-[#1a1d2e] border border-[#60a5fa]/20 flex items-center justify-center text-[#60a5fa] font-bold text-xl shadow-[0_0_20px_rgba(96,165,250,0.1)]">
                        C
                    </div>
                    {(!isDesktop || !isCollapsed) && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col"
                        >
                            <span className="font-bold text-white text-lg tracking-tight italic whitespace-nowrap">Casa Maria Imóveis</span>
                        </motion.div>
                    )}
                </div>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) => cn(
                            "flex items-center rounded-xl text-[11px] font-bold tracking-[0.2em] transition-all duration-200 group relative uppercase",
                            isDesktop && isCollapsed ? "justify-center p-4" : "gap-4 px-4 py-4",
                            isActive
                                ? "text-[#60a5fa] bg-[#60a5fa]/5 border border-[#60a5fa]/10"
                                : "text-[#8b8fa3] hover:text-white hover:bg-white/5"
                        )}
                        title={isDesktop && isCollapsed ? item.label : undefined}
                    >
                        {location.pathname === item.path && (
                            <div className={cn(
                                "absolute w-1.5 bg-[#60a5fa] rounded-r-full shadow-[4px_0_15px_rgba(96, 165, 250, 0.4)] transition-all",
                                isDesktop && isCollapsed ? "left-0 h-6" : "left-[-16px] h-8"
                            )} />
                        )}
                        <item.icon className={cn(
                            "w-5 h-5 transition-colors shrink-0",
                            location.pathname === item.path ? "text-[#60a5fa]" : "text-[#8b8fa3] group-hover:text-white"
                        )} />
                        {(!isDesktop || !isCollapsed) && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="whitespace-nowrap"
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className={cn(
                "p-6 border-t border-white/5",
                isDesktop && isCollapsed ? "flex justify-center px-4" : ""
            )}>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start gap-4 px-4 py-3 rounded-xl h-auto font-medium",
                        isDesktop && isCollapsed ? "justify-center px-0" : ""
                    )}
                    onClick={handleSignOut}
                    title={isDesktop && isCollapsed ? "Sair" : undefined}
                >
                    <LogOut className="w-5 h-5" />
                    {(!isDesktop || !isCollapsed) && <span>Sair</span>}
                </Button>
            </div>
        </div >
    );

    return (
        <div className="flex h-screen bg-[#1a1d2e] text-white overflow-hidden font-sans relative">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col border-r border-white/5 h-full relative z-20 bg-[#161926] shadow-modern transition-[width] duration-300 ease-in-out",
                    isCollapsed ? "w-[80px]" : "w-[260px]"
                )}
            >
                <SidebarContent isDesktop />

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute bottom-24 -right-3 w-6 h-6 bg-[#60a5fa] rounded-full flex items-center justify-center text-[#1a1d2e] shadow-lg hover:scale-110 transition-transform z-30"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-[#252836] z-50 lg:hidden shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col min-w-0 bg-[#1a1d2e] transition-all duration-300">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center px-6 lg:px-10 justify-between bg-[#1a1d2e]/80 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-6 flex-1 max-w-xl">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </Button>
                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar imóveis, clientes..."
                                className="w-full bg-[#252836] border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-1 focus:ring-[#60a5fa] placeholder:text-muted-foreground outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-[#1a1d2e]" />
                        </Button>

                        <div className="h-8 w-[1px] bg-white/5 mx-2 hidden lg:block" />

                        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold truncate max-w-[150px] group-hover:text-[#60a5fa] transition-colors">
                                    {userProfile?.name || 'Administrador'}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-1">
                                    {userProfile?.role === 'owner' ? 'Proprietário' : 'Corretor'}
                                </p>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] p-[1px] shadow-lg group-hover:scale-105 transition-all">
                                <div className="w-full h-full rounded-[10px] bg-[#252836] flex items-center justify-center font-bold text-sm">
                                    {userProfile?.name?.[0] || 'A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
                    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
