import { useState, useMemo } from 'react';
import { Lead, LeadTemperature, LeadStatus } from '../types';

export function useLeads(leads: Lead[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTemp, setFilterTemp] = useState<LeadTemperature | 'Todos'>('Todos');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'Todos'>('Todos');
    const [sortBy, setSortBy] = useState<'recent' | 'name' | 'overdue'>('recent');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [filterBroker, setFilterBroker] = useState<string>('Todos'); // user_id or 'Todos'

    const filteredLeads = useMemo(() => {
        if (!Array.isArray(leads)) return [];

        const term = String(searchTerm || '').toLowerCase().trim();
        const numericTerm = term.replace(/\D/g, '');

        return leads.filter(l => {
            if (!l || typeof l !== 'object') return false;

            const name = String(l.nome || '').toLowerCase();
            const phone = String(l.telefone || '').replace(/\D/g, '');
            const emp = String(l.empreendimento || '').toLowerCase();

            const matchesSearch =
                term === '' ||
                name.includes(term) ||
                emp.includes(term) ||
                (numericTerm !== '' && phone.includes(numericTerm));

            const matchesTemp = filterTemp === 'Todos' || l.temperatura === filterTemp;
            const matchesStatus = filterStatus === 'Todos' || l.status === filterStatus;

            const matchesDate = (() => {
                if (!startDate && !endDate) return true;
                const leadDate = new Date(l.createdAt);
                if (startDate && leadDate < new Date(startDate)) return false;
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (leadDate > end) return false;
                }
                return true;
            })();

            const matchesBroker = filterBroker === 'Todos' || l.user_id === filterBroker;

            return matchesSearch && matchesTemp && matchesStatus && matchesDate && matchesBroker;
        }).sort((a, b) => {
            if (sortBy === 'name') {
                return (a.nome || '').localeCompare(b.nome || '');
            }
            if (sortBy === 'overdue') {
                const now = new Date();
                const aOverdue = a.nextContact && new Date(a.nextContact) < now;
                const bOverdue = b.nextContact && new Date(b.nextContact) < now;
                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;
            }
            // Default: recent (createdAt descending)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [leads, searchTerm, filterTemp, filterStatus, sortBy, startDate, endDate, filterBroker]);

    return {
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
    };
}
