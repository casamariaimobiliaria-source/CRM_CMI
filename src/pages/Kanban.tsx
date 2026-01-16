import React, { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useLead } from '../contexts/LeadContext';
import { LeadStatus } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Kanban: React.FC = () => {
    const { leads, updateLead } = useLead();
    const navigate = useNavigate();

    const columns = useMemo(() => [
        { id: LeadStatus.ATIVO, title: 'Ativo', color: 'bg-emerald-500' },
        { id: LeadStatus.AGENDOU, title: 'Agendou', color: 'bg-indigo-500' },
        { id: LeadStatus.NAO_RESPONDE, title: 'Não Responde', color: 'bg-amber-500' },
        { id: LeadStatus.COMPROU, title: 'Comprou', color: 'bg-blue-600' },
        { id: LeadStatus.PERDIDO, title: 'Perdido', color: 'bg-rose-500' },
    ], []);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as LeadStatus;
        try {
            await updateLead(draggableId, { status: newStatus });
            toast.success(`Status atualizado para ${newStatus}`);
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    const getLeadsByStatus = (status: string) => {
        return leads.filter(l => l.status === status);
    };

    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col overflow-hidden bg-slate-50/50">
            <header className="px-4 py-4 md:px-6 md:py-6 shrink-0 bg-white/50 backdrop-blur-md border-b border-border/50">
                <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">Funil de Vendas</h1>
                <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Arraste os cards para mudar o status</p>
            </header>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-20 md:pb-8 custom-scrollbar snap-x snap-mandatory md:snap-none scroll-smooth">
                    <div className="flex gap-4 p-4 md:p-6 min-h-full w-fit">
                        {columns.map((column) => (
                            <div
                                key={column.id}
                                className="flex flex-col min-w-[85vw] md:min-w-[300px] max-w-[320px] bg-muted/30 rounded-2xl border border-border/50 snap-center md:snap-align-none"
                            >
                                <div className="p-4 flex items-center justify-between shrink-0 bg-white/40 rounded-t-2xl border-b border-border/10">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full shadow-sm", column.color)} />
                                        <h2 className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-foreground">{column.title}</h2>
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground/50 bg-muted px-2 py-0.5 rounded-full">
                                        {getLeadsByStatus(column.id).length}
                                    </span>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={cn(
                                                "flex-1 p-2 space-y-3 overflow-y-auto transition-colors custom-scrollbar min-h-[150px]",
                                                snapshot.isDraggingOver ? "bg-primary/5" : ""
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
                                                                "bg-card p-2 rounded-xl border border-border shadow-sm cursor-pointer hover:shadow-md transition-all group active:scale-95",
                                                                snapshot.isDragging ? "rotate-2 shadow-xl border-primary/50 bg-white z-[100]" : ""
                                                            )}
                                                        >
                                                            <h3 className="font-bold text-[10px] md:text-[11px] uppercase truncate mb-1.5 group-hover:text-primary transition-colors">
                                                                {lead.nome}
                                                                <span className={cn(
                                                                    "inline-block w-1.5 h-1.5 rounded-full ml-2 shadow-sm",
                                                                    lead.temperatura === 'Quente' ? 'bg-rose-500' : lead.temperatura === 'Morno' ? 'bg-amber-500' : 'bg-blue-500'
                                                                )} />
                                                            </h3>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <span className="text-[9px] font-medium text-muted-foreground truncate">{lead.telefone}</span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open(`https://wa.me/${lead.telefone.replace(/\D/g, '')}`, '_blank');
                                                                        }}
                                                                        className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                                    >
                                                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {lead.nextContact && (
                                                                <div className={cn(
                                                                    "mt-2 text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1 py-0.5 px-2 rounded-md w-fit",
                                                                    new Date(lead.nextContact) < new Date() ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
                                                                )}>
                                                                    📅 {new Date(lead.nextContact).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                                </div>
                                                            )}
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
