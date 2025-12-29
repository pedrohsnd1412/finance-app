import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = 'https://fndmvfhgmpskdeohfums.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZG12ZmhnbXBza2Rlb2hmdW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDE0MDMsImV4cCI6MjA4MjYxNzQwM30.nvFR5N_57t-DOxgyXDL8cC72i_X2Be0m9uQ9LRGd8NY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export { supabaseUrl };
