
import { Lead } from '../types';

const formatBRDate = (dateIso: string): string => {
  try {
    const d = new Date(dateIso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', '');
  } catch (e) {
    return dateIso;
  }
};

const parseDate = (dateStr: any): string => {
  if (!dateStr) return new Date().toISOString();
  if (String(dateStr).includes('T')) return dateStr;

  try {
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const parts = dateStr.split(' ')[0].split('/');
      if (parts.length === 3) {
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        return d.toISOString();
      }
    }
    return new Date(dateStr).toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export const syncLeadToSheet = async (webhookUrl: string, lead: Lead, isUpdate: boolean = false): Promise<boolean> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

  try {
    const formData = new URLSearchParams();

    // Parâmetros de controle para o Script
    formData.append('action', isUpdate ? 'UPDATE' : 'SAVE');
    formData.append('isUpdate', isUpdate ? 'true' : 'false');

    // Dados mapeados para as colunas da planilha
    formData.append('ID', lead.id);
    formData.append('Data', formatBRDate(lead.createdAt));
    formData.append('Nome', lead.nome);
    formData.append('Telefone', lead.telefone);
    formData.append('e-mail', lead.email || '');
    formData.append('Mídia', lead.midia || '');
    formData.append('Corretor', lead.corretor || '');
    formData.append('Empreendimento', lead.empreendimento || '');
    formData.append('Temperatura', lead.temperatura);
    formData.append('Status', lead.status);
    formData.append('Observação', lead.historico || '');

    console.log(`[Sync] Enviando ${isUpdate ? 'UPDATE' : 'INSERT'} para ID: ${lead.id}`);

    // Google Apps Script exige no-cors para evitar erros de pré-verificação do navegador
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    return true;
  } catch (error) {
    console.error("Erro ao sincronizar com Google Sheets:", error);
    return false;
  }
};

export const fetchLeadsFromSheet = async (webhookUrl: string, brokerName: string): Promise<Lead[] | null> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return null;

  try {
    const urlWithParams = new URL(webhookUrl);
    urlWithParams.searchParams.append('action', 'FETCH');
    urlWithParams.searchParams.append('broker', brokerName.trim());

    const response = await fetch(urlWithParams.toString(), { method: 'GET' });
    if (!response.ok) return null;

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: String(item.ID || item.id || ""),
        createdAt: parseDate(item.Data || item.data || item.createdAt),
        nome: item.Nome || item.nome || 'Sem Nome',
        telefone: item.Telefone || item.telefone || '',
        email: item['e-mail'] || item.email || '',
        midia: item.Mídia || item.midia || '',
        corretor: String(item.Corretor || item.corretor || '').trim(),
        empreendimento: item.Empreendimento || item.empreendimento || '',
        temperatura: (item.Temperatura || item.temperatura || 'Frio') as any,
        status: (item.Status || item.status || 'Ativo') as any,
        historico: item.Observação || item.observacao || item.historico || '',
        synced: true
      })) as Lead[];
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return null;
  }
};
