import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Lead, LeadFormData } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';

interface LeadContextType {
  leads: Lead[];
  isSyncing: boolean;
  addLead: (lead: LeadFormData) => Promise<void>;
  updateLead: (id: string, lead: Partial<LeadFormData>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  fetchLeads: () => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const { userProfile, impersonatedOrgId } = useUser();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const mapLeadFromDB = (l: any): Lead => ({
    ...l,
    nome: l.nome || l.name || '',
    telefone: l.telefone || l.phone || '',
    midia: l.midia || l.source || '',
    empreendimento_id: l.empreendimento_id || l.enterprise_id,
    origem_id: l.origem_id || l.source_id,
    createdAt: l.created_at,
    data_compra: l.data_compra,
    proximo_contato: l.proximo_contato || l.next_contact
  });

  const fetchLeads = useCallback(async () => {
    if (!session) return;

    setIsSyncing(true);
    try {
      let query = supabase.from('leads').select('*');

      const currentOrgId = impersonatedOrgId || userProfile?.organization_id;
      if (currentOrgId) {
        query = query.eq('organization_id', currentOrgId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      setLeads((data || []).map(mapLeadFromDB));
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [session, userProfile?.organization_id, impersonatedOrgId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const addLead = async (leadData: LeadFormData) => {
    const currentOrgId = impersonatedOrgId || userProfile?.organization_id;

    if (userProfile?.organization) {
      const { max_leads, plan_tier } = userProfile.organization;
      if (leads.length >= max_leads) {
        throw new Error(`Seu plano ${plan_tier.toUpperCase()} atingiu o limite de ${max_leads} leads. Atualize sua assinatura.`);
      }
    }

    setIsSyncing(true);
    try {
      const payload = {
        nome: leadData.nome,
        telefone: leadData.telefone,
        email: leadData.email,
        midia: leadData.midia,
        empreendimento_id: leadData.empreendimento_id || null,
        origem_id: leadData.origem_id || null,
        data_compra: leadData.data_compra || null,
        corretor: leadData.corretor || userProfile?.name,
        empreendimento: leadData.empreendimento,
        temperatura: leadData.temperatura,
        status: leadData.status,
        historico: leadData.historico,
        proximo_contato: leadData.proximo_contato || null,
        user_id: session?.user.id,
        organization_id: currentOrgId
      };

      const { data, error } = await supabase
        .from('leads')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const newLead = mapLeadFromDB(data);
      setLeads(prev => [newLead, ...prev]);
    } catch (error: any) {
      console.error('Error adding lead:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateLead = async (id: string, leadData: Partial<LeadFormData>) => {
    const currentOrgId = impersonatedOrgId || userProfile?.organization_id;
    setIsSyncing(true);
    try {
      const payload = {
        nome: leadData.nome,
        telefone: leadData.telefone,
        email: leadData.email,
        midia: leadData.midia,
        empreendimento_id: leadData.empreendimento_id || null,
        origem_id: leadData.origem_id || null,
        data_compra: leadData.data_compra || null,
        corretor: leadData.corretor,
        empreendimento: leadData.empreendimento,
        temperatura: leadData.temperatura,
        status: leadData.status,
        historico: leadData.historico,
        proximo_contato: leadData.proximo_contato || null,
        organization_id: currentOrgId
      };

      const { data, error } = await supabase
        .from('leads')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedLead = mapLeadFromDB(data);
      setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
    } catch (error: any) {
      console.error('Error updating lead:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteLead = async (id: string) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <LeadContext.Provider value={{
      leads,
      isSyncing,
      addLead,
      updateLead,
      deleteLead,
      fetchLeads
    }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLead = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLead must be used within a LeadProvider');
  }
  return context;
};
