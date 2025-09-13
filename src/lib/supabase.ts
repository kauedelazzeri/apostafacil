import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create browser client with SSR support (uses cookies for PKCE)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey) 