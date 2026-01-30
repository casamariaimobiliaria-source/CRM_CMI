import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Lead, LeadFormData, UserProfile, SystemSettings } from '../types';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface LeadContextType {
  leads: Lead[];
  session: Session | null;
  userProfile: UserProfile | null;
  systemSettings: SystemSettings | null;
  isLoading: boolean;
  isSyncing: boolean;
  addLead: (lead: LeadFormData) => Promise<void>;
  updateLead: (id: string, lead: Partial<LeadFormData>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
  setImpersonatedOrg: (orgId: string | null) => void;
  impersonatedOrgId: string | null;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [impersonatedOrgId, setImpersonatedOrgId] = useState<string | null>(localStorage.getItem('support_org_id'));

  const setImpersonatedOrg = (orgId: string | null) => {
    if (orgId) localStorage.setItem('support_org_id', orgId);
    else localStorage.removeItem('support_org_id');
    setImpersonatedOrgId(orgId);
    window.location.reload(); // Refresh to re-fetch everything under new context
  };

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Global Settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (data) setSystemSettings(data);
    };
    fetchSettings();
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Fetch role from organization_members
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', userData.organization_id)
        .single();

      if (memberData) {
        userData.role = memberData.role;
      }

      let orgIdToFetch = impersonatedOrgId || userData.organization_id;

      if (orgIdToFetch) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgIdToFetch)
          .single();

        if (orgData) {
          (userData as any).organization = orgData;
        }
      }

      setUserProfile(userData as UserProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [impersonatedOrgId]);

  // Fetch Leads and Profile when session changes
  useEffect(() => {
    if (session) {
      fetchLeads();
      fetchUserProfile(session.user.id);
    } else {
      setLeads([]);
      setUserProfile(null);
    }
  }, [session, fetchUserProfile]);

  const fetchLeads = async () => {
    setIsSyncing(true);
    try {
      // Build query
      let query = supabase
        .from('leads')
        .select('*');

      const currentOrgId = impersonatedOrgId || userProfile?.organization_id;
      if (currentOrgId) {
        query = query.eq('organization_id', currentOrgId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Map DB columns to Frontend types if needed
      const mappedLeads = (data || []).map(l => ({
        ...l,
        createdAt: l.created_at,
        dataCompra: l.data_compra,
        nextContact: l.proximo_contato
      })) as Lead[];

      setLeads(mappedLeads);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      // In a real app, we would trigger a toast here
      // toast.error("Não foi possível carregar os leads. Verifique sua conexão.");
    } finally {
      setIsSyncing(false);
    }
  };

  const addLead = async (leadData: LeadFormData) => {
    // Check Limits
    if (userProfile?.organization) {
      const { max_leads, plan_tier } = userProfile.organization;
      if (leads.length >= max_leads) {
        // Emulate error or throw specific error
        const errorMsg = `Seu plano ${plan_tier.toUpperCase()} atingiu o limite de ${max_leads} leads. Atualize sua assinatura.`;
        // We can let the backend trigger catch it, but early return is better UX
        // However, for consistency with the backend trigger message:
        // Let's rely on backend or throw here. 
        // Throwing here saves an API call.
        throw new Error(errorMsg);
      }
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          nome: leadData.nome,
          telefone: leadData.telefone,
          email: leadData.email,
          midia: leadData.midia,
          data_compra: leadData.dataCompra || null,
          corretor: leadData.corretor || userProfile?.name,
          empreendimento: leadData.empreendimento,
          temperatura: leadData.temperatura,
          status: leadData.status,
          historico: leadData.historico,
          proximo_contato: leadData.nextContact || null,
          user_id: session?.user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newLead = {
        ...data,
        createdAt: data.created_at,
        dataCompra: data.data_compra
      } as Lead;

      setLeads(prev => [newLead, ...prev]);
    } catch (error: any) {
      console.error('Error adding lead:', error);
      // toast.error(`Erro ao adicionar lead: ${error.message || 'Erro desconhecido'}`);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateLead = async (id: string, leadData: Partial<LeadFormData>) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          nome: leadData.nome,
          telefone: leadData.telefone,
          email: leadData.email,
          midia: leadData.midia,
          data_compra: leadData.dataCompra || null,
          corretor: leadData.corretor,
          empreendimento: leadData.empreendimento,
          temperatura: leadData.temperatura,
          status: leadData.status,
          historico: leadData.historico,
          proximo_contato: leadData.nextContact || null
        })
        .eq('id', id);

      if (error) throw error;

      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...leadData } : l));
    } catch (error: any) {
      console.error('Error updating lead:', error);
      // toast.error(`Erro ao atualizar lead: ${error.message || 'Erro desconhecido'}`);
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
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      // toast.error("Falha ao remover o lead.");
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <LeadContext.Provider value={{
      leads,
      session,
      userProfile,
      systemSettings,
      isLoading,
      isSyncing,
      addLead,
      updateLead,
      deleteLead,
      signOut,
      fetchUserProfile,
      setImpersonatedOrg,
      impersonatedOrgId
    }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLead = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLead must be used within a LeadProvider');
  }
  return context;
};
