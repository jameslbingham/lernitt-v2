import { createClient } from '@supabase/supabase-js';

/**
 * LERNITT-V2 Supabase Client
 * Ported from v1 logic with safety checks for environment variables.
 * Ensures the application handles missing keys gracefully.
 * [cite: 2026-01-10]
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Sophisticated Check: Prevents 'Invalid URL' errors if variables are missing or incorrectly formatted
// This mirrors the v1 check: !url || !key || !url.startsWith("http")
const isReady = !!(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'));

// Export initialized client or null if not configured to match v1 behavior
// Using 'as string' to satisfy TypeScript requirements once verified by isReady check
export const supabase = isReady 
  ? createClient(supabaseUrl as string, supabaseKey as string) 
  : null;
