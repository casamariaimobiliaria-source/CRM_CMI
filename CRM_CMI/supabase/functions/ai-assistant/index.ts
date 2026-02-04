import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { data } = await req.json();

        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not configured in Supabase Secrets.");
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Você é um assistente de elite para corretores de imóveis. Responda apenas em JSON puro, sem markdown ou blocos de código."
                    },
                    {
                        role: "user",
                        content: `Analise estes dados e retorne um JSON com: status (string curta: 'quente', 'morno' ou 'frio'), insights (array de exatamente 3 strings curtas e diretas) e sugestao (string de dica estratégica de apenas 1 frase). Dados: ${JSON.stringify(data)}`
                    }
                ],
                response_format: { type: "json_object" }
            }),
        });

        const completion = await response.json();

        if (!completion || completion.error) {
            throw new Error(completion.error?.message || "OpenAI API returned an error.");
        }

        if (!completion.choices || completion.choices.length === 0) {
            throw new Error("A IA não retornou nenhuma opção de resposta válida.");
        }

        const result = completion.choices[0].message.content;

        return new Response(result, {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: error.message,
            status: 'morno',
            insights: ['Erro técnico na análise.'],
            suggestao: 'Por favor, tente novamente em instantes.'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
