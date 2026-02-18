import React from 'react';
import { useLead } from '../contexts/LeadContext';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import LeadCard from '../components/LeadCard';
import LeadTableRow from '../components/LeadTableRow';
import LeadFilters from '../components/LeadFilters';
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

    const leadsInfo = useLeads(leads);

    const {
        searchTerm,
        setSearchTerm,
        temperatureFilter,
        setTemperatureFilter,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        brokerFilter,
        setBrokerFilter, // Corrected from setFilterBroker
        filteredLeads
    } = leadsInfo;

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
                    <h1 className="text-4xl md:text-5xl font-display font-medium text-foreground italic tracking-tighter leading-tight">Fluxo de <span className="text-primary font-bold">Leads</span></h1>
                    <p className="text-primary/60 text-[10px] font-bold tracking-[0.4em] uppercase flex items-center gap-3">
                        <span className="h-[1px] w-8 bg-primary/30" />
                        Gestão de Pipeline Exclusiva
                    </p>
                </div>

                <Button
                    onClick={() => navigate('/add')}
                    className="flex-1 md:flex-none h-10 md:h-12 px-6 md:px-8 rounded-xl md:rounded-2xl bg-primary text-primary-foreground font-bold text-[9px] md:text-[10px] tracking-widest uppercase shadow-luxury hover:scale-105 transition-all group"
                >
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    NOVO LEAD
                </Button>
            </div>

            <div className="max-w-7xl mx-auto w-full space-y-12">
                <LeadFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    temperatureFilter={temperatureFilter}
                    setTemperatureFilter={setTemperatureFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
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
                    brokerFilter={brokerFilter}
                    setBrokerFilter={setBrokerFilter} // Corrected
                />

                <main className="space-y-8 pb-32">
                    {filteredLeads.length === 0 ? (
                        <div
                            className="py-32 text-center flex flex-col items-center bg-card/30 backdrop-blur-md rounded-[3rem] border border-border/40 shadow-premium"
                        >
                            <div className="w-24 h-24 bg-background rounded-3xl flex items-center justify-center mb-8 border border-border shadow-sm">
                                <svg className="w-10 h-10 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-display font-bold text-foreground italic mb-2">Nenhum Registro Encontrado</h3>
                            <p className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                                {searchTerm ? `A busca por "${searchTerm}" não retornou dados` : "A base exclusiva de Leads está vazia"}
                            </p>
                            {searchTerm && (
                                <Button variant="ghost" onClick={() => setSearchTerm('')} className="mt-8 text-primary text-[10px] tracking-widest font-bold border border-primary/20 hover:bg-primary/5 rounded-xl">LIMPAR BUSCA</Button>
                            )}
                        </div>
                    ) : (
                        <div
                            className={cn(
                                viewMode === 'table'
                                    ? "bg-card/30 backdrop-blur-xl rounded-[2.5rem] border border-border/40 divide-y divide-border/20 overflow-hidden shadow-premium"
                                    : "grid grid-cols-1 gap-6"
                            )}
                        >
                            {filteredLeads.map((lead, index) => (
                                viewMode === 'cards'
                                    ? <LeadCard key={lead.id} lead={lead} />
                                    : <LeadTableRow key={lead.id} lead={lead} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default LeadList;
