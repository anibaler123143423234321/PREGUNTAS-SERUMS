import { getSupabaseClient } from './supabaseClient';

/**
 * Iniciar sesión con Google OAuth 2.0 mediante Supabase Auth
 */
export async function signInWithGoogle() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase no está inicializado. Configura tus variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');
  }

  const redirectTo = window.location.origin;

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) {
    console.error('Error en Supabase Google OAuth:', error);
    throw error;
  }

  return data;
}

/**
 * Iniciar sesión con Correo y Contraseña
 */
export async function signInWithEmail(email, password) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase no está configurado.');

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim()
  });

  if (error) throw error;
  return data;
}

/**
 * Crear Cuenta con Correo y Contraseña
 */
export async function signUpWithEmail(email, password, fullName = '') {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase no está configurado.');

  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password: password.trim(),
    options: {
      data: {
        full_name: fullName.trim() || email.split('@')[0],
        avatar_url: ''
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Cerrar sesión activa del usuario
 */
export async function signOutUser() {
  const client = getSupabaseClient();
  if (!client) return { error: null };

  const { error } = await client.auth.signOut();
  if (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
  return { success: true };
}

/**
 * Obtener el usuario autenticado actual y su sesión
 */
export async function getCurrentUser() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session) return null;
    return session.user;
  } catch (err) {
    console.warn('Error al verificar sesión actual:', err);
    return null;
  }
}

/**
 * Escuchar cambios en el estado de autenticación (Login, Logout, Token Refresh)
 */
export function onAuthStateChange(callback) {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  try {
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null, session, event);
    });

    return () => {
      subscription?.unsubscribe();
    };
  } catch (err) {
    console.warn('Error al suscribir auth listener:', err);
    return () => {};
  }
}
