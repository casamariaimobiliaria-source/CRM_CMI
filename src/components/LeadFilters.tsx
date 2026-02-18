import React from 'react';
import { LeadTemperature, LeadStatus, Lead } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { Download, LayoutGrid, List } from 'lucide-react';
import { exportLeadsToExcel } from '../lib/excelUtils';

interface LeadFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    temperatureFilter: LeadTemperature | 'Todos';
    setTemperatureFilter: (temp: LeadTemperature | 'Todos') => void;
    statusFilter: LeadStatus | 'Todos';
    setStatusFilter: (status: LeadStatus | 'Todos') => void;
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
    brokerFilter?: string;
    setBrokerFilter?: (brokerId: string) => void;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    temperatureFilter,
    setTemperatureFilter,
    statusFilter,
    setStatusFilter,
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
    brokerFilter,
    setBrokerFilter
}) => {
    return (
        <div className="bg-transparent py-4 md:py-6 shrink-0 transition-all relative">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 px-4 md:px-0">

                <div className="relative group max-w-xl mx-auto">
                    <div className="absolute inset-0 bg-primary/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <Input
                        placeholder="Procure por nome, telefone ou empreendimento..."
                        className="h-14 pl-14 bg-card/40 backdrop-blur-md border border-border/40 focus:bg-card/60 focus:border-primary/40 transition-all rounded-[1.5rem] text-[15px] shadow-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground/40 uppercase hidden md:inline italic">FILTRAR:</span>
                        <div className="flex gap-2 p-1.5 bg-card/30 backdrop-blur-md rounded-full border border-border/40 overflow-x-auto w-full md:w-auto no-scrollbar justify-start md:justify-center shadow-sm">
                            {(['Todos', ...Object.values(LeadStatus)] as string[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s as any)}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0 font-display italic",
                                        statusFilter === s
                                            ? "bg-primary text-primary-foreground shadow-luxury scale-105"
                                            : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:border-l border-border/20 md:pl-8 w-full md:w-auto justify-center">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground/40 uppercase italic">ORDEM:</span>
                        <div className="relative">
                            <select
                                className="bg-card/40 hover:bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl px-6 py-2.5 focus:ring-4 focus:ring-primary/10 text-[11px] font-bold text-primary uppercase tracking-[0.2em] cursor-pointer outline-none transition-all appearance-none font-display italic pr-12 min-w-[180px] shadow-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                            >
                                <option value="recent" className="bg-background text-foreground">MAIS RECENTES</option>
                                <option value="name" className="bg-background text-foreground">NOME (A-Z)</option>
                                <option value="overdue" className="bg-background text-foreground">ATRASADOS</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-border/20 gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex bg-card/30 backdrop-blur-md p-1.5 rounded-2xl border border-border/40 shadow-sm">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all duration-300",
                                    viewMode === 'cards' ? "bg-primary/10 text-primary shadow-inner" : "text-muted-foreground/30 hover:text-foreground"
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all duration-300",
                                    viewMode === 'table' ? "bg-primary/10 text-primary shadow-inner" : "text-muted-foreground/30 hover:text-foreground"
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="h-0.5 w-6 bg-primary/20" />
                            <p className="text-[11px] font-display italic text-muted-foreground/40 tracking-[0.15em] uppercase">
                                <span className="text-primary/60 font-bold not-italic">{filteredCount}</span> Registros de Exclusividade
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => exportLeadsToExcel(filteredLeads)}
                        variant="ghost"
                        size="sm"
                        className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-all uppercase px-8 border border-border/40 rounded-full h-11 bg-card/20 backdrop-blur-sm hover:bg-card/40 font-display italic"
                    >
                        <Download className="w-4 h-4 mr-3 opacity-60" />
                        RELATÓRIO EXCEL
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LeadFilters;
