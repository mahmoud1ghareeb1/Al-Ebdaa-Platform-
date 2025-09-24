
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ppkeyhdypybroyhsbjha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwa2V5aGR5cHlicm95aHNiamhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzEwOTEsImV4cCI6MjA3NDIwNzA5MX0.IN0cP22IrCu_PLJYUdBaygoRMk3UkS25eAtTNXvYYmE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
