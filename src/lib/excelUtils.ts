import * as XLSX from 'xlsx';
import { Lead } from '../types';
import { format } from 'date-fns';

export const exportLeadsToExcel = (leads: Lead[]) => {
    // Map leads to a flatter structure for Excel
    const dataToExport = leads.map(lead => ({
        'Nome': lead.nome,
        'Telefone': lead.telefone,
        'E-mail': lead.email || '',
        'Empreendimento': lead.empreendimento || 'Geral',
        'Mídia/Origem': lead.midia || '',
        'Temperatura': lead.temperatura,
        'Status': lead.status,
        'Corretor': lead.corretor || '',
        'Data de Cadastro': format(new Date(lead.createdAt), 'dd/MM/yyyy HH:mm'),
        'Histórico': lead.historico || ''
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    // Fix column widths
    const max_width = dataToExport.reduce((w, r) => Math.max(w, r.Nome.length), 10);
    worksheet['!cols'] = [
        { wch: max_width + 5 }, // Nome
        { wch: 20 }, // Telefone
        { wch: 25 }, // E-mail
        { wch: 20 }, // Empreendimento
        { wch: 15 }, // Mídia
        { wch: 12 }, // Temperatura
        { wch: 12 }, // Status
        { wch: 20 }, // Corretor
        { wch: 20 }, // Data
        { wch: 50 }  // Histórico
    ];

    // Generate filename with current date
    const fileName = `leads_imob_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;

    // Trigger download
    XLSX.writeFile(workbook, fileName);
};
