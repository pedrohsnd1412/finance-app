import { Database } from '@/types/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://fndmvfhgmpskdeohfums.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZG12ZmhnbXBza2Rlb2hmdW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDE0MDMsImV4cCI6MjA4MjYxNzQwM30.nvFR5N_57t-DOxgyXDL8cC72i_X2Be0m9uQ9LRGd8NY';

// Configure storage based on platform
const storage = Platform.OS === 'web'
    ? {
        getItem: (key: string) => {
            if (typeof window !== 'undefined') {
                return Promise.resolve(window.localStorage.getItem(key));
            }
            return Promise.resolve(null);
        },
        setItem: (key: string, value: string) => {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, value);
            }
            return Promise.resolve();
        },
        removeItem: (key: string) => {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
            return Promise.resolve();
        },
    }
    : AsyncStorage;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: storage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
    },
});

export { supabaseUrl };
