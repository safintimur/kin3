import { Session } from '@supabase/supabase-js';
import { hasSupabase, supabase } from '@/lib/supabase';

const pendingDisplayNameKey = 'kin3.pendingDisplayName';

export function rememberPendingDisplayName(displayName: string) {
  if (typeof window === 'undefined') return;

  const normalized = displayName.trim();
  if (normalized) {
    window.localStorage.setItem(pendingDisplayNameKey, normalized);
  }
}

function getPendingDisplayName() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(pendingDisplayNameKey)?.trim() ?? '';
}

function clearPendingDisplayName() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(pendingDisplayNameKey);
}

function getDisplayName(session: Session) {
  const metadata = session.user.user_metadata;
  const savedName = metadata.display_name ?? metadata.full_name ?? metadata.name;
  const pendingName = getPendingDisplayName();

  return String(savedName || pendingName || session.user.email?.split('@')[0] || '').trim();
}

export async function syncAuthenticatedUser(session: Session) {
  if (!hasSupabase || !supabase) return;

  const displayName = getDisplayName(session);
  const pendingName = getPendingDisplayName();

  try {
    if (pendingName && pendingName !== session.user.user_metadata.display_name) {
      await supabase.auth.updateUser({
        data: {
          display_name: pendingName,
          full_name: pendingName,
          name: pendingName
        }
      });
    }

    await supabase.from('user_profiles').upsert(
      {
        user_id: session.user.id,
        email: session.user.email ?? '',
        display_name: displayName || null,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    );

    const seenKey = `kin3.sessionSeen.${session.user.id}`;
    if (typeof window !== 'undefined' && !window.sessionStorage.getItem(seenKey)) {
      await supabase.from('activity_events').insert({
        actor_id: session.user.id,
        actor_email: session.user.email ?? null,
        actor_name: displayName || null,
        action: 'session_seen',
        entity_type: 'session',
        metadata: {
          path: window.location.pathname,
          user_agent: window.navigator.userAgent
        }
      });
      window.sessionStorage.setItem(seenKey, '1');
    }

    clearPendingDisplayName();
  } catch (error) {
    console.warn('Failed to sync user activity', error);
  }
}
