import { useState, useMemo } from 'react';
import { Lead, LeadTemperature, LeadStatus } from '../types';

/**
 * Custom hook to filter and sort leads based on various criteria.
 * Adheres to Clean Code by separating filtering logic and providing a clear API.
 */
export function useLeads(leads: Lead[]) {
    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [temperatureFilter, setTemperatureFilter] = useState<LeadTemperature | 'Todos'>('Todos');
    const [statusFilter, setStatusFilter] = useState<LeadStatus | 'Todos'>('Todos');
    const [brokerFilter, setBrokerFilter] = useState<string>('Todos'); // user_id or 'Todos'

    // Date Filter States
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Sort State
    const [sortBy, setSortBy] = useState<'recent' | 'name' | 'overdue'>('recent');

    const filteredLeads = useMemo(() => {
        if (!Array.isArray(leads)) return [];

        const normalizedTerm = searchTerm.toLowerCase().trim();
        const numericTerm = normalizedTerm.replace(/\D/g, '');

        return leads
            .filter(lead => {
                if (!lead) return false;

                // Search filtering (Name, Phone, Enterprise)
                const matchesSearch = !normalizedTerm ||
                    lead.nome?.toLowerCase().includes(normalizedTerm) ||
                    lead.empreendimento?.toLowerCase().includes(normalizedTerm) ||
                    (numericTerm && lead.telefone?.replace(/\D/g, '').includes(numericTerm));

                // Enum based filtering
                const matchesTemperature = temperatureFilter === 'Todos' || lead.temperatura === temperatureFilter;
                const matchesStatus = statusFilter === 'Todos' || lead.status === statusFilter;
                const matchesBroker = brokerFilter === 'Todos' || lead.user_id === brokerFilter;

                // Date range filtering
                const matchesDateRange = (() => {
                    if (!startDate && !endDate) return true;

                    const leadDate = new Date(lead.createdAt);
                    if (isNaN(leadDate.getTime())) return false;

                    if (startDate && leadDate < new Date(startDate)) return false;

                    if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        if (leadDate > end) return false;
                    }

                    return true;
                })();

                return matchesSearch && matchesTemperature && matchesStatus && matchesBroker && matchesDateRange;
            })
            .sort((a, b) => {
                // Sorting Logic
                switch (sortBy) {
                    case 'name':
                        return (a.nome || '').localeCompare(b.nome || '');

                    case 'overdue': {
                        const now = new Date();
                        const aOverdue = a.proximo_contato && new Date(a.proximo_contato) < now;
                        const bOverdue = b.proximo_contato && new Date(b.proximo_contato) < now;
                        if (aOverdue && !bOverdue) return -1;
                        if (!aOverdue && bOverdue) return 1;
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }

                    case 'recent':
                    default:
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
            });
    }, [leads, searchTerm, temperatureFilter, statusFilter, brokerFilter, sortBy, startDate, endDate]);

    return {
        // Search & Filters
        searchTerm,
        setSearchTerm,
        temperatureFilter,
        setTemperatureFilter,
        statusFilter,
        setStatusFilter,
        brokerFilter,
        setBrokerFilter,

        // Date Filters
        startDate,
        setStartDate,
        endDate,
        setEndDate,

        // Sorting
        sortBy,
        setSortBy,

        // Result
        filteredLeads
    };
}
