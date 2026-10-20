import { supabase } from '../lib/supabase';
import { Restaurant, MenuItem, Deal, Order, OrderStatus, AssetItem } from '../types';
import {
  DEFAULT_RESTAURANT,
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  INITIAL_DEALS,
} from '../data/mockData';
import {
  normalizeEmail,
  normalizePhone,
  normalizeName,
  classifyCustomer,
} from './customerIdentification';
import { isValidSubdomain } from '../lib/subdomain';

// --- ROW MAPPERS ---

function mapRestaurantFromRow(row: any): Restaurant {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    subdomain: row.subdomain || row.slug,
    description: row.description || '',
    category: row.category || 'Fast Food',
    logo: row.logo_url || undefined,
    logoUrl: row.logo_url || undefined,
    banner: row.banner_url || undefined,
    bannerUrl: row.banner_url || undefined,
    plateImageUrl: row.plate_image_url || undefined,
    themeColor: row.theme_color || '#FF6900',
    phone: row.phone || undefined,
    address: row.address || undefined,
    city: row.city || undefined,
    openingHours: row.opening_hours || undefined,
    deliveryEnabled: row.delivery_enabled ?? true,
    pickupEnabled: row.pickup_enabled ?? true,
    deliveryFee: Number(row.delivery_fee ?? 0),
    freeDelivery: row.free_delivery ?? (Number(row.delivery_fee) === 0),
    freeDeliveryThreshold: Number(row.free_delivery_threshold ?? 0),
    currency: row.currency || row.ordering?.currency || '$',
    minimumOrder: Number(row.minimum_order ?? 0),
    websiteStatus: row.website_status || 'published',
    status: row.status || 'published',
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    heroHeading: row.hero_heading || row.content?.heroHeading || undefined,
    heroTagline: row.hero_tagline || row.content?.heroTagline || undefined,
    heroMediaType: row.content?.heroMediaType || 'image',
    heroVideoUrl: row.content?.heroVideoUrl || undefined,
    heroPrimaryCtaText: row.content?.heroPrimaryCtaText || undefined,
    heroPrimaryCtaLink: row.content?.heroPrimaryCtaLink || undefined,
    heroSecondaryCtaText: row.content?.heroSecondaryCtaText || undefined,
    heroSecondaryCtaLink: row.content?.heroSecondaryCtaLink || undefined,
    aboutText: row.about_text || undefined,
    showDealsPage: row.show_deals_page ?? true,
    showFeaturedSection: row.show_featured_section ?? true,
    whatsappSupportNumber: row.whatsapp_support_number || undefined,
    theme: row.theme || DEFAULT_RESTAURANT.theme,
    content: row.content || DEFAULT_RESTAURANT.content,
    ordering: row.ordering || DEFAULT_RESTAURANT.ordering,
    contact: row.contact || DEFAULT_RESTAURANT.contact,
    sections: row.sections || DEFAULT_RESTAURANT.sections,
    seo: row.seo || DEFAULT_RESTAURANT.seo,
    draftContent: row.draft_content || undefined,
    plan: row.plan || 'Starter',
    acceptingOrders: row.accepting_orders ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRestaurantToRow(r: Restaurant, ownerId?: string): any {
  return {
    id: r.id,
    owner_id: ownerId || r.ownerId,
    name: r.name,
    slug: r.slug,
    subdomain: r.subdomain || r.slug,
    description: r.description || '',
    category: r.category || 'Fast Food',
    logo_url: r.logoUrl || r.logo || null,
    banner_url: r.bannerUrl || r.banner || null,
    plate_image_url: r.plateImageUrl || null,
    theme_color: r.themeColor || '#FF6900',
    phone: r.phone || r.contact?.phone || null,
    address: r.address || r.contact?.address || null,
    city: r.city || r.contact?.city || null,
    opening_hours: r.openingHours || r.contact?.openingHours || null,
    delivery_enabled: r.deliveryEnabled ?? r.ordering?.deliveryEnabled ?? true,
    pickup_enabled: r.pickupEnabled ?? r.ordering?.pickupEnabled ?? true,
    delivery_fee: r.freeDelivery ? 0 : (r.deliveryFee ?? r.ordering?.deliveryFee ?? 0),
    free_delivery: r.freeDelivery ?? (r.deliveryFee === 0),
    free_delivery_threshold: r.freeDeliveryThreshold ?? 0,
    currency: r.currency || r.ordering?.currency || '$',
    minimum_order: r.minimumOrder ?? r.ordering?.minimumOrder ?? 0,
    website_status: r.websiteStatus || 'published',
    status: r.status || 'published',
    seo_title: r.seoTitle || r.seo?.title || null,
    seo_description: r.seoDescription || r.seo?.description || null,
    hero_heading: r.heroHeading || r.content?.heroHeading || null,
    hero_tagline: r.heroTagline || r.content?.heroTagline || null,
    about_text: r.aboutText || r.content?.about?.story || null,
    show_deals_page: r.showDealsPage ?? true,
    show_featured_section: r.showFeaturedSection ?? true,
    whatsapp_support_number: r.whatsappSupportNumber || r.contact?.whatsapp || null,
    theme: r.theme || {},
    content: {
      ...(r.content || {}),
      heroMediaType: r.heroMediaType || r.content?.heroMediaType || 'image',
      heroVideoUrl: r.heroVideoUrl || r.content?.heroVideoUrl || null,
      heroPrimaryCtaText: r.heroPrimaryCtaText || r.content?.heroPrimaryCtaText || null,
      heroPrimaryCtaLink: r.heroPrimaryCtaLink || r.content?.heroPrimaryCtaLink || null,
      heroSecondaryCtaText: r.heroSecondaryCtaText || r.content?.heroSecondaryCtaText || null,
      heroSecondaryCtaLink: r.heroSecondaryCtaLink || r.content?.heroSecondaryCtaLink || null,
    },
    ordering: r.ordering || {},
    contact: r.contact || {},
    sections: r.sections || {},
    seo: r.seo || {},
    draft_content: r.draftContent || {},
    plan: r.plan || 'Starter',
    accepting_orders: r.acceptingOrders ?? true,
    updated_at: new Date().toISOString(),
  };
}

function mapMenuItemFromRow(row: any): MenuItem {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    slug: row.slug || undefined,
    description: row.description || '',
    longDescription: row.long_description || undefined,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    category: row.category,
    image: row.image_url || undefined,
    imageUrl: row.image_url || undefined,
    gallery: row.gallery || [],
    available: row.available ?? true,
    featured: row.featured ?? false,
    tags: row.tags || [],
    calories: row.calories || undefined,
    prepTimeMins: row.prep_time_mins || undefined,
    optionGroups: row.option_groups || [],
    ingredients: row.ingredients || [],
    reviews: row.reviews || [],
    ratingAvg: Number(row.rating_avg ?? 0),
    ratingCount: Number(row.rating_count ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMenuItemToRow(item: MenuItem): any {
  return {
    id: item.id,
    restaurant_id: item.restaurantId,
    name: item.name,
    slug: item.slug || null,
    description: item.description || '',
    long_description: item.longDescription || null,
    price: item.price,
    compare_at_price: item.compareAtPrice || null,
    category: item.category,
    image_url: item.imageUrl || item.image || null,
    gallery: item.gallery || [],
    available: item.available ?? true,
    featured: item.featured ?? false,
    tags: item.tags || [],
    calories: item.calories || null,
    prep_time_mins: item.prepTimeMins || null,
    option_groups: item.optionGroups || [],
    ingredients: item.ingredients || [],
    reviews: item.reviews || [],
    rating_avg: item.ratingAvg || 0,
    rating_count: item.ratingCount || 0,
    sort_order: item.sortOrder || 0,
    updated_at: new Date().toISOString(),
  };
}

function mapDealFromRow(row: any): Deal {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    title: row.title,
    description: row.description || '',
    image: row.image_url || undefined,
    imageUrl: row.image_url || undefined,
    originalPrice: Number(row.original_price),
    discountedPrice: Number(row.discounted_price),
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    active: row.active ?? true,
    linkedItemIds: row.linked_item_ids || [],
  };
}

function mapDealToRow(deal: Deal): any {
  return {
    id: deal.id,
    restaurant_id: deal.restaurantId,
    title: deal.title,
    description: deal.description || '',
    image_url: deal.imageUrl || deal.image || null,
    original_price: deal.originalPrice,
    discounted_price: deal.discountedPrice,
    start_date: deal.startDate || null,
    end_date: deal.endDate || null,
    active: deal.active ?? true,
    linked_item_ids: deal.linkedItemIds || [],
    updated_at: new Date().toISOString(),
  };
}

export function mapOrderFromRow(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    restaurantId: row.restaurant_id,
    restaurantSlug: row.restaurant_slug || undefined,
    customerId: row.customer_id || null,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || undefined,
    deliveryAddress: row.delivery_address || undefined,
    fulfilmentType: row.fulfilment_type || 'delivery',
    items: row.items || [],
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    paymentMethod: row.payment_method || 'Cash on Delivery',
    notes: row.notes || undefined,
    status: row.status as OrderStatus,
    statusHistory: row.status_history || [],
    estimatedReadyAt: row.estimated_ready_at || undefined,
    rejectionReason: row.rejection_reason || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAssetFromRow(row: any): AssetItem {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    url: row.url,
    type: row.type || 'image',
    size: row.size || undefined,
    createdAt: row.created_at,
  };
}

// --- RESTAURANT METHODS ---

export function getStoredRestaurants(): Restaurant[] {
  return INITIAL_RESTAURANTS;
}

export async function getOwnerRestaurants(ownerId: string): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching owner restaurants:', error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map(mapRestaurantFromRow);
    }
  } catch (err) {
    console.warn('[Supabase] Exception fetching owner restaurants:', err);
  }
  return [];
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const cleanSlug = slug.toLowerCase().trim();
  if (!cleanSlug) return null;

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .or(`slug.ilike.${cleanSlug},subdomain.ilike.${cleanSlug}`)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Error fetching restaurant by slug:', error);
    }

    if (data) {
      return mapRestaurantFromRow(data);
    }
  } catch (err) {
    console.warn('[Supabase] Exception fetching restaurant by slug:', err);
  }

  return null;
}

export async function getRestaurantBySubdomain(subdomain: string): Promise<Restaurant | null> {
  return getRestaurantBySlug(subdomain);
}

export async function checkSlugAvailable(
  slug: string,
  excludeRestaurantId?: string
): Promise<{ available: boolean; error?: string; suggestedSlug?: string }> {
  const clean = slug.toLowerCase().trim();
  const formatCheck = isValidSubdomain(clean);
  if (!formatCheck.valid) {
    return { available: false, error: formatCheck.error };
  }

  try {
    // 1. Try atomic Supabase RPC function (checks both published & draft restaurants + reserved names)
    const { data, error } = await supabase.rpc('check_slug_availability', {
      proposed_slug: clean,
      exclude_id: excludeRestaurantId || null,
    });

    if (!error && typeof data === 'boolean') {
      if (data === true) {
        return { available: true };
      }

      // Slug is taken or reserved. Generate a sensible alternative suggestion (e.g. kababjees-2)
      let suggestedSlug: string | undefined;
      for (let i = 2; i <= 9; i++) {
        const candidate = `${clean.slice(0, 27)}-${i}`;
        const { data: candAvail } = await supabase.rpc('check_slug_availability', {
          proposed_slug: candidate,
          exclude_id: excludeRestaurantId || null,
        });
        if (candAvail === true) {
          suggestedSlug = candidate;
          break;
        }
      }

      return {
        available: false,
        error: `The slug "${clean}" is already in use by another restaurant.`,
        suggestedSlug,
      };
    }

    // 2. Direct table fallback if RPC is not accessible
    let query = supabase
      .from('restaurants')
      .select('id, subdomain, slug')
      .or(`subdomain.ilike.${clean},slug.ilike.${clean}`);

    if (excludeRestaurantId) {
      query = query.neq('id', excludeRestaurantId);
    }

    const { data: tableData, error: tableError } = await query;
    if (tableError) {
      console.warn('[Supabase] Error checking slug availability:', tableError);
      return {
        available: false,
        error: 'Unable to verify slug availability due to a network error. Please try again.',
      };
    }

    if (tableData && tableData.length > 0) {
      return {
        available: false,
        error: `The slug "${clean}" is already in use by another restaurant.`,
        suggestedSlug: `${clean.slice(0, 27)}-2`,
      };
    }

    return { available: true };
  } catch (err) {
    console.warn('[Supabase] Exception checking slug availability:', err);
    return {
      available: false,
      error: 'Network error checking slug availability. Please check your connection and try again.',
    };
  }
}

export const checkSubdomainAvailable = checkSlugAvailable;

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Error fetching restaurant by id:', error);
    }

    if (data) {
      return mapRestaurantFromRow(data);
    }
  } catch (err) {
    console.warn('[Supabase] Exception fetching restaurant by id:', err);
  }

  if (id === DEFAULT_RESTAURANT.id || id === 'new_restaurant') {
    return DEFAULT_RESTAURANT;
  }
  return null;
}

export async function saveRestaurant(restaurant: Restaurant): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user;
  const ownerId = user?.id || restaurant.ownerId || '00000000-0000-0000-0000-000000000000';
  
  // Normalize slug and subdomain strictly before persistence
  const cleanSlug = restaurant.slug.toLowerCase().trim();
  const normalizedResto: Restaurant = {
    ...restaurant,
    slug: cleanSlug,
    subdomain: cleanSlug,
  };

  const row = mapRestaurantToRow(normalizedResto, ownerId);

  const { error } = await supabase
    .from('restaurants')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('[Supabase] Error saving restaurant:', error);
    // Safe race-condition / uniqueness error handling (PostgreSQL code 23505)
    if (
      (error as any).code === '23505' ||
      error.message?.includes('duplicate key') ||
      error.message?.includes('restaurants_slug')
    ) {
      throw new Error(
        `The URL slug "${cleanSlug}" is already claimed by another restaurant. Please choose another slug.`
      );
    }
    throw error;
  }
}

// --- MENU ITEMS METHODS ---

export async function getRestaurantMenuItems(restaurantId: string): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching menu items:', error);
    }

    if (data && data.length > 0) {
      return data.map(mapMenuItemFromRow);
    }
  } catch (err) {
    console.warn('[Supabase] Exception fetching menu items:', err);
  }

  if (restaurantId === DEFAULT_RESTAURANT.id || restaurantId === 'new_restaurant') {
    return INITIAL_MENU_ITEMS;
  }
  return [];
}

export async function saveMenuItem(item: MenuItem): Promise<void> {
  const row = mapMenuItemToRow(item);
  const { error } = await supabase
    .from('menu_items')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('[Supabase] Error saving menu item:', error);
    throw error;
  }
}

export async function deleteMenuItem(restaurantId: string, itemId: string): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId)
    .eq('restaurant_id', restaurantId);

  if (error) {
    console.error('[Supabase] Error deleting menu item:', error);
    throw error;
  }
}

export async function addMenuItemReview(
  restaurantId: string,
  itemId: string,
  review: {
    id: string;
    orderId: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    verifiedBuyer: boolean;
  }
): Promise<MenuItem | null> {
  try {
    const { data: itemData, error: fetchErr } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchErr || !itemData) return null;

    const currentItem = mapMenuItemFromRow(itemData);
    const reviews = [review, ...(currentItem.reviews || [])];
    const ratingCount = reviews.length;
    const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingAvg = Number((ratingSum / ratingCount).toFixed(1));

    const updatedItem: MenuItem = {
      ...currentItem,
      reviews,
      ratingAvg,
      ratingCount,
    };

    await saveMenuItem(updatedItem);
    return updatedItem;
  } catch (err) {
    console.warn('[Supabase] Error adding menu item review:', err);
    return null;
  }
}

// --- DEALS METHODS ---

export async function getRestaurantDeals(restaurantId: string): Promise<Deal[]> {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching deals:', error);
    }

    if (data && data.length > 0) {
      return data.map(mapDealFromRow);
    }
  } catch (err) {
    console.warn('[Supabase] Exception fetching deals:', err);
  }

  if (restaurantId === DEFAULT_RESTAURANT.id || restaurantId === 'new_restaurant') {
    return INITIAL_DEALS;
  }
  return [];
}

export async function saveDeal(deal: Deal): Promise<void> {
  const row = mapDealToRow(deal);
  const { error } = await supabase
    .from('deals')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('[Supabase] Error saving deal:', error);
    throw error;
  }
}

export async function deleteDeal(restaurantId: string, dealId: string): Promise<void> {
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', dealId)
    .eq('restaurant_id', restaurantId);

  if (error) {
    console.error('[Supabase] Error deleting deal:', error);
    throw error;
  }
}

// --- ORDERS METHODS ---

export async function placeOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
  const orderNumber = Math.floor(1000 + Math.random() * 9000);
  const id = `ORD-${orderNumber}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

  // Server-side calculation verification
  const calculatedSubtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : orderData.subtotal;
  const total = Number((subtotal + (orderData.deliveryFee || 0)).toFixed(2));

  const orderRow = {
    id,
    order_number: orderNumber,
    restaurant_id: orderData.restaurantId,
    restaurant_slug: orderData.restaurantSlug || null,
    customer_id: orderData.customerId || null,
    customer_name: orderData.customerName,
    customer_phone: orderData.customerPhone,
    customer_email: orderData.customerEmail || null,
    delivery_address: orderData.deliveryAddress || null,
    fulfilment_type: orderData.fulfilmentType || 'delivery',
    items: orderData.items,
    subtotal,
    delivery_fee: orderData.deliveryFee || 0,
    total,
    payment_method: orderData.paymentMethod || 'Cash on Delivery',
    notes: orderData.notes || null,
    status: 'New',
    status_history: [
      {
        status: 'New',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: 'Order submitted to restaurant register',
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('orders').insert(orderRow);

  if (error) {
    console.error('[Supabase] Error placing order:', error);
    throw error;
  }

  // Customer Identification & Matching (Rules A through G)
  if (orderData.restaurantId) {
    try {
      const normPhone = normalizePhone(orderData.customerPhone);
      const normEmail = normalizeEmail(orderData.customerEmail);

      // Fetch existing customers for this restaurant
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('*')
        .eq('restaurant_id', orderData.restaurantId);

      const classification = classifyCustomer(
        {
          restaurantId: orderData.restaurantId,
          name: orderData.customerName,
          phone: orderData.customerPhone,
          email: orderData.customerEmail,
          address: orderData.deliveryAddress,
          orderTotal: total,
        },
        existingCustomers || []
      );

      if (classification.status === 'CONFLICT') {
        console.warn('[Customer Identification Conflict]', classification.message);
      } else if (classification.status === 'REPEAT') {
        // Atomic trigger on PostgreSQL handles the total_orders increment.
        // We ensure customer delivery address and updated_at are kept up to date.
        const ex = classification.existingRecord;
        if (orderData.deliveryAddress && orderData.deliveryAddress !== ex.address) {
          await supabase
            .from('customers')
            .update({
              address: orderData.deliveryAddress,
              updated_at: new Date().toISOString(),
            })
            .eq('id', classification.customerId);
        }
      } else {
        // Fallback: If for any reason the database trigger didn't insert a new customer row, create one safely.
        const hasExistingRow = (existingCustomers || []).some((c) => {
          const cp = normalizePhone(c.phone);
          const ce = normalizeEmail(c.email);
          return (normPhone && cp && normPhone === cp) || (normEmail && ce && normEmail === ce);
        });

        if (!hasExistingRow) {
          const safePhone = normPhone || orderData.customerPhone?.trim() || `guest_${Date.now()}`;
          await supabase.from('customers').insert({
            restaurant_id: orderData.restaurantId,
            name: normalizeName(orderData.customerName),
            phone: safePhone,
            email: normEmail || null,
            address: orderData.deliveryAddress || null,
            total_orders: 1,
            total_spent: total,
            first_order_at: new Date().toISOString(),
            last_order_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (custErr) {
      console.warn('[Supabase] Customer identification notice:', custErr);
    }
  }

  return mapOrderFromRow(orderRow);
}



export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<void> {
  try {
    const cleanId = orderId.replace(/^#/, '').trim();
    const { data: currentOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('status_history')
      .eq('id', cleanId)
      .maybeSingle();

    if (fetchErr) {
      console.error('[Supabase] Error fetching order for update:', fetchErr);
    }

    const currentHistory = (currentOrder?.status_history as any[]) || [];
    const newEntry = {
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: note || `Order updated to ${status}`,
    };

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status,
        status_history: [...currentHistory, newEntry],
        updated_at: new Date().toISOString(),
      })
      .eq('id', cleanId);

    if (updateErr) {
      console.error('[Supabase] Error updating order status:', updateErr);
      throw updateErr;
    }
  } catch (err) {
    console.error('[Supabase] Exception updating order status:', err);
    throw err;
  }
}

export function subscribeToRestaurantOrders(
  restaurantId: string,
  onUpdate: (orders: Order[]) => void
): () => void {
  let isMounted = true;

  // 1. Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Orders] Initial fetch error:', error);
        return;
      }
      if (data && isMounted) {
        onUpdate(data.map(mapOrderFromRow));
      }
    } catch (e) {
      console.warn('[Supabase Orders] Exception in fetch:', e);
    }
  };

  fetchOrders();

  // 2. Realtime Channel Subscription
  const channel = supabase
    .channel(`restaurant_orders_${restaurantId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      () => {
        fetchOrders();
      }
    )
    .subscribe();

  // 3. Fallback active polling (every 3 seconds) for 100% sync reliability
  const interval = setInterval(fetchOrders, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
    supabase.removeChannel(channel);
  };
}

export function subscribeToOrder(
  orderId: string,
  onUpdate: (order: Order | null) => void
): () => void {
  const cleanId = orderId.replace(/^#/, '').trim();
  let isMounted = true;

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (error) {
        console.warn('[Supabase Order] Fetch error:', error);
        return;
      }
      if (isMounted) {
        onUpdate(data ? mapOrderFromRow(data) : null);
      }
    } catch (e) {
      console.warn('[Supabase Order] Exception:', e);
    }
  };

  fetchOrder();

  // Real-time Supabase postgres_changes channel
  const channel = supabase
    .channel(`order_${cleanId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${cleanId}`,
      },
      () => {
        fetchOrder();
      }
    )
    .subscribe();

  // Fallback high-frequency poll (every 2.5s) for instant live order status tracking
  const interval = setInterval(fetchOrder, 2500);

  return () => {
    isMounted = false;
    clearInterval(interval);
    supabase.removeChannel(channel);
  };
}

// --- ASSETS METHODS ---

export async function getRestaurantAssets(restaurantId: string): Promise<AssetItem[]> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Assets] Error fetching assets:', error);
      return [];
    }
    return (data || []).map(mapAssetFromRow);
  } catch (err) {
    console.warn('[Supabase Assets] Exception fetching assets:', err);
    return [];
  }
}

export async function saveAsset(asset: AssetItem): Promise<void> {
  const { error } = await supabase
    .from('assets')
    .upsert({
      id: asset.id,
      restaurant_id: asset.restaurantId,
      name: asset.name,
      url: asset.url,
      type: asset.type || 'image',
      size: asset.size || null,
      created_at: asset.createdAt || new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    console.error('[Supabase Assets] Error saving asset:', error);
    throw error;
  }
}

export async function deleteAsset(restaurantId: string, assetId: string): Promise<void> {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId)
    .eq('restaurant_id', restaurantId);

  if (error) {
    console.error('[Supabase Assets] Error deleting asset:', error);
    throw error;
  }
}

// --- CUSTOMERS MANAGEMENT FOR ADMIN DASHBOARD ---

export interface RestaurantCustomerSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  firstOrderDate: string;
  lastOrderDate: string;
  totalOrders: number;
  totalSpent: number;
  orders: Order[];
}

export async function getRestaurantCustomers(restaurantId: string): Promise<RestaurantCustomerSummary[]> {
  try {
    // 1. Fetch deduplicated customers directly from public.customers table
    const { data: dbCustomers, error: custErr } = await supabase
      .from('customers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('last_order_at', { ascending: false });

    if (custErr) {
      console.warn('[Supabase] Error fetching customers table:', custErr);
    }

    // 2. Fetch all orders for this restaurant to attach full order history
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.warn('[Supabase] Error fetching restaurant orders:', ordersError);
    }

    const allOrders = (ordersData || []).map(mapOrderFromRow);

    if (dbCustomers && dbCustomers.length > 0) {
      const mergedMap = new Map<string, RestaurantCustomerSummary>();

      for (const c of dbCustomers) {
        const normPhone = normalizePhone(c.phone);
        const normEmail = normalizeEmail(c.email);

        // Match existing group strictly by normalized phone OR normalized email (Rule D & E: NEVER by name)
        let targetKey: string | null = null;
        for (const [key, existing] of mergedMap.entries()) {
          const exPhone = normalizePhone(existing.phone);
          const exEmail = normalizeEmail(existing.email);

          if (
            (normPhone && exPhone && normPhone === exPhone) ||
            (normEmail && exEmail && normEmail === exEmail)
          ) {
            targetKey = key;
            break;
          }
        }

        // Attach orders matching by normalized phone or normalized email (NEVER by name)
        const customerOrders = allOrders.filter((o) => {
          const ordPhone = normalizePhone(o.customerPhone);
          const ordEmail = normalizeEmail(o.customerEmail);
          return (
            (normPhone && ordPhone && normPhone === ordPhone) ||
            (normEmail && ordEmail && normEmail === ordEmail)
          );
        });

        const currentSummary: RestaurantCustomerSummary = {
          id: c.id,
          name: c.name,
          email: c.email || 'Not provided',
          phone: c.phone || '',
          address: c.address || '',
          firstOrderDate: c.first_order_at || c.created_at,
          lastOrderDate: c.last_order_at || c.created_at,
          totalOrders: Number(c.total_orders || customerOrders.length || 1),
          totalSpent: Number(c.total_spent || customerOrders.reduce((sum, o) => sum + o.total, 0)),
          orders: customerOrders,
        };

        if (targetKey) {
          const target = mergedMap.get(targetKey)!;
          if (!target.phone && currentSummary.phone) target.phone = currentSummary.phone;
          if ((!target.email || target.email === 'Not provided') && currentSummary.email !== 'Not provided') target.email = currentSummary.email;
          if (!target.address && currentSummary.address) target.address = currentSummary.address;

          const orderSet = new Set(target.orders.map((o) => o.id));
          for (const ord of currentSummary.orders) {
            if (!orderSet.has(ord.id)) {
              orderSet.add(ord.id);
              target.orders.push(ord);
            }
          }
          target.totalOrders = Math.max(target.totalOrders, currentSummary.totalOrders, target.orders.length);
          target.totalSpent = Number((target.totalSpent + currentSummary.totalSpent).toFixed(2));
        } else {
          mergedMap.set(c.id, currentSummary);
        }
      }

      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
      );
    }

    // Fallback: aggregate by normalized phone or normalized email from orders table (NEVER name)
    const customersMap = new Map<string, RestaurantCustomerSummary>();
    for (const order of allOrders) {
      const normPhone = normalizePhone(order.customerPhone);
      const normEmail = normalizeEmail(order.customerEmail);
      const key = normPhone || normEmail || `order_${order.id}`;
      if (!key) continue;

      if (!customersMap.has(key)) {
        customersMap.set(key, {
          id: `cust_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: order.customerName,
          email: order.customerEmail || 'Not provided',
          phone: order.customerPhone,
          address: order.deliveryAddress,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
          totalOrders: 1,
          totalSpent: order.total,
          orders: [order],
        });
      } else {
        const existing = customersMap.get(key)!;
        existing.totalOrders += 1;
        existing.totalSpent = Number((existing.totalSpent + order.total).toFixed(2));
        existing.orders.push(order);
        if (order.createdAt > existing.lastOrderDate) {
          existing.lastOrderDate = order.createdAt;
        }
      }
    }

    return Array.from(customersMap.values());
  } catch (err) {
    console.warn('[Supabase] Exception fetching restaurant customers:', err);
    return [];
  }
}

// --- REAL CUSTOMER REVIEWS (SUPABASE BACKEND) ---

export interface RealReviewItem {
  id: string;
  restaurantId: string;
  itemId?: string;
  orderId?: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  verifiedBuyer: boolean;
  createdAt: string;
}

export async function getRestaurantReviews(
  restaurantId: string,
  itemId?: string
): Promise<RealReviewItem[]> {
  try {
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[Supabase Reviews] Fetch error:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      itemId: row.item_id || undefined,
      orderId: row.order_id || 'ORD-VERIFIED',
      customerName: row.customer_name || 'Verified Diner',
      customerEmail: row.customer_email || undefined,
      rating: Number(row.rating || 5),
      comment: row.comment || '',
      verifiedBuyer: row.verified_buyer ?? true,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase Reviews] Exception:', err);
    return [];
  }
}

export async function addRestaurantReview(review: {
  restaurantId: string;
  itemId?: string;
  orderId?: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  verifiedBuyer?: boolean;
}): Promise<RealReviewItem> {
  const payload = {
    restaurant_id: review.restaurantId,
    item_id: review.itemId || null,
    order_id: review.orderId || null,
    customer_name: review.customerName.trim(),
    customer_email: review.customerEmail?.trim() || null,
    rating: Math.max(1, Math.min(5, Math.round(review.rating))),
    comment: review.comment.trim(),
    verified_buyer: review.verifiedBuyer ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('reviews')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase Reviews] Error saving review:', error);
    throw error;
  }

  return {
    id: data.id,
    restaurantId: data.restaurant_id,
    itemId: data.item_id || undefined,
    orderId: data.order_id || 'ORD-VERIFIED',
    customerName: data.customer_name,
    customerEmail: data.customer_email || undefined,
    rating: Number(data.rating),
    comment: data.comment,
    verifiedBuyer: data.verified_buyer,
    createdAt: data.created_at,
  };
}

export async function deleteRestaurantReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('[Supabase Reviews] Error deleting review:', error);
    throw error;
  }
}
