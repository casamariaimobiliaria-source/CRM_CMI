import React, { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useLead } from '../contexts/LeadContext';
import { LeadStatus } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const Kanban: React.FC = () => {
    const { leads, updateLead } = useLead();
    const navigate = useNavigate();

    const columns = useMemo(() => [
        { id: LeadStatus.ATIVO, title: 'Ativo', color: 'bg-primary' },
        { id: LeadStatus.AGENDOU, title: 'Agendou', color: 'bg-secondary' },
        { id: LeadStatus.NAO_RESPONDE, title: 'Não Responde', color: 'bg-accent' },
        { id: LeadStatus.COMPROU, title: 'Comprou', color: 'bg-primary' },
        { id: LeadStatus.PERDIDO, title: 'Perdido', color: 'bg-destructive' },
    ], []);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as LeadStatus;
        try {
            await updateLead(draggableId, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    const getLeadsByStatus = (status: string) => {
        return leads.filter(l => l.status === status);
    };

    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col overflow-hidden bg-background">
            <Helmet>
                <title>Funil Estratégico | ImobLeads</title>
            </Helmet>
            <header className="px-8 py-10 shrink-0 border-b border-white/5 bg-background/50 backdrop-blur-3xl">
                <h1 className="text-4xl font-display font-bold text-foreground italic tracking-tight">The Pipeline</h1>
                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mt-3">Fluid Motion Strategy</p>
            </header>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-20 custom-scrollbar snap-x snap-mandatory md:snap-none scroll-smooth font-inter">
                    <div className="flex gap-8 p-8 min-h-full w-fit">
                        {columns.map((column) => (
                            <div
                                key={column.id}
                                className="flex flex-col min-w-[85vw] md:min-w-[320px] max-w-[340px] bg-white/[0.02] rounded-3xl border border-white/5 snap-center md:snap-align-none transition-all duration-700 hover:bg-white/[0.04]"
                            >
                                <div className="p-6 flex items-center justify-between shrink-0 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-1.5 h-1.5 rounded-full shadow-lg",
                                            column.id === LeadStatus.ATIVO ? "bg-primary shadow-primary/20" :
                                                column.id === LeadStatus.COMPROU ? "bg-emerald-500 shadow-emerald-500/20" :
                                                    "bg-muted-foreground/40"
                                        )} />
                                        <h2 className="font-display font-medium text-[13px] uppercase tracking-[0.15em] text-foreground/80 italic">{column.title}</h2>
                                    </div>
                                    <span className="text-[10px] font-luxury italic text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                                        {getLeadsByStatus(column.id).length} units
                                    </span>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={cn(
                                                "flex-1 p-4 space-y-4 overflow-y-auto transition-all duration-500 custom-scrollbar min-h-[150px]",
                                                snapshot.isDraggingOver ? "bg-primary/[0.02]" : ""
                                            )}
                                        >
                                            {getLeadsByStatus(column.id).map((lead, index) => (
                                                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => navigate(`/edit/${lead.id}`)}
                                                            className={cn(
                                                                "bg-card/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 shadow-premium cursor-pointer transition-all duration-500 group active:scale-95 hover:border-primary/20 hover:shadow-2xl hover:translate-y-[-2px]",
                                                                snapshot.isDragging ? "rotate-[2deg] shadow-2xl border-primary/40 bg-black/80 z-[100] scale-105" : ""
                                                            )}
                                                        >
                                                            <div className="flex items-start justify-between mb-4">
                                                                <h3 className="font-display font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">
                                                                    {lead.nome}
                                                                </h3>
                                                                <div className={cn(
                                                                    "w-2 h-0.5 rounded-full",
                                                                    lead.temperatura === 'Quente' ? 'bg-destructive' : lead.temperatura === 'Morno' ? 'bg-secondary' : 'bg-accent'
                                                                )} />
                                                            </div>

                                                            <div className="flex items-center justify-between mt-6">
                                                                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{lead.telefone}</span>
                                                                {lead.nextContact && (
                                                                    <div className={cn(
                                                                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/5",
                                                                        new Date(lead.nextContact) < new Date() ? "text-destructive" : "text-muted-foreground"
                                                                    )}>
                                                                        {new Date(lead.nextContact).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
};

export default Kanban;
