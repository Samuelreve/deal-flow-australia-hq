
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wntmgfuclbdrezxcvzmw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudG1nZnVjbGJkcmV6eGN2em13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMDQ1MzMsImV4cCI6MjA2MDc4MDUzM30.B6_rR0UtjgKvwdsRqEcyLl9jh_aT51XrZm17XtqMm0g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
