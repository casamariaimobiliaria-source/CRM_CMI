import { z } from 'zod';
import { LeadTemperature, LeadStatus } from '../types';

// Validation schema for Lead form
export const leadFormSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    telefone: z.string()
        .min(10, 'Telefone inválido')
        .max(15, 'Telefone inválido')
        .regex(/^[\d\s()-]+$/, 'Telefone deve conter apenas números'),

    email: z.string()
        .email('E-mail inválido')
        .optional()
        .or(z.literal('')),

    midia: z.string().optional(),

    dataCompra: z.string().optional(),

    corretor: z.string().optional(),

    empreendimento: z.string().optional(),
    enterprise_id: z.string().optional().or(z.literal('')),
    source_id: z.string().optional().or(z.literal('')),

    temperatura: z.nativeEnum(LeadTemperature, {
        message: 'Selecione uma temperatura válida'
    }),

    status: z.nativeEnum(LeadStatus, {
        message: 'Selecione um status válido'
    }),

    historico: z.string().optional(),

    nextContact: z.string().optional()
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

// Validation schema for Onboarding
export const onboardingSchema = z.object({
    brokerName: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(50, 'Nome muito longo')
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
