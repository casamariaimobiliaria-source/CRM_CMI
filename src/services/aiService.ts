import { supabase } from '../lib/supabase';

export interface AIAnalysisResult {
    status: 'quente' | 'morno' | 'frio';
    insights: string[];
    suggestao: string;
    copy_local?: string;
    error?: string;
}

/**
 * Invoca a Edge Function ai-assistant para analisar dados do Lead ou Dashboard
 */
export const getAIAnalysis = async (dados: any): Promise<AIAnalysisResult> => {
    try {
        console.log('🤖 AI Service: Invocando ai-assistant com dados:', dados);

        const { data, error } = await supabase.functions.invoke('ai-assistant', {
            body: { data: dados }
        });

        if (error) {
            console.error('❌ AI Service Error (Supabase):', error);
            throw error;
        }

        console.log('✅ AI Service Result:', data);
        return data as AIAnalysisResult;
    } catch (error: any) {
        console.error('❌ AI Service Exception:', error);
        return {
            status: 'morno',
            insights: ['Não foi possível gerar insights técnicos no momento.'],
            suggestao: 'Verifique sua conexão ou tente novamente mais tarde.',
            error: error.message || 'Erro desconhecido na comunicação com a IA'
        };
    }
};
