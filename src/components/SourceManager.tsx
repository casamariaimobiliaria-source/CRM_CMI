import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { toast } from 'sonner';
import { Share2, X, Plus, Pencil, Trash2 } from 'lucide-react';

interface LeadSource {
    id: string;
    organization_id: string;
    name: string;
    description: string;
}

const SourceManager: React.FC = () => {
    const { userProfile } = useUser();
    const [sources, setSources] = useState<LeadSource[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const fetchSources = async () => {
        if (!userProfile?.organization_id) return;
        try {
            const { data, error } = await supabase
                .from('lead_sources')
                .select('*')
                .eq('organization_id', userProfile.organization_id)
                .order('name');
            if (error) throw error;
            setSources(data || []);
        } catch (error) {
            console.error('Error fetching sources:', error);
            toast.error('Erro ao carregar origens.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSources(); }, [userProfile?.organization_id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile?.organization_id) return;

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('lead_sources')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success('Origem atualizada!');
            } else {
                const { error } = await supabase
                    .from('lead_sources')
                    .insert({
                        ...formData,
                        organization_id: userProfile.organization_id
                    });
                if (error) throw error;
                toast.success('Origem cadastrada!');
            }

            setFormData({ name: '', description: '' });
            setIsAdding(false);
            setEditingId(null);
            fetchSources();
        } catch (error) {
            console.error('Error saving source:', error);
            const msg = error instanceof Error ? error.message : JSON.stringify(error);
            toast.error(`Erro ao salvar origem: ${msg}`);
        }
    };

    const startEdit = (src: LeadSource) => {
        setFormData({ name: src.name, description: src.description || '' });
        setEditingId(src.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir esta origem?')) return;
        try {
            const { error } = await supabase
                .from('lead_sources')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Origem excluída.');
            fetchSources();
        } catch (error) {
            console.error('Error deleting source:', error);
            toast.error('Erro ao excluir origem.');
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <Card className="glass-high-fidelity rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl">Origens de Leads</CardTitle>
                    <CardDescription>Canais de onde vêm seus clientes</CardDescription>
                </div>
                <Button
                    size="icon"
                    variant={(isAdding || editingId) ? 'ghost' : 'primary'}
                    onClick={() => {
                        if (isAdding || editingId) {
                            setIsAdding(false);
                            setEditingId(null);
                            setFormData({ name: '', description: '' });
                        } else {
                            setIsAdding(true);
                        }
                    }}
                >
                    {(isAdding || editingId) ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {(isAdding || editingId) && (
                    <form onSubmit={handleSave} className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in zoom-in duration-300">
                        <h3 className="text-sm font-medium text-primary">
                            {editingId ? 'Editar Origem' : 'Nova Origem'}
                        </h3>
                        <Input
                            label="Nome da Origem"
                            placeholder="Ex: Instagram, Indicação, Stand..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Descrição (Opcional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                                {editingId ? 'Atualizar Origem' : 'Salvar Origem'}
                            </Button>
                            {editingId && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setEditingId(null);
                                        setIsAdding(false);
                                        setFormData({ name: '', description: '' });
                                    }}
                                >
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    {sources.map(src => (
                        <div key={src.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                            <div className="flex items-center gap-3">
                                <Share2 className="w-5 h-5 text-primary opacity-60" />
                                <div>
                                    <p className="font-semibold text-sm">{src.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{src.description || 'Sem descrição'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEdit(src)}
                                    className="h-8 w-8"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(src.id)}
                                    className="h-8 w-8"
                                >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {sources.length === 0 && !isAdding && (
                        <p className="text-center py-8 text-muted-foreground text-sm italic">Nenhuma origem cadastrada.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default SourceManager;
