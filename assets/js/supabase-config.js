
// Initialize Supabase Client
const SUPABASE_URL = 'https://yefkfqnsmgmrqhkoefum.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bHeq9j6G0eMOM44mVCFKvg_EVq-HHWf';

let supabaseClient;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase Initialized');
} else {
    console.error('Supabase SDK not loaded!');
}
