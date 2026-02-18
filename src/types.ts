
export enum LeadTemperature {
  FRIO = 'Frio',
  MORNO = 'Morno',
  QUENTE = 'Quente'
}

export enum LeadStatus {
  ATIVO = 'Ativo',
  AGENDOU = 'Agendou',
  NAO_RESPONDE = 'Não Responde',
  COMPROU = 'Comprou',
  PERDIDO = 'Inativo'
}

export interface Organization {
  id: string;
  name: string;
  plan_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'paused';
  max_leads: number;
  max_users: number;
  stripe_customer_id?: string;
  logo_url?: string;
  brand_display_name?: string;
}

export interface SystemSettings {
  id: string;
  app_name: string;
  app_logo_url?: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'member';
  organization_id: string;
  organization?: Organization;
  is_super_admin?: boolean;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  midia?: string;
  data_compra?: string;
  corretor?: string;
  empreendimento?: string;
  temperatura: LeadTemperature;
  status: LeadStatus;
  historico?: string;
  proximo_contato?: string;
  createdAt: string;
  empreendimento_id?: string;
  origem_id?: string;
  user_id?: string;
  organization_id?: string;
  synced?: boolean;
}

export type LeadFormData = Omit<Lead, 'id' | 'createdAt' | 'synced'>;
