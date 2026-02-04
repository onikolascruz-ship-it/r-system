import { createClient } from '@supabase/supabase-js'

// --- OPÇÃO 1: MODO SEGURO (Para quando subir pro GitHub/Vercel) ---
 const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
 const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// --- OPÇÃO 2: MODO ESTUDO (Para usar no seu PC agora) ---
 //const supabaseUrl = 'https://olcmgvpddtfgujpajanz.supabase.co'
 //const supabaseKey = 'sb_publishable_GwidpJlXXDXGXUBrzPCj3A_zqlj5adA'

export const supabase = createClient(supabaseUrl, supabaseKey)