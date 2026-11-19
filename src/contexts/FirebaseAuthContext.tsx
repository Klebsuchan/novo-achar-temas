import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGooglePopup, signOutUser } from '../firebase';

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authReady: false,
  authError: null,
  signInWithGoogle: async () => null,
  signOut: async () => {},
  clearAuthError: () => {},
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    setAuthError(null);
    try {
      const cred = await signInWithGooglePopup();
      return cred.user;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('auth/popup-closed-by-user')) {
        setAuthError('Não foi possível concluir o login com o Google. Verifique se pop-ups estão liberados.');
      }
      return null;
    }
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      await signOutUser();
    } catch {
      setAuthError('Erro ao encerrar a sessão.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        authError,
        signInWithGoogle,
        signOut,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  return useContext(AuthContext);
}
