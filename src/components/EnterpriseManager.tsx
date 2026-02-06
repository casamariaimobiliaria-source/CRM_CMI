import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { toast } from 'sonner';
import { Building2, X, Plus, Pencil, Trash2 } from 'lucide-react';

interface Enterprise {
    id: string;
    organization_id: string;
    name: string;
    address: string;
    manager_name: string;
    manager_phone: string;
    developer_name: string;
}

const EnterpriseManager: React.FC = () => {
    const { userProfile } = useUser();
    const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        manager_name: '',
        manager_phone: '',
        developer_name: ''
    });

    const fetchEnterprises = async () => {
        if (!userProfile?.organization_id) return;
        try {
            const { data, error } = await supabase
                .from('enterprises')
                .select('*')
                .eq('organization_id', userProfile.organization_id)
                .order('name');
            if (error) throw error;
            setEnterprises(data || []);
        } catch (error) {
            console.error('Error fetching enterprises:', error);
            toast.error('Erro ao carregar empreendimentos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEnterprises(); }, [userProfile?.organization_id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile?.organization_id) return;

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('enterprises')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success('Empreendimento atualizado!');
            } else {
                const { error } = await supabase
                    .from('enterprises')
                    .insert({
                        ...formData,
                        organization_id: userProfile.organization_id
                    });
                if (error) throw error;
                toast.success('Empreendimento cadastrado!');
            }
            setFormData({ name: '', address: '', manager_name: '', manager_phone: '', developer_name: '' });
            setIsAdding(false);
            setEditingId(null);
            fetchEnterprises();
        } catch (error) {
            console.error('Error saving enterprise:', error);
            const msg = error instanceof Error ? error.message : JSON.stringify(error);
            toast.error(`Erro ao salvar empreendimento: ${msg}`);
        }
    };

    const startEdit = (ent: Enterprise) => {
        setFormData({
            name: ent.name,
            address: ent.address || '',
            manager_name: ent.manager_name || '',
            manager_phone: ent.manager_phone || '',
            developer_name: ent.developer_name || ''
        });
        setEditingId(ent.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este empreendimento?')) return;
        try {
            const { error } = await supabase
                .from('enterprises')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Empreendimento excluído.');
            fetchEnterprises();
        } catch (error) {
            console.error('Error deleting enterprise:', error);
            toast.error('Erro ao excluir empreendimento.');
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <Card className="glass-high-fidelity rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl">Empreendimentos</CardTitle>
                    <CardDescription>Cadastre os projetos da imobiliária</CardDescription>
                </div>
                <Button
                    size="icon"
                    variant={(isAdding || editingId) ? 'ghost' : 'primary'}
                    onClick={() => {
                        if (isAdding || editingId) {
                            setIsAdding(false);
                            setEditingId(null);
                            setFormData({ name: '', address: '', manager_name: '', manager_phone: '', developer_name: '' });
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
                            {editingId ? 'Editar Empreendimento' : 'Novo Empreendimento'}
                        </h3>
                        <Input
                            label="Nome do Empreendimento"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Incorporadora"
                            value={formData.developer_name}
                            onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Gerente"
                                value={formData.manager_name}
                                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                            />
                            <Input
                                label="Tel. Gerente"
                                value={formData.manager_phone}
                                onChange={(e) => setFormData({ ...formData, manager_phone: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Endereço Completo"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                                {editingId ? 'Atualizar Empreendimento' : 'Salvar Empreendimento'}
                            </Button>
                            {editingId && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setEditingId(null);
                                        setIsAdding(false);
                                        setFormData({ name: '', address: '', manager_name: '', manager_phone: '', developer_name: '' });
                                    }}
                                >
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    {enterprises.map(ent => (
                        <div key={ent.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-primary opacity-60" />
                                <div>
                                    <p className="font-semibold text-sm">{ent.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{ent.developer_name || 'Incorporadora não informada'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEdit(ent)}
                                    className="h-8 w-8"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(ent.id)} className="h-8 w-8">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {enterprises.length === 0 && !isAdding && (
                        <p className="text-center py-8 text-muted-foreground text-sm italic">Nenhum empreendimento cadastrado.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EnterpriseManager;
