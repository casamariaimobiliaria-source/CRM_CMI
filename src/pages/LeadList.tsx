import React from 'react';
import { useLead } from '../contexts/LeadContext';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import LeadCard from '../components/LeadCard';
import LeadTableRow from '../components/LeadTableRow';
import LeadFilters from '../components/LeadFilters';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeads } from '../hooks/useLeads';
import { cn } from '../lib/utils';


import { useBrokers } from '../hooks/useBrokers';

import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadList: React.FC = () => {
    const { leads, isSyncing } = useLead();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = React.useState<'cards' | 'table'>('cards');
    const { brokers } = useBrokers();

    const {
        searchTerm,
        setSearchTerm,
        filterTemp,
        setFilterTemp,
        filterStatus,
        setFilterStatus,
        sortBy,
        setSortBy,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        filterBroker,
        setFilterBroker,
        filteredLeads
    } = useLeads(leads);

    if (isSyncing && leads.length === 0) {
        return (
            <div className="flex-1 px-8 py-12 space-y-8 max-w-7xl mx-auto w-full">
                <div className="h-10 w-64 bg-white/5 rounded-full animate-pulse" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-2xl bg-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background p-6 md:p-10 space-y-12">
            <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground italic tracking-tighter">Fluxo de Leads</h1>
                    <p className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase flex items-center gap-3">
                        <span className="h-[1px] w-8 bg-primary/30" />
                        Gestão de Pipeline em Tempo Real
                    </p>
                </div>

                <Button
                    onClick={() => navigate('/add')}
                    className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-[10px] tracking-widest uppercase shadow-neon-cyan hover:scale-105 transition-all group"
                >
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    NOVO LEAD
                </Button>
            </div>

            <div className="bg-card/95 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 subtle-dot-grid opacity-5 pointer-events-none" />
                <LeadFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterTemp={filterTemp}
                    setFilterTemp={setFilterTemp}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    filteredCount={filteredLeads.length}
                    filteredLeads={filteredLeads}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    brokers={brokers}
                    filterBroker={filterBroker}
                    setFilterBroker={setFilterBroker}
                />

                <main className="space-y-6 pb-40 relative z-10">
                    <AnimatePresence mode="popLayout">
                        {filteredLeads.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-32 text-center flex flex-col items-center"
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5">
                                    <svg className="w-10 h-10 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <h3 className="text-xl font-display font-bold text-foreground italic mb-2">Nenhum Registro Encontrado</h3>
                                <p className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                                    {searchTerm ? `A busca por "${searchTerm}" não retornou dados` : "A base exclusiva de Leads está vazia"}
                                </p>
                                {searchTerm && (
                                    <Button variant="ghost" onClick={() => setSearchTerm('')} className="mt-8 text-primary text-[10px] tracking-widest font-bold">LIMPAR BUSCA</Button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                layout
                                className={cn(
                                    viewMode === 'table'
                                        ? "bg-black/20 backdrop-blur-md rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden"
                                        : "grid grid-cols-1 gap-6"
                                )}
                            >
                                {filteredLeads.map(lead => (
                                    viewMode === 'cards'
                                        ? <LeadCard key={lead.id} lead={lead} />
                                        : <LeadTableRow key={lead.id} lead={lead} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default LeadList;
