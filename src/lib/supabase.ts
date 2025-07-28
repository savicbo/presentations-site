import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
console.log('Supabase Service Key available:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
}

// Public client for read operations and voting
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Admin client for presentation/poll management (only available locally)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database types
export interface WebPresPresentation {
  id: string;
  short_id: string;
  title: string;
  current_slide: number;
  created_at: string;
}

export interface WebPresPoll {
  id: string;
  presentation_id: string;
  slide_number: number;
  question: string;
  content_hash: string;
  is_active: boolean;
  created_at: string;
}

export interface WebPresPollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
  order_index: number;
}

export interface WebPresVote {
  id: string;
  poll_id: string;
  option_id: string;
  created_at: string;
}
