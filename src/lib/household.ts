/**
 * Household sharing helpers.
 *
 * MVP scope: each user is in AT MOST ONE household. The active household
 * (if any) determines which household_id new transactions/accounts/budgets
 * are tagged with. Without a household, behavior is unchanged (personal mode).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface Household {
  id: string
  name: string
  owner_user_id: string
  max_seats: number
  created_at: string
}

export interface HouseholdMember {
  household_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
}

export interface MemberWithProfile extends HouseholdMember {
  full_name: string | null
  email: string | null
}

export interface HouseholdInvitation {
  id: string
  household_id: string
  invited_by: string
  email: string | null
  token: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  expires_at: string
  created_at: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = SupabaseClient<any, any, any>

/** Returns the household record the current user belongs to, or null. */
export async function fetchActiveHousehold(supabase: DB, userId: string): Promise<Household | null> {
  const memberRes = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!memberRes.data) return null

  const hhRes = await supabase
    .from('households')
    .select('*')
    .eq('id', (memberRes.data as { household_id: string }).household_id)
    .maybeSingle()

  return (hhRes.data ?? null) as Household | null
}

/** Generates a URL-safe random token for invitations. */
export function generateInviteToken(length = 24): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars (no 0/O/1/I/l)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(length)
    crypto.getRandomValues(buf)
    return Array.from(buf, (b) => chars[b % chars.length]).join('')
  }
  let s = ''
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

/** Returns true if user owns the household. */
export function isOwner(household: Household | null, userId: string): boolean {
  return !!household && household.owner_user_id === userId
}
