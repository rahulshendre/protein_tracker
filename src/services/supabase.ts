import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://kfcdarujppmbhlrcchaa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY2RhcnVqcHBtYmhscmNjaGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzE5OTQsImV4cCI6MjA4OTA0Nzk5NH0.hqv5jylWzzB2VHC0Hchzw_2i9S1Ev8Yd6E_NnkjQsXk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
