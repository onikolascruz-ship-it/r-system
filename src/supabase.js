import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// --- ADICIONE ISTO AQUI PARA TESTAR ---
console.log('https://olcmgvpddtfgujpajanz.supabase.co', supabaseUrl)
console.log('sb_publishable_GwidpJlXXDXGXUBrzPCj3A_zqlj5adA', supabaseKey)
// -------------------------------------

export const supabase = createClient(supabaseUrl, supabaseKey)