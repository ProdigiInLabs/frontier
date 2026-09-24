import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

/**
 * Authentication-ready seam. The public site has no accounts today, so the
 * session is always anonymous. A future /app workspace swaps in a real
 * provider (e.g. OIDC via a backend-for-frontend) behind this same context,
 * and routes opt in with <RequireAuth>. Tokens must be held in httpOnly
 * cookies set by the backend — never in localStorage.
 */
export interface Session {
  userId: string;
  name: string;
  email: string;
}

export interface AuthContextValue {
  status: 'anonymous' | 'authenticated' | 'loading';
  session: Session | null;
}

const AuthContext = createContext<AuthContextValue>({ status: 'anonymous', session: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(() => ({ status: 'anonymous', session: null }), []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
