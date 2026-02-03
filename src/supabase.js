import { createClient } from '@supabase/supabase-js'

// import.meta.env é o comando mágico do Vite para ler o arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)