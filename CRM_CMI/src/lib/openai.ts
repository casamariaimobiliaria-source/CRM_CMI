import OpenAI from 'openai';
import { Lead } from '../types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Sistema de diagnóstico detalhado
export const diagnosticInfo = {
    hasKey: !!apiKey,
    keyFormat: apiKey ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` : 'N/A',
    keyLength: apiKey?.length || 0,
    isValidFormat: apiKey?.startsWith('sk-') || false,
    timestamp: new Date().toISOString()
};

if (!apiKey) {
    console.error('🔴 OpenAI: VITE_OPENAI_API_KEY não encontrada no ambiente.');
    console.error('📋 Diagnóstico:', diagnosticInfo);
} else if (!diagnosticInfo.isValidFormat) {
    console.warn('⚠️ OpenAI: Formato de chave suspeito (não começa com "sk-")');
    console.warn('📋 Diagnóstico:', diagnosticInfo);
} else {
    console.log('✅ OpenAI: Chave API detectada e validada.');
    console.log('📋 Diagnóstico:', diagnosticInfo);
}

// Inicializa o cliente apenas se a chave existir
const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
}) : null;

// Tipos de erro customizados
export class OpenAIError extends Error {
    constructor(
        message: string,
        public type: 'auth' | 'quota' | 'rate_limit' | 'network' | 'parse' | 'unknown',
        public userMessage: string,
        public originalError?: any
    ) {
        super(message);
        this.name = 'OpenAIError';
    }
}

// Função auxiliar para retry com backoff exponencial
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 2,
    baseDelay = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Não fazer retry em erros de autenticação ou quota
            if (error instanceof OpenAIError && ['auth', 'quota'].includes(error.type)) {
                throw error;
            }

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`⏳ Tentativa ${attempt + 1}/${maxRetries + 1} falhou. Aguardando ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

// Função para tratar erros da OpenAI
function handleOpenAIError(error: any): never {
    console.error('🔴 Erro OpenAI completo:', error);

    // Tentar extrair informações úteis do erro
    const status = error?.status || error?.response?.status;
    const errorCode = error?.error?.code || error?.code;
    const errorMessage = error?.message || error?.error?.message || 'Erro sem mensagem técnica';

    // Log detalhado no console para depuração
    console.group('🔍 Detalhes Técnicos do Erro OpenAI');
    console.log('Status:', status);
    console.log('Código:', errorCode);
    console.log('Mensagem:', errorMessage);
    console.log('Objeto Original:', error);
    console.groupEnd();

    // Erro de autenticação
    if (status === 401 || error?.error?.type === 'invalid_request_error') {
        throw new OpenAIError(
            'Chave API inválida ou expirada',
            'auth',
            '🔑 Chave API inválida ou expirada. Verifique sua configuração no arquivo .env',
            error
        );
    }

    // Erro de permissão / Modelo não encontrado
    if (status === 403 || status === 404) {
        throw new OpenAIError(
            `Erro de acesso (${status})`,
            'auth',
            `🚫 Erro de acesso (${status}). O modelo pode não estar disponível para sua chave ou a chave não tem permissão.`,
            error
        );
    }

    // Erro de quota/billing
    if (status === 429 || errorCode === 'insufficient_quota') {
        throw new OpenAIError(
            'Quota da API excedida',
            'quota',
            '💳 Limite de uso da OpenAI atingido. Verifique seus créditos em platform.openai.com',
            error
        );
    }

    // Rate limit
    if (status === 429 && error?.error?.type === 'rate_limit_exceeded') {
        throw new OpenAIError(
            'Rate limit excedido',
            'rate_limit',
            '⏱️ Muitas requisições. Aguarde alguns segundos e tente novamente.',
            error
        );
    }

    // Erro de rede
    const isNetworkError =
        errorMessage.toLowerCase().includes('fetch') ||
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('connection error') ||
        status === 0;

    if (isNetworkError) {
        throw new OpenAIError(
            'Erro de conexão',
            'network',
            '🌐 Erro de conexão com a OpenAI. Verifique sua internet ou se há bloqueio de extensões (AdBlock/Firewall).',
            error
        );
    }

    // Erro de parsing JSON
    if (error instanceof SyntaxError) {
        throw new OpenAIError(
            'Erro ao processar resposta da IA',
            'parse',
            '⚠️ A IA retornou dados em formato inesperado. Tente novamente.',
            error
        );
    }

    // Erro desconhecido
    throw new OpenAIError(
        errorMessage,
        'unknown',
        `❌ Erro inesperado: ${errorMessage.substring(0, 100)}${errorMessage.length > 100 ? '...' : ''}. Tente novamente mais tarde.`,
        error
    );
}

/**
 * Gera sugestões de abordagem via WhatsApp baseadas no histórico do Lead.
 */
export async function generateWhatsAppSuggestions(lead: Lead) {
    if (!openai) {
        throw new OpenAIError(
            'Cliente OpenAI não inicializado',
            'auth',
            '🔑 Chave API não configurada. Adicione VITE_OPENAI_API_KEY no arquivo .env'
        );
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
        return await retryWithBackoff(async () => {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            console.log('✅ OpenAI raw response (WhatsApp):', content);

            if (!content) {
                throw new Error('Resposta vazia da OpenAI');
            }

            const parsed = JSON.parse(content);

            // Validação robusta da estrutura
            if (!parsed.opcoes || !Array.isArray(parsed.opcoes)) {
                console.error('❌ OpenAI: JSON retornado não contém a lista "opcoes".');
                throw new SyntaxError('Estrutura JSON inválida: falta campo "opcoes"');
            }

            if (parsed.opcoes.length === 0) {
                console.error('❌ OpenAI: Lista de opções está vazia.');
                throw new SyntaxError('Lista de opções vazia');
            }

            // Validar cada opção
            for (const op of parsed.opcoes) {
                if (!op.texto || typeof op.texto !== 'string') {
                    console.error('❌ OpenAI: Opção sem texto válido:', op);
                    throw new SyntaxError('Opção sem campo "texto" válido');
                }
            }

            return parsed;
        });
    } catch (error) {
        handleOpenAIError(error);
    }
}

/**
 * Gera um resumo rápido e análise de saúde do lead.
 */
export async function analyzeLeadProfile(lead: Lead) {
    if (!openai) {
        throw new OpenAIError(
            'Cliente OpenAI não inicializado',
            'auth',
            '🔑 Chave API não configurada. Adicione VITE_OPENAI_API_KEY no arquivo .env'
        );
    }

    const prompt = `
        Analise este lead imobiliário e forneça um resumo curtinho (no máximo 2 frases) e uma dica estratégica.
        Lead: ${lead.nome}
        Status Atual: ${lead.status}
        Histórico: ${lead.historico || 'Sem histórico'}
        
        FORMATO: JSON { "resumo": "...", "dica": "..." }
    `;

    try {
        return await retryWithBackoff(async () => {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            console.log('✅ OpenAI raw response (Analysis):', content);

            if (!content) {
                throw new Error('Resposta vazia da OpenAI');
            }

            const parsed = JSON.parse(content);

            if (!parsed.resumo || !parsed.dica) {
                console.error('❌ OpenAI: JSON de análise incompleto.');
                throw new SyntaxError('Estrutura JSON inválida: falta "resumo" ou "dica"');
            }

            return parsed;
        });
    } catch (error) {
        handleOpenAIError(error);
    }
}

/**
 * Gera insights executivos para o Dashboard baseados no volume geral de leads.
 */
export async function getExecutiveInsights(leads: Lead[]) {
    if (!openai) {
        throw new OpenAIError(
            'Cliente OpenAI não inicializado',
            'auth',
            '🔑 Chave API não configurada. Adicione VITE_OPENAI_API_KEY no arquivo .env'
        );
    }

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
        return await retryWithBackoff(async () => {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            console.log('✅ OpenAI raw response (Executive):', content);

            if (!content) {
                throw new Error('Resposta vazia da OpenAI');
            }

            const parsed = JSON.parse(content);

            if (!parsed.insight) {
                console.error('❌ OpenAI: JSON executivo incompleto.');
                throw new SyntaxError('Estrutura JSON inválida: falta campo "insight"');
            }

            return parsed;
        });
    } catch (error) {
        handleOpenAIError(error);
    }
}
