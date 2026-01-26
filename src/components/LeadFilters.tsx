import React from 'react';
import { LeadTemperature, LeadStatus, Lead } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
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
        <div className="bg-background/80 backdrop-blur-3xl border-b border-white/5 sticky top-20 z-40 py-6 md:py-8 shrink-0 transition-all">
            <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-8">

                <div className="relative group max-w-2xl mx-auto">
                    <Input
                        placeholder="Procure por nome, telefone ou empreendimento..."
                        className="h-14 pl-12 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary/30 transition-all rounded-2xl text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 uppercase">Filtrar por:</span>
                        <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/5">
                            {(['Todos', ...Object.values(LeadStatus)] as string[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s as any)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                        filterStatus === s
                                            ? "bg-primary text-black shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 uppercase">Ordenar:</span>
                        <select
                            className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-primary uppercase tracking-widest cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="recent">MAIS RECENTES</option>
                            <option value="name">NOME (A-Z)</option>
                            <option value="overdue">ATRASADOS</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'cards' ? "bg-white/10 text-primary" : "text-muted-foreground/40 hover:text-foreground"
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'table' ? "bg-white/10 text-primary" : "text-muted-foreground/40 hover:text-foreground"
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] font-luxury italic text-muted-foreground/40 tracking-widest">
                            Mostrando {filteredCount} registros de exclusividade
                        </p>
                    </div>

                    <Button
                        onClick={() => exportLeadsToExcel(filteredLeads)}
                        variant="ghost"
                        size="sm"
                        className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground hover:text-primary transition-all uppercase px-4 border border-white/5 rounded-full"
                    >
                        <Download className="w-3.5 h-3.5 mr-2" />
                        Relatório Excel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LeadFilters;
