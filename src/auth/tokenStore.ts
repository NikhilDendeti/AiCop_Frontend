/**
 * The only place tokens are stored. The access token lives in memory; the
 * refresh token lives in sessionStorage. To move to an HttpOnly cookie later,
 * change this module only.
 */
const REFRESH_KEY = "smartcop.refresh";

let accessToken: string | null = null;

export const tokenStore = {
  getAccess: () => accessToken,
  getRefresh: (): string | null => {
    try {
      return window.sessionStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  set(access: string, refresh: string) {
    accessToken = access;
    try {
      window.sessionStorage.setItem(REFRESH_KEY, refresh);
    } catch {
      /* storage blocked: the session will not survive a reload */
    }
  },
  clear() {
    accessToken = null;
    try {
      window.sessionStorage.removeItem(REFRESH_KEY);
    } catch {
      /* ignore */
    }
  },
};
