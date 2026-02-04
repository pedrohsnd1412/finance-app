import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface ConnectionItem {
    id: string;
    pluggy_item_id: string;
    connector_name: string;
    status: string;
    last_updated_at: string;
}

export function useConnections() {
    const [connections, setConnections] = useState<ConnectionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConnections = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('connection_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setConnections(data || []);
        } catch (err: any) {
            console.error('Error fetching connections:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    return {
        connections,
        isLoading,
        error,
        refetch: fetchConnections
    };
}
