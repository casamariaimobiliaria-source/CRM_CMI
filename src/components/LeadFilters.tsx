import React from 'react';
import { LeadTemperature, LeadStatus, Lead } from '../types';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
import { Download, LayoutGrid, List, SortDesc, Calendar, Users } from 'lucide-react';
import { exportLeadsToExcel } from '../lib/excelUtils';

interface LeadFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterTemp: LeadTemperature | 'Todos';
    setFilterTemp: (temp: LeadTemperature | 'Todos') => void;
    filterStatus: LeadStatus | 'Todos';
    setFilterStatus: (status: LeadStatus | 'Todos') => void;
    filteredCount: number;
    filteredLeads: Lead[];
    viewMode: 'cards' | 'table';
    setViewMode: (mode: 'cards' | 'table') => void;
    sortBy: 'recent' | 'name' | 'overdue';
    setSortBy: (sort: 'recent' | 'name' | 'overdue') => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    brokers?: { id: string; name: string }[];
    filterBroker?: string;
    setFilterBroker?: (brokerId: string) => void;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    filterTemp,
    setFilterTemp,
    filterStatus,
    setFilterStatus,
    filteredCount,
    filteredLeads,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    brokers,
    filterBroker,
    setFilterBroker
}) => {
    return (
        <div className="bg-background/80 backdrop-blur-xl border-b sticky top-16 z-40 py-3 md:py-4 shrink-0 transition-all">
            <div className="max-w-7xl mx-auto space-y-3 md:space-y-4 px-4 md:px-6">

                <div className="relative group">
                    <Input
                        placeholder="Nome, telefone ou empreendimento..."
                        className="h-11 md:h-12 pl-10 md:pl-11 bg-muted/50 border-transparent focus:bg-background transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-4 h-4 md:w-5 md:h-5 absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-muted/30 p-2 px-3 rounded-xl border border-transparent focus-within:border-primary/20 transition-all">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest pl-1">Início:</span>
                        <input
                            type="date"
                            className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-foreground w-full p-0"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-muted/30 p-2 px-3 rounded-xl border border-transparent focus-within:border-primary/20 transition-all">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest pl-1">Fim:</span>
                        <input
                            type="date"
                            className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-foreground w-full p-0"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    {brokers && brokers.length > 0 && setFilterBroker && (
                        <div className="flex items-center gap-2 bg-muted/30 p-2 px-3 rounded-xl border border-transparent focus-within:border-primary/20 transition-all md:col-span-2">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest pl-1">Corretor:</span>
                            <select
                                className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-foreground w-full p-0 cursor-pointer"
                                value={filterBroker}
                                onChange={(e) => setFilterBroker(e.target.value)}
                            >
                                <option value="Todos">Todos</option>
                                {brokers.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2.5 md:gap-3">
                    <div className="overflow-x-auto pb-1 custom-scrollbar -mx-4 px-4 md:-mx-6 md:px-6">
                        <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap min-w-max pr-4">
                            <span className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest mr-1">Status:</span>
                            {(['Todos', ...Object.values(LeadStatus)] as string[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s as any)}
                                    className={cn(
                                        "px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border",
                                        filterStatus === s
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "bg-card text-muted-foreground border-border hover:border-blue-400/50"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 md:-mx-6 md:px-6 scroll-smooth">
                        <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap min-w-max pr-4 pb-1">
                            <span className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest mr-1">Ordenar:</span>
                            {[
                                { id: 'recent', label: 'Mais Recentes' },
                                { id: 'name', label: 'Nome (A-Z)' },
                                { id: 'overdue', label: 'Atrasados Primeiro' }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSortBy(s.id as any)}
                                    className={cn(
                                        "px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border",
                                        sortBy === s.id
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-card text-muted-foreground border-border hover:border-primary/50"
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/10">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'cards' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="w-3 h-3" />
                            Cards
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'table' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <List className="w-3 h-3" />
                            Tabela
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <p className="hidden xs:block text-[8px] md:text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">{filteredCount} ENCONTRADOS</p>
                        {filteredCount > 0 && (
                            <button
                                onClick={() => exportLeadsToExcel(filteredLeads)}
                                className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-primary/5"
                            >
                                <Download className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                Exportar Excel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadFilters;
