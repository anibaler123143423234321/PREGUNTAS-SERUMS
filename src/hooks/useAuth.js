import { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser } from '../services/authService';

// Estado global compartido entre todas las instancias de useAuth
let globalUser = null;
let globalLoading = true;
const authListeners = new Set();

// Sesiones antiguas del "admin local" (eliminado por inseguro) no deben seguir abiertas
try {
  localStorage.removeItem('serums_local_admin_session');
} catch {
  // localStorage no disponible
}

function notifyAuthListeners(newUser, newLoading) {
  globalUser = newUser;
  globalLoading = newLoading;
  authListeners.forEach((listener) => {
    try {
      listener({ user: newUser, loading: newLoading });
    } catch (e) {
      console.warn('Error notificando listener auth:', e);
    }
  });
}

export function useAuth() {
  const [user, setUser] = useState(globalUser);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Suscribirse a cambios globales de autenticación
    const listener = ({ user: u, loading: l }) => {
      setUser(u);
      setLoading(l);
    };
    authListeners.add(listener);

    // 2. Verificar sesión en Supabase
    getCurrentUser().then((currentUser) => {
      notifyAuthListeners(currentUser, false);
    }).catch((err) => {
      console.warn('Error comprobando sesión de usuario:', err);
      notifyAuthListeners(null, false);
    });

    // 3. Suscribirse a cambios de sesión de Supabase
    const unsubscribe = onAuthStateChange((authUser) => {
      notifyAuthListeners(authUser, false);
    });

    return () => {
      authListeners.delete(listener);
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión con Google.');
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    setError(null);
    const cleanEmail = (email || '').trim().toLowerCase();

    try {
      const data = await signInWithEmail(cleanEmail, password);
      if (data?.user) {
        notifyAuthListeners(data.user, false);
        return data;
      }
    } catch (err) {
      setError(err.message || 'Credenciales inválidas.');
      throw err;
    }
  };

  const registerWithEmail = async (email, password, fullName) => {
    setError(null);
    try {
      const data = await signUpWithEmail(email, password, fullName);
      if (data?.user && data.session) {
        notifyAuthListeners(data.user, false);
      }
      return data;
    } catch (err) {
      setError(err.message || 'Error al crear cuenta.');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Aviso al cerrar sesión en Supabase:', err);
    } finally {
      notifyAuthListeners(null, false);
    }
  };

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    isAuthenticated: Boolean(user),
    // app_metadata solo lo puede escribir el servidor (Supabase Dashboard / service_role);
    // user_metadata lo edita el propio usuario, por eso no sirve para otorgar permisos.
    isAdmin: user?.app_metadata?.role === 'admin'
  };
}
