import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLead } from '../contexts/LeadContext';

export interface Broker {
    id: string;
    name: string;
    email?: string;
}

export function useBrokers() {
    const { userProfile } = useLead();
    const [brokers, setBrokers] = useState<Broker[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchBrokers = async () => {
            if (!userProfile?.organization_id || (userProfile.role !== 'admin' && userProfile.role !== 'owner')) {
                setBrokers([]);
                return;
            }

            setIsLoading(true);
            try {
                // 1. Get member IDs
                const { data: members, error: membersError } = await supabase
                    .from('organization_members')
                    .select('user_id')
                    .eq('organization_id', userProfile.organization_id);

                if (membersError) throw membersError;

                if (members && members.length > 0) {
                    const userIds = members.map(m => m.user_id);
                    // 2. Get user details
                    const { data: users, error: usersError } = await supabase
                        .from('users')
                        .select('id, name, email')
                        .in('id', userIds);

                    if (usersError) throw usersError;

                    if (users) {
                        setBrokers(users);
                    }
                }
            } catch (error) {
                console.error('Error fetching brokers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBrokers();
    }, [userProfile]);

    return { brokers, isLoading };
}
