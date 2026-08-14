import { cache } from "react";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { isNetworkError, NetworkError } from "@/lib/network";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Current authenticated user, memoized per request with React `cache()`.
 *
 * Layouts and pages that both need the current user now share ONE
 * `auth.getUser()` call instead of duplicating it.
 *
 * - Genuine auth failure (invalid/expired session): returns `null` so the
 *   caller can redirect to /login.
 * - Network failure: throws NetworkError so an error boundary shows a retry
 *   UI instead of logging the user out.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (isNetworkError(error)) throw new NetworkError();
    return null;
  }
  return data.user ?? null;
});

/**
 * Current user's profile row (created on demand), memoized per request with
 * React `cache()`. Shares the same getUser() as getCurrentUser within a
 * request, so Shell + page fetches collapse into a single round trip.
 *
 * Same failure semantics as getCurrentUser.
 */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { profile, error } = await getOrCreateProfile(supabase, user);
  if (!profile) {
    if (error && isNetworkError(error)) throw new NetworkError();
    return null;
  }
  return profile;
});
