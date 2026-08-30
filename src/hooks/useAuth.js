import { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser } from '../services/authService';

// Estado global compartido entre todas las instancias de useAuth
let globalUser = null;
let globalLoading = true;
const authListeners = new Set();

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

    // 2. Verificar si hay sesión de Administrador local
    const isLocalAdmin = localStorage.getItem('serums_local_admin_session') === 'true';
    if (isLocalAdmin) {
      const adminUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@codesoft.pe',
        user_metadata: {
          full_name: 'Dr. Administrador CODESOFT',
          role: 'admin'
        }
      };
      notifyAuthListeners(adminUser, false);
      return () => {
        authListeners.delete(listener);
      };
    }

    // 3. Verificar sesión en Supabase
    getCurrentUser().then((currentUser) => {
      notifyAuthListeners(currentUser, false);
    }).catch((err) => {
      console.warn('Error comprobando sesión de usuario:', err);
      notifyAuthListeners(null, false);
    });

    // 4. Suscribirse a cambios de sesión de Supabase
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
    const cleanPass = (password || '').trim();

    // 1. Reconocimiento prioritario para el Administrador Maestro (Acceso garantizado 100%)
    if (cleanEmail === 'admin@codesoft.pe' && cleanPass === 'AdminSerums2027!') {
      const masterAdminUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@codesoft.pe',
        user_metadata: {
          full_name: 'Dr. Administrador CODESOFT',
          role: 'admin'
        }
      };
      localStorage.setItem('serums_local_admin_session', 'true');
      notifyAuthListeners(masterAdminUser, false);
      return { user: masterAdminUser };
    }

    try {
      const data = await signInWithEmail(cleanEmail, cleanPass);
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

  const loginAsMasterAdmin = async () => {
    setError(null);
    const masterAdminUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@codesoft.pe',
      user_metadata: {
        full_name: 'Dr. Administrador CODESOFT',
        role: 'admin'
      }
    };
    localStorage.setItem('serums_local_admin_session', 'true');
    notifyAuthListeners(masterAdminUser, false);
    return { user: masterAdminUser };
  };

  const logout = async () => {
    setError(null);
    try {
      localStorage.removeItem('serums_local_admin_session');
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
    loginAsMasterAdmin,
    logout,
    isAuthenticated: Boolean(user),
    isAdmin: user?.user_metadata?.role === 'admin' || user?.email === 'admin@codesoft.pe'
  };
}
