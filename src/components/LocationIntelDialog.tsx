import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from 'sonner';
import { MapPin, Navigation, Train, School, Stethoscope, TreePine, ShoppingCart, Sparkles, Wand2, Lightbulb, Copy, RefreshCw, X, Map, Building2, Download } from 'lucide-react';
import { Enterprise } from '../types';
import { googleMapsService } from '../lib/googleMapsService';

interface LocationIntelDialogProps {
    enterprise: Enterprise;
    isOpen: boolean;
    onClose: () => void;
}

export const LocationIntelDialog: React.FC<LocationIntelDialogProps> = ({ enterprise, isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [activePersona, setActivePersona] = useState<'geral' | 'investidor' | 'familia' | 'mobilidade'>('geral');
    const [aiResult, setAiResult] = useState<any>(null);

    if (!isOpen) return null;

    const formatDistance = (dist?: number) => {
        if (dist === undefined) return 'Pertinho';
        if (dist < 1000) return `${dist}m`;
        return `${(dist / 1000).toFixed(1)}km`;
    };

    const extractClosest = (poiArray?: any[]) => {
        if (!poiArray || poiArray.length === 0) return null;
        // assume sorted by distanceMeters
        return formatDistance(poiArray[0].distanceMeters);
    };

    const handleGenerateCopy = async (focus: typeof activePersona) => {
        setActivePersona(focus);
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('location-intel', {
                body: {
                    data: {
                        address: enterprise.address,
                        stats: enterprise.neighborhood_stats,
                        focus
                    }
                }
            });

            if (error) throw error;

            // Supabase sometimes returns already parsed JSON objects correctly.
            const resultObj = typeof data === 'string' ? JSON.parse(data) : data;

            setAiResult(resultObj);
            toast.success('Poderoso argumento de venda gerado!');
        } catch (error) {
            console.error('AI Copy Error:', error);
            toast.error('Erro ao gerar mensagem com a IA.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado para a área de transferência!');
    };

    const handleDownloadMap = () => {
        if (!enterprise.latitude || !enterprise.longitude) return;

        try {
            const mapUrl = googleMapsService.getStaticMapUrl(enterprise.latitude, enterprise.longitude, enterprise.neighborhood_stats);

            // Devido à Política de CORS restrita das imagens da API do Google,
            // o navegador (Chrome/Edge) bloqueia downloads feitos programaticamente via `fetch()`.
            // Para completar, se tentarmos fazer um Pop-up assíncrono, os navegadores também o bloqueiam.

            // A estratégia mais segura (Síncrona - Bypass de bloqueadores):
            const safeName = (enterprise.nome || 'Local')
                .replace(/[^a-zA-Z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '_');

            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                    <head>
                        <title>Mapa - ${safeName}</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                    </head>
                    <body style="background-color: #0f172a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; margin: 0; text-align: center; padding: 20px;">
                        <h2 style="margin-bottom: 20px; font-weight: 600; font-size: 24px;">Seu mapa em Alta Resolução está pronto! 🗺️</h2>
                        <img src="${mapUrl}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); object-fit: contain;" />
                        <p style="margin-top: 24px; color: #94a3b8; font-size: 16px;">
                            👉 Como salvar: <b style="color: white;">Clique com o botão direito na imagem</b> (ou segure pelo celular) e escolha <b>"Salvar imagem como..."</b>
                        </p>
                    </body>
                    </html>
                `);
                newWindow.document.close();
                toast.success('Mapa gerado! Acompanhe na nova aba aberta.');
            } else {
                toast.error('Por favor, permita Pop-ups para este site para visualizar o mapa.');
            }

        } catch (err) {
            console.error('Error opening map:', err);
            toast.error('Erro ao preparar o link do mapa.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm sm:p-0">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg overflow-hidden bg-background border border-border shadow-2xl rounded-[1.5rem] flex flex-col max-h-[90vh] md:max-h-[85vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-border bg-white/5 pb-4 shrink-0 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-display font-bold text-foreground">Análise de Localização</h2>
                        <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <p className="text-xs truncate max-w-[250px]">{enterprise.address || enterprise.nome}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mr-2 -mt-2 opacity-50 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto overflow-x-hidden p-6 space-y-8 flex-1 custom-scrollbar pb-12">

                    {/* Map Visual */}
                    <div className="rounded-3xl bg-secondary/30 border border-primary/20 overflow-hidden relative shadow-luxury min-h-[220px] flex flex-col justify-end group">
                        {enterprise.latitude && enterprise.longitude ? (
                            <>
                                <img
                                    src={googleMapsService.getStaticMapUrl(enterprise.latitude, enterprise.longitude, enterprise.neighborhood_stats)}
                                    alt="Mapa da Região"
                                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute top-3 right-3 z-20">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="rounded-xl h-9 w-9 bg-background/80 hover:bg-primary shadow-lg hover:text-primary-foreground backdrop-blur-md transition-all duration-300 transform md:opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-[-10px]"
                                        onClick={handleDownloadMap}
                                        title="Baixar Mapa"
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/40 via-background to-background"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Map className="w-10 h-10 text-primary/30 opacity-20 scale-150 animate-pulse-slow" />
                                </div>
                            </>
                        )}

                        {/* Gradient overlay to make text readable */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>

                        <div className="p-4 relative z-10 mt-auto pointer-events-none">
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {(enterprise.neighborhood_stats?.subway?.length ?? 0) > 0 && (
                                    <div className="bg-background/90 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-2xl text-[10px] font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
                                        <Train className="w-3.5 h-3.5" />
                                        <span>{extractClosest(enterprise.neighborhood_stats?.subway)} do Metrô</span>
                                    </div>
                                )}
                                {(enterprise.neighborhood_stats?.school?.length ?? 0) > 0 && (
                                    <div className="bg-background/90 text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-2xl text-[10px] font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
                                        <School className="w-3.5 h-3.5" />
                                        <span>{enterprise.neighborhood_stats?.school?.length} Escolas próx.</span>
                                    </div>
                                )}
                                {(enterprise.neighborhood_stats?.park?.length ?? 0) > 0 && (
                                    <div className="bg-background/90 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-2xl text-[10px] font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
                                        <TreePine className="w-3.5 h-3.5" />
                                        <span>{enterprise.neighborhood_stats?.park?.length} Parques a {extractClosest(enterprise.neighborhood_stats?.park)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* POI List */}
                    <div className="space-y-3 px-2">
                        {(enterprise.neighborhood_stats?.subway?.length ?? 0) > 0 && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500"><Train className="w-4 h-4" /></div>
                                <span className="font-bold text-foreground">{extractClosest(enterprise.neighborhood_stats?.subway)}</span>
                                <span className="text-muted-foreground">da Estação {enterprise.neighborhood_stats?.subway?.[0]?.name}</span>
                            </div>
                        )}
                        {(enterprise.neighborhood_stats?.school?.length ?? 0) > 0 && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500"><School className="w-4 h-4" /></div>
                                <span className="font-bold text-foreground">{enterprise.neighborhood_stats?.school?.length} Escolas</span>
                                <span className="text-muted-foreground">no entorno</span>
                            </div>
                        )}
                        {(enterprise.neighborhood_stats?.supermarket?.length ?? 0) > 0 && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500"><ShoppingCart className="w-4 h-4" /></div>
                                <span className="font-bold text-foreground">{enterprise.neighborhood_stats?.supermarket?.length} Mercados</span>
                                <span className="text-muted-foreground">no entorno</span>
                            </div>
                        )}
                        {(!enterprise.neighborhood_stats || Object.keys(enterprise.neighborhood_stats).length === 0) && (
                            <p className="text-xs text-muted-foreground italic text-center py-4">Nenhum dado de entorno mapeado para este local.</p>
                        )}
                    </div>

                    {!aiResult && (
                        <Button
                            className="w-full h-14 rounded-2xl shadow-luxury gap-2 text-sm font-bold tracking-wider"
                            onClick={() => handleGenerateCopy('geral')}
                            isLoading={loading}
                        >
                            <Wand2 className="w-5 h-5" />
                            Gerar Copy Automática
                        </Button>
                    )}

                    {/* AI Generated Section */}
                    <AnimatePresence>
                        {aiResult && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-6 pt-4 border-t border-border mt-6 relative"
                            >
                                {loading && (
                                    <div className="absolute inset-0 z-10 bg-card/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">Headline Sugerida</h4>
                                    <div
                                        className="group relative bg-amber-500/10 text-amber-500 border border-amber-500/20 py-5 pl-12 pr-6 rounded-2xl cursor-pointer hover:bg-amber-500/20 transition-all font-semibold italic text-sm shadow-inner min-h-[80px] flex items-center"
                                        onClick={() => copyToClipboard(aiResult.headline)}
                                    >
                                        <Lightbulb className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-60 text-amber-500" />
                                        <p className="leading-relaxed w-full">"{aiResult.headline}"</p>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-background/80 p-1.5 rounded-lg backdrop-blur-md transition-opacity">
                                            <Copy className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Personas */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant={activePersona === 'geral' ? 'primary' : 'outline'} size="sm" className="h-9 flex-1 text-[10px] uppercase tracking-wider rounded-xl font-bold" onClick={() => handleGenerateCopy('geral')}>
                                        <RefreshCw className="w-3 h-3 mr-1.5" /> Geral
                                    </Button>
                                    <Button variant={activePersona === 'investidor' ? 'primary' : 'outline'} size="sm" className={`h-9 flex-1 text-[10px] uppercase tracking-wider rounded-xl font-bold ${activePersona === 'investidor' ? 'bg-emerald-500 text-white border-transparent' : 'text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10'}`} onClick={() => handleGenerateCopy('investidor')}>
                                        Investidor
                                    </Button>
                                    <Button variant={activePersona === 'familia' ? 'primary' : 'outline'} size="sm" className={`h-9 flex-1 text-[10px] uppercase tracking-wider rounded-xl font-bold ${activePersona === 'familia' ? 'bg-blue-500 text-white border-transparent' : 'text-blue-500 border-blue-500/30 hover:bg-blue-500/10'}`} onClick={() => handleGenerateCopy('familia')}>
                                        Família
                                    </Button>
                                    <Button variant={activePersona === 'mobilidade' ? 'primary' : 'outline'} size="sm" className={`h-9 flex-1 text-[10px] uppercase tracking-wider rounded-xl font-bold ${activePersona === 'mobilidade' ? 'bg-rose-500 text-white border-transparent' : 'text-rose-500 border-rose-500/30 hover:bg-rose-500/10'}`} onClick={() => handleGenerateCopy('mobilidade')}>
                                        Mobilidade
                                    </Button>
                                </div>
                                {aiResult.resumo_bairro && (
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">Visão do Especialista (Bairro)</h4>
                                        <div
                                            className="bg-primary/5 border border-primary/20 p-4 rounded-2xl cursor-pointer hover:bg-primary/10 transition-all shadow-sm relative group flex items-start gap-3"
                                            onClick={() => copyToClipboard(aiResult.resumo_bairro)}
                                        >
                                            <div className="bg-primary/20 p-1.5 rounded-full shrink-0 mt-0.5">
                                                <MapPin className="w-4 h-4 text-primary" />
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed flex-1 text-foreground">
                                                {aiResult.resumo_bairro}
                                            </p>
                                            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 bg-background/80 p-1.5 rounded-lg backdrop-blur-md transition-opacity">
                                                <Copy className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">Destaques da Região</h4>
                                    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
                                        {aiResult.destaques?.map((d: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                                <span className="text-sm text-foreground font-medium leading-relaxed">{d}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground shadow-luxury gap-3 font-bold tracking-wider relative overflow-hidden group hover:scale-[1.02] transition-transform"
                                    onClick={() => copyToClipboard(aiResult.descricao_anuncio)}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <Copy className="w-5 h-5" />
                                        Copiar Descrição Completa
                                    </span>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
