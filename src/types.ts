
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
  PERDIDO = 'Perdido'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'member';
  organization_id: string;
  organization_name?: string;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  midia?: string;
  dataCompra?: string;
  corretor?: string;
  empreendimento?: string;
  temperatura: LeadTemperature;
  status: LeadStatus;
  historico?: string;
  nextContact?: string;
  createdAt: string;
  user_id?: string;
  organization_id?: string;
  synced?: boolean;
}

export type LeadFormData = Omit<Lead, 'id' | 'createdAt' | 'synced'>;
