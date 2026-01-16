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

const LeadList: React.FC = () => {
    const { leads, isSyncing, userProfile } = useLead();
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
            <div className="flex-1 px-4 py-8 space-y-4 max-w-7xl mx-auto w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full">
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

            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-3 pb-32 max-w-7xl mx-auto w-full">
                <AnimatePresence mode="popLayout">
                    {filteredLeads.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-20 text-center flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
                                {searchTerm ? `Nenhum resultado para "${searchTerm}"` : "Nenhum lead encontrado"}
                            </p>
                            {searchTerm && (
                                <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-primary">Limpar Pesquisa</Button>
                            )}
                        </motion.div>
                    ) : (
                        <div className={cn(
                            viewMode === 'table' ? "bg-card rounded-2xl border border-border/50 divide-y divide-border/30 overflow-hidden" : "space-y-3"
                        )}>
                            {filteredLeads.map(lead => (
                                viewMode === 'cards'
                                    ? <LeadCard key={lead.id} lead={lead} />
                                    : <LeadTableRow key={lead.id} lead={lead} />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default LeadList;
