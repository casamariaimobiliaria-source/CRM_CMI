import OpenAI from 'openai';
import { Lead } from '../types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
    console.warn('OpenAI: VITE_OPENAI_API_KEY não encontrada no ambiente.');
} else {
    console.log('OpenAI: Chave API detectada.');
}

// Inicializa o cliente apenas se a chave existir
const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
}) : null;

/**
 * Gera sugestões de abordagem via WhatsApp baseadas no histórico do Lead.
 */
export async function generateWhatsAppSuggestions(lead: Lead) {
    if (!openai) {
        console.warn('OpenAI: Chave API não configurada.');
        return null;
    }
    const prompt = `
        Você é um assistente de vendas de elite para corretores de imóveis.
        Analise o seguinte Lead e sugira 3 opções de abordagem inicial via WhatsApp.
        
        NOME DO LEAD: ${lead.nome}
        EMPREENDIMENTO INTERESSADO: ${lead.empreendimento || 'Não informado'}
        TEMPERATURA: ${lead.temperatura}
        HISTÓRICO/NOTAS: ${lead.historico || 'Nenhum histórico registrado'}
        MÍDIA DE ORIGEM: ${lead.midia || 'Não informada'}
        
        REGRAS:
        1. Opção 1: Direta e Profissional (Focada em agendar visita).
        2. Opção 2: Persuasiva (Focada em um benefício do empreendimento ou urgência).
        3. Opção 3: Consultiva (Focada em entender as necessidades antes de oferecer).
        
        FORMATO DE RESPOSTA (OBRIGATÓRIO): Retorne APENAS um JSON válido. Não use blocos de código ou explicações.
        ESTRUTURA:
        {
          "opcoes": [
            { "titulo": "Profissional", "texto": "Texto aqui..." },
            { "titulo": "Persuasiva", "texto": "Texto aqui..." },
            { "titulo": "Consultiva", "texto": "Texto aqui..." }
          ]
        }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        console.log('OpenAI raw response (WhatsApp):', content);
        if (!content) return null;

        const parsed = JSON.parse(content);
        // Garantir que a estrutura básica exista
        if (!parsed.opcoes || !Array.isArray(parsed.opcoes)) {
            console.error('OpenAI: JSON retornado não contém a lista "opcoes".');
            return null;
        }
        return parsed;
    } catch (error) {
        console.error('Erro OpenAI WhatsApp:', error);
        return null;
    }
}

/**
 * Gera um resumo rápido e análise de saúde do lead.
 */
export async function analyzeLeadProfile(lead: Lead) {
    if (!openai) return null;
    const prompt = `
        Analise este lead imobiliário e forneça um resumo curtinho (no máximo 2 frases) e uma dica estratégica.
        Lead: ${lead.nome}
        Status Atual: ${lead.status}
        Histórico: ${lead.historico || 'Sem histórico'}
        
        FORMATO: JSON { "resumo": "...", "dica": "..." }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        console.log('OpenAI raw response (Analysis):', content);
        if (!content) return null;

        const parsed = JSON.parse(content);
        if (!parsed.resumo || !parsed.dica) {
            console.error('OpenAI: JSON de análise incompleto.');
            return null;
        }
        return parsed;
    } catch (error) {
        console.error('Erro OpenAI Análise:', error);
        return null;
    }
}

/**
 * Gera insights executivos para o Dashboard baseados no volume geral de leads.
 */
export async function getExecutiveInsights(leads: Lead[]) {
    if (!openai) return null;
    // Pegamos apenas dados essenciais para economizar tokens e privacidade
    const leadDataSummary = leads.map(l => ({
        status: l.status,
        temp: l.temperatura,
        midia: l.midia,
        created: l.createdAt
    }));

    const prompt = `
        Você é um consultor estratégico de negócios imobiliários.
        Analise os dados simplificados de ${leads.length} leads desta imobiliária e dê um insight "executivo" (direto ao ponto) sobre a saúde da operação.
        
        DADOS: ${JSON.stringify(leadDataSummary.slice(0, 100))} // Limitado a 100 para o prompt não estourar
        
        Foque em: Gargalos (leads parados), Qualidade da Mídia ou Tendência de conversão.
        Retorne um JSON: { "insight": "...", "prioridade": "alta/media/baixa", "acao_sugerida": "..." }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        console.log('OpenAI raw response (Executive):', content);
        if (!content) return null;

        const parsed = JSON.parse(content);
        if (!parsed.insight) {
            console.error('OpenAI: JSON executivo incompleto.');
            return null;
        }
        return parsed;
    } catch (error) {
        console.error('Erro OpenAI Executivo:', error);
        return null;
    }
}
