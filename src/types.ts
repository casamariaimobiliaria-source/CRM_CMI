
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
  subscription_status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'paused' | 'inactive';
  max_leads: number;
  max_users: number;
  leads_limit: number;
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
  phone?: string;
  role: 'admin' | 'owner' | 'member';
  organization_id: string;
  organization?: Organization;
  is_super_admin?: boolean;
  is_active?: boolean;
}

export enum InteractionType {
  WHATSAPP = 'WhatsApp / Ligação',
  REUNIAO = 'Reunião Online',
  VISITA = 'Visita Presencial',
  OUTRO = 'Outro'
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
  tipo_proximo_contato?: InteractionType | string;
  createdAt: string;
  empreendimento_id?: string;
  origem_id?: string;
  user_id?: string;
  organization_id?: string;
  synced?: boolean;
  valor?: number;
  updated_at?: string;
  updated_by?: string;
}

export type LeadFormData = Omit<Lead, 'id' | 'createdAt' | 'synced'>;

export interface Enterprise {
  id: string;
  organization_id: string;
  nome: string;
  address: string;
  manager_name: string;
  manager_phone: string;
  developer_name: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  zip_code?: string;
  place_id?: string;
  neighborhood_stats?: Record<string, any>;
  created_at?: string;
}
