export function getOrCreateSessionId() {
  if (typeof window === 'undefined') return undefined;
  const key = 'mb_session_id';
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    window.localStorage.setItem(key, id);
    document.cookie = `mb_session=${id}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }
  return id;
}


