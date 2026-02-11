import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export function useDeleteUserData() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteAllData = async () => {
        try {
            setIsDeleting(true);
            setError(null);

            const { data, error } = await supabase.functions.invoke('delete-user-data');

            if (error) {
                throw error;
            }

            return { success: true, data };
        } catch (err: any) {
            console.error('Error deleting user data:', err);
            setError(err.message || 'Failed to delete data');
            return { success: false, error: err.message };
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        deleteAllData,
        isDeleting,
        error
    };
}
