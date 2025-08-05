import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()


if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables!')
  console.error('Please create a .env file with SUPABASE_URL and SUPABASE_ANON_KEY')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey)
