import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useLead } from '../contexts/LeadContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { toast } from 'sonner';
import { Database, Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import EnterpriseManager from '../components/EnterpriseManager';
import SourceManager from '../components/SourceManager';

const AdminData: React.FC = () => {
    const { userProfile, impersonatedOrgId } = useUser();
    const { fetchLeads } = useLead();
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importReport, setImportReport] = useState<{ success: number; skipped: number; total: number } | null>(null);

    const currentOrgId = impersonatedOrgId || userProfile?.organization_id;

    const handleBackup = async () => {
        if (!currentOrgId) return;
        setIsBackingUp(true);
        try {
            // 1. Fetch DATA
            const [leadsRes, membersRes, orgRes] = await Promise.all([
                supabase.from('leads').select('*').eq('organization_id', currentOrgId),
                supabase.from('organization_members').select('*, users(name, email, role)').eq('organization_id', currentOrgId),
                supabase.from('organizations').select('*').eq('id', currentOrgId).single()
            ]);

            const wb = XLSX.utils.book_new();

            // LEADS Sheet
            if (leadsRes.data) {
                const leadsWs = XLSX.utils.json_to_sheet(leadsRes.data.map(l => ({
                    ID: l.id,
                    Nome: l.name,
                    Email: l.email,
                    Telefone: l.phone,
                    Status: l.status,
                    Temperatura: l.temperatura,
                    Origem: l.source,
                    Empreendimento: l.empreendimento,
                    Historico: l.historico,
                    CriadoEm: l.created_at
                })));
                XLSX.utils.book_append_sheet(wb, leadsWs, 'Leads');
            }

            // TEAM Sheet
            if (membersRes.data) {
                const teamWs = XLSX.utils.json_to_sheet(membersRes.data.map(m => ({
                    Nome: (m.users as any)?.name,
                    Email: (m.users as any)?.email,
                    Funcao: m.role,
                    IngressouEm: m.created_at
                })));
                XLSX.utils.book_append_sheet(wb, teamWs, 'Equipe');
            }

            // EXPORT
            const fileName = `Backup_${orgRes.data?.name || 'Sistema'}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            toast.success('Backup concluído com sucesso!');
        } catch (error) {
            console.error('Backup error:', error);
            toast.error('Erro ao gerar backup.');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentOrgId) return;

        setIsImporting(true);
        setImportReport(null);

        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                // Validation & Cleaning
                const toImport = data.filter(row => row.Nome && row.Telefone);

                // Fetch existing leads for duplicate check
                const { data: existingLeads } = await supabase
                    .from('leads')
                    .select('phone')
                    .eq('organization_id', currentOrgId);

                const existingPhones = new Set(existingLeads?.map(l => l.phone.replace(/\D/g, '')) || []);

                let successCount = 0;
                let skipCount = 0;

                for (const row of toImport) {
                    const cleanPhone = String(row.Telefone).replace(/\D/g, '');
                    if (existingPhones.has(cleanPhone)) {
                        skipCount++;
                        continue;
                    }

                    const { error } = await supabase.from('leads').insert({
                        name: row.Nome,
                        phone: String(row.Telefone),
                        email: row.Email || null,
                        source: row.Origem || null,
                        empreendimento: row.Empreendimento || null,
                        status: 'Ativo',
                        organization_id: currentOrgId,
                        user_id: userProfile?.id // Assigned to the importer by default
                    });

                    if (!error) successCount++;
                    else console.error('Import error for row:', row, error);
                }

                setImportReport({ success: successCount, skipped: skipCount, total: data.length });
                toast.success('Processamento concluído!');
                fetchLeads(); // Refetch leads to update UI
                setIsImporting(false);
            };
            reader.readAsBinaryString(file);
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Erro ao processar arquivo.');
            setIsImporting(false);
        }
    };

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner';

    if (!isAdmin) return <div className="p-8 text-center text-muted-foreground">Acesso negado.</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 pb-32 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground italic tracking-tighter">Administração de Dados</h1>
                <p className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase flex items-center gap-3">
                    <span className="h-[1px] w-8 bg-primary/30" />
                    Governança & Infraestrutura
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Backup Card */}
                <Card className="glass-high-fidelity rounded-[2rem] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Database className="w-24 h-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Download className="w-5 h-5 text-primary" />
                            Backup Completo
                        </CardTitle>
                        <CardDescription>Exporte todos os dados da imobiliária para Excel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-6">
                            Gera um arquivo .xlsx contendo todos os leads, histórico, equipe e configurações da conta.
                            Ideal para segurança externa ou auditoria física.
                        </p>
                        <Button
                            className="w-full h-14 rounded-2xl gap-3"
                            onClick={handleBackup}
                            isLoading={isBackingUp}
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            Baixar Backup (.xlsx)
                        </Button>
                    </CardContent>
                </Card>

                {/* Import Card */}
                <Card className="glass-high-fidelity rounded-[2rem] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Upload className="w-24 h-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Upload className="w-5 h-5 text-emerald-400" />
                            Importar Leads
                        </CardTitle>
                        <CardDescription>Carga em massa via planilha</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs space-y-2">
                            <p className="font-bold uppercase tracking-wider text-primary">Modelo de Planilha:</p>
                            <p className="text-muted-foreground">Colunas obrigatórias: <strong>Nome, Telefone</strong></p>
                            <p className="text-muted-foreground">Opcionais: <strong>Email, Origem, Empreendimento</strong></p>
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".xlsx, .csv"
                                onChange={handleImport}
                                disabled={isImporting}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <Button
                                variant="outline"
                                className="w-full h-14 rounded-2xl border-dashed gap-3 border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                                isLoading={isImporting}
                            >
                                <FileSpreadsheet className="w-5 h-5" />
                                Escolher Arquivo (.xlsx / .csv)
                            </Button>
                        </div>

                        {importReport && (
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 animate-in slide-in-from-top-2 duration-500">
                                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    Resultado da Importação
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="text-muted-foreground">Importados: <span className="text-foreground font-bold">{importReport.success}</span></div>
                                    <div className="text-muted-foreground">Duplicados: <span className="text-amber-400 font-bold">{importReport.skipped}</span></div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EnterpriseManager />
                <SourceManager />
            </div>
        </div>
    );
};

export default AdminData;
