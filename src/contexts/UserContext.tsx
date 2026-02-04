import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, SystemSettings } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface UserContextType {
    userProfile: UserProfile | null;
    systemSettings: SystemSettings | null;
    isLoading: boolean;
    fetchUserProfile: (userId: string) => Promise<void>;
    setImpersonatedOrg: (orgId: string | null) => void;
    impersonatedOrgId: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { session } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [impersonatedOrgId, setImpersonatedOrgId] = useState<string | null>(localStorage.getItem('support_org_id'));

    const setImpersonatedOrg = (orgId: string | null) => {
        if (orgId) localStorage.setItem('support_org_id', orgId);
        else localStorage.removeItem('support_org_id');
        setImpersonatedOrgId(orgId);
        window.location.reload();
    };

    const fetchSettings = useCallback(async () => {
        const { data } = await supabase
            .from('system_settings')
            .select('*')
            .eq('id', 'global')
            .single();

        if (data) setSystemSettings(data);
    }, []);

    const fetchUserProfile = useCallback(async (userId: string) => {
        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            // Role from organization_members
            const { data: memberData } = await supabase
                .from('organization_members')
                .select('role')
                .eq('user_id', userId)
                .eq('organization_id', userData.organization_id)
                .single();

            if (memberData) {
                userData.role = memberData.role;
            }

            const orgIdToFetch = impersonatedOrgId || userData.organization_id;

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

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (session?.user.id) {
            fetchUserProfile(session.user.id);
        } else {
            setUserProfile(null);
            if (!session) setIsLoading(false);
        }
    }, [session, fetchUserProfile]);

    return (
        <UserContext.Provider value={{
            userProfile,
            systemSettings,
            isLoading,
            fetchUserProfile,
            setImpersonatedOrg,
            impersonatedOrgId
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
