import { createClient } from '@supabase/supabase-js'

// URL do projeto (aquela que começa com https://)
const supabaseUrl = 'https://olcmgvpddtfgujpajanz.supabase.co'

// Chave PÚBLICA (sb_publishable_...)
const supabaseKey = 'sb_publishable_GwidpJlXXDXGXUBrzPCj3A_zqlj5adA'

// Cria a conexão
export const supabase = createClient(supabaseUrl, supabaseKey)