import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, isPast, isToday } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '../styles/agenda-calendar.css';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useLead } from '../contexts/LeadContext';
import { useBrokers } from '../hooks/useBrokers';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Lead, InteractionType } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Phone, Calendar as CalendarIcon, User, Building, AlignLeft, Info, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { formatPhone } from '../lib/utils';

const locales = {
    'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar as any);

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    resource: Lead;
}



const Agenda: React.FC = () => {
    const { session } = useAuth();
    const { userProfile } = useUser();
    const { leads, isSyncing, updateLead } = useLead();
    const navigate = useNavigate();

    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [brokerFilter, setBrokerFilter] = useState('Todos');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const { brokers: teamMembers, isLoading: isLoadingBrokers } = useBrokers();

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner';

    const events: CalendarEvent[] = useMemo(() => {
        if (!leads) return [];

        let filteredLeads = leads.filter(lead => lead.proximo_contato);

        // Filter by Broker/RBAC
        if (!isAdmin) {
            filteredLeads = filteredLeads.filter(lead => lead.user_id === userProfile?.id);
        } else if (brokerFilter && brokerFilter !== 'Todos') {
            filteredLeads = filteredLeads.filter(lead => lead.user_id === brokerFilter);
        }

        // Search text (Name, Phone, Enterprise)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const normalizedPhone = searchTerm.replace(/\D/g, '');
            filteredLeads = filteredLeads.filter(lead =>
                (lead.nome && lead.nome.toLowerCase().includes(term)) ||
                (lead.empreendimento && lead.empreendimento.toLowerCase().includes(term)) ||
                (normalizedPhone && lead.telefone && lead.telefone.replace(/\D/g, '').includes(normalizedPhone))
            );
        }

        return filteredLeads.map(lead => {
            const startDate = new Date(lead.proximo_contato!);
            // Defaulting end date to +1 hour for visualization
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

            const brokerObj = teamMembers.find((b) => b.id === lead.user_id);
            const brokerName = brokerObj?.name || (lead.corretor || 'Não Atribuído');

            return {
                title: `${lead.nome} | ${lead.telefone} | ${lead.empreendimento || 'Sem Empreendimento'} | ${brokerName}`,
                start: startDate,
                end: endDate,
                resource: lead,
            };
        });
    }, [leads, isAdmin, userProfile?.id, brokerFilter, searchTerm, teamMembers]);

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
    };

    const onEventDrop = async ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
        if (!event || !start) return;

        try {
            // Update local state optimistic (if needed, but usually real-time subscription is better)
            // However, we'll just do a DB update

            // Format to ISO string for Supabase timestamp validation
            const localStart = new Date(start);
            // Adjust to UTC since the calendar start date is local
            const utcStart = new Date(localStart.getTime() - (localStart.getTimezoneOffset() * 60000)).toISOString();

            // Use the LeadContext update function to mutate React state + sync to DB
            await updateLead(event.resource.id, { proximo_contato: utcStart });

            console.log('Event updated successfully');
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Erro ao reagendar evento. Tente novamente.');
        }
    };

    const eventStyleGetter = (event: CalendarEvent, start: Date, end: Date, isSelected: boolean) => {
        const past = isPast(event.start) && !isToday(event.start);
        const today = isToday(event.start);

        let backgroundColor = '#1e293b'; // Default muted dark blue
        let borderColor = '#334155';

        if (past) {
            backgroundColor = '#3f3f46'; // Grayish
            borderColor = '#52525b';
        } else {
            // Check Interaction Type for coloring
            const interactionType = event.resource?.tipo_proximo_contato;

            if (interactionType === InteractionType.VISITA) {
                backgroundColor = '#9333ea'; // Purple
                borderColor = '#7e22ce';
            } else if (interactionType === InteractionType.WHATSAPP) {
                backgroundColor = '#16a34a'; // Green
                borderColor = '#15803d';
            } else if (interactionType === InteractionType.REUNIAO) {
                backgroundColor = '#ea580c'; // Orange
                borderColor = '#c2410c';
            } else {
                backgroundColor = today ? '#0ea5e9' : '#2563eb'; // Default Blue
                borderColor = today ? '#0284c7' : '#1d4ed8';
            }
        }

        return {
            style: {
                backgroundColor,
                borderColor,
                color: '#f8fafc',
                borderRadius: '6px',
                opacity: 0.9,
                fontSize: '0.75rem',
                border: `1px solid ${borderColor}`,
                padding: '2px 4px',
            }
        };
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <span className="h-[1px] w-8 bg-primary/30" />
                        <p className="text-[10px] font-bold tracking-[0.4em] uppercase">Sua Rotina</p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-primary" />
                        Agenda de Compromissos
                    </h1>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#161926] p-6 rounded-2xl border border-white/5 shadow-modern">
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Buscar</Label>
                    <Input
                        placeholder="Nome, Telefone ou Empreendimento"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#1a1d2e] border-white/10"
                    />
                </div>

                {isAdmin && (
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Corretor (Apenas Admin)</Label>
                        <select
                            value={brokerFilter}
                            onChange={(e) => setBrokerFilter(e.target.value)}
                            className="w-full bg-[#1a1d2e] border-white/10 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white h-[42px]"
                        >
                            <option value="Todos" className="bg-[#1a1d2e] text-white">Todos os Corretores</option>
                            {teamMembers.map((broker) => (
                                <option key={broker.id} value={broker.id} className="bg-[#1a1d2e] text-white">
                                    {broker.name || 'Usuário Desconhecido'}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Calendar Container */}
            <div className="flex-1 bg-[#161926] p-6 rounded-2xl border border-white/5 shadow-modern overflow-hidden flex flex-col min-h-[600px] agenda-calendar-override">
                {isSyncing ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest animate-pulse">Carregando Agenda...</p>
                    </div>
                ) : (
                    <div className="flex-1 text-white min-h-[600px] h-full h-[calc(100vh-300px)]">
                        <DnDCalendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%', minHeight: '600px' }}
                            view={view}
                            onView={setView}
                            date={date}
                            onNavigate={setDate}
                            onSelectEvent={handleSelectEvent as any}
                            onEventDrop={onEventDrop as any}
                            resizable={false}
                            eventPropGetter={eventStyleGetter as any}
                            culture="pt-BR"
                            messages={{
                                next: "Próximo",
                                previous: "Anterior",
                                today: "Hoje",
                                month: "Mês",
                                week: "Semana",
                                day: "Dia",
                                agenda: "Lista",
                                date: "Data",
                                time: "Hora",
                                event: "Evento",
                                noEventsInRange: "Nenhum compromisso neste período.",
                                showMore: total => `+ ver mais (${total})`
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Event Detail Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={(open: boolean) => !open && setSelectedEvent(null)}>
                <DialogContent className="bg-[#161926] border-white/10 text-white sm:max-w-md p-0 overflow-hidden">
                    {selectedEvent && (
                        <>
                            <div className="p-6 bg-[#1a1d2e] border-b border-white/5">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-display flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" />
                                        Detalhes do Agendamento
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-sm text-primary font-medium">
                                        {format(selectedEvent.start, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/edit/${selectedEvent.resource.id}`)}
                                        className="h-8 bg-transparent border-white/10 hover:bg-white/5 hover:text-white"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                        Abrir Ficha
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Cliente</p>
                                            <p className="text-sm font-medium">{selectedEvent.resource.nome}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Telefone</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-medium">{formatPhone(selectedEvent.resource.telefone)}</p>
                                                {selectedEvent.resource.telefone && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-2 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all duration-300 flex items-center gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(`https://wa.me/55${String(selectedEvent.resource.telefone).replace(/\D/g, '')}`, '_blank');
                                                        }}
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c.908.523 1.985.903 3.162.903 3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm3.456 8.351c-.147.415-.75.762-1.031.812-.259.045-.598.082-1.391-.231-1.026-.402-1.742-1.428-1.791-1.493-.049-.064-.403-.532-.403-1.013 0-.481.253-.717.342-.816.089-.098.196-.123.261-.123s.131.002.188.007c.06.004.141-.023.221.171.081.194.279.678.305.731.026.053.043.115.008.186-.035.07-.052.115-.104.176-.052.061-.109.136-.156.183-.053.053-.108.111-.047.216.062.105.275.452.591.733.407.362.748.473.853.526.105.053.166.044.227-.026.061-.07.261-.304.331-.407.07-.104.14-.087.236-.052.096.035.607.286.711.338.105.053.175.08.2.123.025.044.025.253-.122.668z" /></svg>
                                                        <span className="text-xs font-bold tracking-wider">WHATSAPP</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Empreendimento</p>
                                            <p className="text-sm font-medium">{selectedEvent.resource.empreendimento || 'Não especificado'}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedEvent.resource.historico && (
                                    <div className="pt-4 border-t border-white/5">
                                        <div className="flex items-start gap-3">
                                            <AlignLeft className="w-4 h-4 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Histórico Resumo</p>
                                                <div className="bg-[#1a1d2e] p-3 rounded-xl border border-white/5 text-sm leading-relaxed text-gray-300">
                                                    {selectedEvent.resource.historico}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Agenda;
