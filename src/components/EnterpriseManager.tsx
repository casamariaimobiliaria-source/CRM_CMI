import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { toast } from 'sonner';
import {
    Building2, X, Plus, Pencil, Trash2, MapPin, Search,
    Train, School, Stethoscope, TreePine, ShoppingCart,
    Navigation, Loader2, Sparkles
} from 'lucide-react';
import { googleMapsService } from '../lib/googleMapsService';
import { LocationIntelDialog } from './LocationIntelDialog';
import { ConfirmDialog } from './ConfirmDialog';

interface Enterprise {
    id: string;
    organization_id: string;
    nome: string;
    address: string;
    manager_name: string;
    manager_phone: string;
    developer_name: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    zip_code?: string;
    place_id?: string;
    neighborhood_stats?: Record<string, any>;
}

const EnterpriseManager: React.FC = () => {
    const { userProfile } = useUser();
    const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedEnterpriseForIntel, setSelectedEnterpriseForIntel] = useState<Enterprise | null>(null);

    const initialFormState = {
        nome: '',
        address: '',
        manager_name: '',
        manager_phone: '',
        developer_name: '',
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
        city: '',
        state: '',
        zip_code: '',
        place_id: '',
        neighborhood_stats: {} as Record<string, any>
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchEnterprises = useCallback(async () => {
        if (!userProfile?.organization_id) return;
        try {
            const { data, error } = await supabase
                .from('empreendimentos')
                .select('*')
                .eq('organization_id', userProfile.organization_id)
                .order('nome');
            if (error) throw error;
            setEnterprises(data || []);
        } catch (error) {
            console.error('Error fetching enterprises:', error);
            toast.error('Erro ao carregar empreendimentos.');
        } finally {
            setLoading(false);
        }
    }, [userProfile?.organization_id]);

    useEffect(() => {
        fetchEnterprises();
    }, [fetchEnterprises]);

    const handleAddressSearch = async () => {
        if (!formData.address) {
            toast.error('Digite um endereço para localizar.');
            return;
        }
        setIsAnalyzing(true);
        try {
            const result = await googleMapsService.geocodeAddress(formData.address);

            // Search for nearby POIs
            const pois = await googleMapsService.findNearbyPOIs(result.lat, result.lng);

            setFormData(prev => ({
                ...prev,
                address: result.formattedAddress,
                latitude: result.lat,
                longitude: result.lng,
                city: result.city || prev.city,
                state: result.state || prev.state,
                zip_code: result.zipCode || prev.zip_code,
                place_id: result.placeId,
                neighborhood_stats: pois
            }));

            toast.success('Localização e entorno identificados com sucesso!');
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Erro ao localizar endereço. Tente ser mais específico.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile?.organization_id) return;

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('empreendimentos')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success('Empreendimento atualizado!');
            } else {
                const { error } = await supabase
                    .from('empreendimentos')
                    .insert({
                        ...formData,
                        organization_id: userProfile.organization_id
                    });
                if (error) throw error;
                toast.success('Empreendimento cadastrado!');
            }
            resetForm();
            fetchEnterprises();
        } catch (error) {
            console.error('Error saving enterprise:', error);
            toast.error('Erro ao salvar empreendimento.');
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setIsAdding(false);
        setEditingId(null);
    };

    const startEdit = (ent: Enterprise) => {
        setFormData({
            nome: ent.nome,
            address: ent.address || '',
            manager_name: ent.manager_name || '',
            manager_phone: ent.manager_phone || '',
            developer_name: ent.developer_name || '',
            latitude: ent.latitude,
            longitude: ent.longitude,
            city: ent.city || '',
            state: ent.state || '',
            zip_code: ent.zip_code || '',
            place_id: ent.place_id || '',
            neighborhood_stats: ent.neighborhood_stats || {}
        });
        setEditingId(ent.id);
        setIsAdding(true);
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            const { error } = await supabase
                .from('empreendimentos')
                .delete()
                .eq('id', deleteModal.id);
            if (error) throw error;
            toast.success('Empreendimento excluído.');
            fetchEnterprises();
        } catch (error) {
            console.error('Error deleting enterprise:', error);
            toast.error('Erro ao excluir empreendimento.');
        } finally {
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Carregando empreendimentos...</p>
        </div>
    );

    const isCorretor = userProfile?.role === 'member';

    return (
        <>
            <Card className="glass-high-fidelity rounded-[2rem] overflow-hidden border-white/10">
                <CardHeader className="flex flex-row items-center justify-between bg-white/5">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Empreendimentos
                        </CardTitle>
                        <CardDescription>Gestão centralizada de projetos e localizações</CardDescription>
                    </div>
                    {!isCorretor && (
                        <Button
                            size="icon"
                            variant={(isAdding || editingId) ? 'ghost' : 'primary'}
                            onClick={() => (isAdding || editingId) ? resetForm() : setIsAdding(true)}
                            className="rounded-full h-10 w-10"
                        >
                            {(isAdding || editingId) ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                    {(isAdding || editingId) && (
                        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Nome do Empreendimento"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        required
                                        placeholder="Ex: Residencial Naeem"
                                    />
                                    <Input
                                        label="Incorporadora"
                                        value={formData.developer_name}
                                        onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
                                        placeholder="Ex: Mitre"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Gerente Responsável"
                                        value={formData.manager_name}
                                        onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                                        placeholder="Nome do gerente"
                                    />
                                    <Input
                                        label="Telefone do Gerente"
                                        value={formData.manager_phone}
                                        onChange={(e) => setFormData({ ...formData, manager_phone: e.target.value })}
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Input
                                            label="Endereço Completo"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Rua, número, bairro, cidade..."
                                            className="pr-24"
                                        />
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            className="absolute right-1.5 top-[34px] rounded-xl h-9"
                                            onClick={handleAddressSearch}
                                            isLoading={isAnalyzing}
                                        >
                                            <Search className="w-4 h-4 mr-2" />
                                            Buscar
                                        </Button>
                                    </div>

                                    {formData.latitude && (
                                        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-4 animate-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                                <div className="flex items-center gap-2 text-primary">
                                                    <Navigation className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Inteligência de Localização</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground">{formData.latitude.toFixed(6)}, {formData.longitude?.toFixed(6)}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center gap-1 group hover:bg-blue-500/20 transition-colors">
                                                    <Train className="w-4 h-4 text-blue-400" />
                                                    <span className="text-[9px] font-bold uppercase text-blue-300">Metrô</span>
                                                    <span className="text-xs font-bold text-white">{formData.neighborhood_stats?.subway?.length || 0}</span>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center gap-1 group hover:bg-amber-500/20 transition-colors">
                                                    <School className="w-4 h-4 text-amber-400" />
                                                    <span className="text-[9px] font-bold uppercase text-amber-300">Escolas</span>
                                                    <span className="text-xs font-bold text-white">{formData.neighborhood_stats?.school?.length || 0}</span>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center gap-1 group hover:bg-rose-500/20 transition-colors">
                                                    <Stethoscope className="w-4 h-4 text-rose-400" />
                                                    <span className="text-[9px] font-bold uppercase text-rose-300">Saúde</span>
                                                    <span className="text-xs font-bold text-white">{formData.neighborhood_stats?.hospital?.length || 0}</span>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center gap-1 group hover:bg-emerald-500/20 transition-colors">
                                                    <TreePine className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-[9px] font-bold uppercase text-emerald-300">Parques</span>
                                                    <span className="text-xs font-bold text-white">{formData.neighborhood_stats?.park?.length || 0}</span>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center gap-1 group hover:bg-orange-500/20 transition-colors">
                                                    <ShoppingCart className="w-4 h-4 text-orange-400" />
                                                    <span className="text-[9px] font-bold uppercase text-orange-300">Mercados</span>
                                                    <span className="text-xs font-bold text-white">{formData.neighborhood_stats?.supermarket?.length || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <Input
                                            label="CEP"
                                            value={formData.zip_code}
                                            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                            placeholder="00000-000"
                                        />
                                        <Input
                                            label="Cidade"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="Nome da cidade"
                                        />
                                        <Input
                                            label="UF"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            placeholder="SP"
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" className="flex-1 rounded-[1.5rem] h-14 text-lg font-bold shadow-xl shadow-primary/20">
                                    {editingId ? 'Atualizar Empreendimento' : 'Salvar Empreendimento'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={resetForm}
                                    className="rounded-[1.5rem] h-14 px-8"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-2">Empreendimentos Ativos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {enterprises.map(ent => (
                                <div key={ent.id} className="group relative p-5 rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all duration-500 border border-white/5 hover:border-primary/30 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg leading-tight">{ent.nome}</h4>
                                                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{ent.developer_name || 'Individual'}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                            {!isCorretor && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => startEdit(ent)}
                                                    className="h-9 w-9 rounded-xl hover:bg-primary/20 hover:text-primary"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSelectedEnterpriseForIntel(ent)}
                                                className="h-9 w-9 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-500"
                                                title="Análise Inteligente e Gerador de Ads"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                            </Button>
                                            {!isCorretor && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteModal({ isOpen: true, id: ent.id })}
                                                    className="h-9 w-9 rounded-xl hover:bg-destructive/20 hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {ent.address && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <p className="text-xs truncate">{ent.address}</p>
                                        </div>
                                    )}

                                    {ent.latitude && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className="px-2 py-1 rounded-lg bg-white/5 text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                                                <Navigation className="w-3 h-3" />
                                                GEOLOCALIZADO
                                            </span>
                                            {ent.city && (
                                                <span className="px-2 py-1 rounded-lg bg-primary/5 text-[9px] font-bold text-primary/70 uppercase">
                                                    {ent.city}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {enterprises.length === 0 && !isAdding && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                <Building2 className="w-12 h-12 text-muted-foreground/20 mb-4" />
                                <p className="text-muted-foreground text-sm font-medium">Nenhum empreendimento cadastrado.</p>
                                <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)} className="mt-4 text-primary">
                                    Cadastrar o primeiro
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            {selectedEnterpriseForIntel && (
                <LocationIntelDialog
                    enterprise={selectedEnterpriseForIntel}
                    isOpen={!!selectedEnterpriseForIntel}
                    onClose={() => setSelectedEnterpriseForIntel(null)}
                />
            )}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Excluir Empreendimento"
                description="Tem certeza que deseja excluir este empreendimento? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
            />
        </>
    );
};

export default EnterpriseManager;

