import { supabase } from '../lib/supabase';
import { User, UserProfile, Order } from '../types';

export interface StoredAccount {
  uid: string;
  email: string;
  password?: string;
  name: string;
}

type AuthStateCallback = (user: User | null) => void;

function mapSupabaseUser(sbUser: any): User | null {
  if (!sbUser) return null;
  return {
    uid: sbUser.id,
    email: sbUser.email || null,
    displayName: sbUser.user_metadata?.name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Customer',
    photoURL: sbUser.user_metadata?.avatar_url || null,
  };
}

let cachedUser: User | null = null;

export function getCurrentUser(): User | null {
  return cachedUser;
}

export function subscribeToAuthState(callback: AuthStateCallback): () => void {
  // 1. Initial check from active Supabase session
  supabase.auth.getSession().then(({ data: { session } }) => {
    const user = mapSupabaseUser(session?.user);
    cachedUser = user;
    callback(user);
  }).catch((err) => {
    console.warn('[Supabase Auth] Get session error:', err);
    callback(null);
  });

  // 2. Subscribe to auth state events
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = mapSupabaseUser(session?.user);
    cachedUser = user;
    callback(user);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signUpWithOwner(
  email: string,
  password: string,
  name: string
): Promise<{ user: User; profile: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim() || 'Restaurant Owner';

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        name: cleanName,
        role: 'owner',
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Sign up failed: no user returned.');
  }

  const user = mapSupabaseUser(data.user)!;
  cachedUser = user;

  const profile: UserProfile = {
    uid: user.uid,
    email: cleanEmail,
    name: cleanName,
    role: 'owner',
    createdAt: new Date().toISOString(),
  };

  // Upsert profile in Supabase profiles table
  try {
    await supabase.from('profiles').upsert({
      id: user.uid,
      email: cleanEmail,
      name: cleanName,
      role: 'owner',
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Supabase Profiles] Profile upsert notice:', err);
  }

  return { user, profile };
}

export async function signUpCustomer(
  email: string,
  password: string,
  name: string,
  phone?: string,
  address?: string,
  restaurantId?: string
): Promise<{ user: User; profile: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim() || 'Customer';
  const cleanPhone = phone?.trim() || '';
  const cleanAddress = address?.trim() || '';

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        name: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
        role: 'customer',
        restaurant_id: restaurantId,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Sign up failed: no user returned.');
  }

  const user = mapSupabaseUser(data.user)!;
  cachedUser = user;

  const addresses = cleanAddress ? [{ label: 'Primary Delivery', line1: cleanAddress, city: '' }] : [];

  const profile: UserProfile = {
    uid: user.uid,
    email: cleanEmail,
    name: cleanName,
    phone: cleanPhone,
    role: 'customer',
    restaurantId,
    addresses,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('profiles').upsert({
      id: user.uid,
      email: cleanEmail,
      name: cleanName,
      phone: cleanPhone,
      role: 'customer',
      restaurant_id: restaurantId || null,
      addresses,
      updated_at: new Date().toISOString(),
    });

    if (restaurantId) {
      await supabase.from('restaurant_customers').upsert(
        {
          restaurant_id: restaurantId,
          customer_id: user.uid,
        },
        { onConflict: 'restaurant_id,customer_id' }
      );
    }
  } catch (err) {
    console.warn('[Supabase Profiles] Customer profile upsert notice:', err);
  }

  return { user, profile };
}

export async function deleteUserAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_user_account');
  if (error) {
    console.error('[Supabase RPC] Error deleting user account:', error);
    throw error;
  }
  await signOutUser();
}


export async function signInUser(email: string, password = 'password'): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Sign in failed: no user returned.');
  }

  const user = mapSupabaseUser(data.user)!;
  cachedUser = user;
  return user;
}

export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    throw error;
  }

  const currentUser = mapSupabaseUser(data);
  const profile: UserProfile = {
    uid: currentUser?.uid || 'google_user',
    email: currentUser?.email || 'google_user@domain.com',
    name: currentUser?.displayName || 'Google User',
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  return { user: currentUser || { uid: 'google_user', email: '', displayName: 'Google User', photoURL: null }, profile };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${window.location.origin}/#/login`,
  });

  if (error) {
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  cachedUser = null;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('[Supabase Auth] Sign out error:', error);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase Profiles] Error fetching profile:', error);
    }

    if (data) {
      return {
        uid: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role || 'customer',
        restaurantId: data.restaurant_id,
        addresses: data.addresses || [],
        createdAt: data.created_at,
      };
    }
  } catch (err) {
    console.warn('[Supabase Profiles] Exception fetching profile:', err);
  }

  // Fallback to active user session
  if (cachedUser && cachedUser.uid === uid) {
    return {
      uid: cachedUser.uid,
      email: cachedUser.email || '',
      name: cachedUser.displayName || 'Customer',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const updatePayload: any = {
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.phone !== undefined) updatePayload.phone = updates.phone;
  if (updates.addresses !== undefined) updatePayload.addresses = updates.addresses;

  const { data, error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', uid)
    .select()
    .single();

  if (error) {
    console.error('[Supabase Profiles] Error updating profile:', error);
    throw error;
  }

  return {
    uid: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role || 'customer',
    restaurantId: data.restaurant_id,
    addresses: data.addresses || [],
    createdAt: data.created_at,
  };
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Orders] Error fetching customer orders:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      restaurantId: row.restaurant_id,
      restaurantSlug: row.restaurant_slug,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email,
      deliveryAddress: row.delivery_address,
      fulfilmentType: row.fulfilment_type || 'delivery',
      items: row.items || [],
      subtotal: Number(row.subtotal),
      deliveryFee: Number(row.delivery_fee),
      total: Number(row.total),
      paymentMethod: row.payment_method || 'Cash on Delivery',
      notes: row.notes,
      status: row.status,
      statusHistory: row.status_history || [],
      estimatedReadyAt: row.estimated_ready_at,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.warn('[Supabase Orders] Exception in getCustomerOrders:', err);
    return [];
  }
}

export function subscribeToCustomerOrders(
  customerId: string,
  onUpdate: (orders: Order[]) => void
): () => void {
  const fetchOrders = async () => {
    const orders = await getCustomerOrders(customerId);
    onUpdate(orders);
  };

  fetchOrders();

  const channel = supabase
    .channel(`customer_orders_${customerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `customer_id=eq.${customerId}`,
      },
      () => {
        fetchOrders();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
