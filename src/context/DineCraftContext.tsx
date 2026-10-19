import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  Restaurant,
  MenuItem,
  Deal,
  Order,
  CartItem,
  OrderStatus,
  UserProfile,
  SelectedOption,
  AssetItem,
} from '../types';
import {
  signInUser,
  signUpWithOwner,
  signUpCustomer as customerSignUpService,
  updateUserProfile as updateUserProfileService,
  deleteUserAccount as deleteUserAccountService,
  subscribeToCustomerOrders,
  signInWithGoogle as googleAuthSignIn,
  signOutUser,
  getUserProfile,
  subscribeToAuthState,
} from '../services/authService';
import {
  getOwnerRestaurants,
  getStoredRestaurants,
  getRestaurantBySlug as fetchRestoBySlugService,
  saveRestaurant as saveRestoService,
  getRestaurantMenuItems,
  saveMenuItem as saveMenuItemService,
  deleteMenuItem as deleteMenuItemService,
  getRestaurantDeals,
  saveDeal as saveDealService,
  deleteDeal as deleteDealService,
  placeOrder as placeOrderService,
  updateOrderStatus as updateOrderStatusService,
  subscribeToRestaurantOrders,
  getRestaurantAssets,
  saveAsset,
  deleteAsset,
} from '../services/restaurantService';
import {
  DEFAULT_RESTAURANT,
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  INITIAL_DEALS,
} from '../data/mockData';
import { generateSlug, isValidSlug } from '../lib/subdomain';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message?: string;
}

export const BLANK_RESTAURANT: Restaurant = DEFAULT_RESTAURANT;

interface DineCraftContextType {
  // Authentication & Profile
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, restaurantName?: string, password?: string) => Promise<string>;
  signUpCustomer: (email: string, password: string, name: string, phone?: string, address?: string, restaurantId?: string) => Promise<{ user: User; profile: UserProfile }>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  deleteUserAccount: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  customerOrders: Order[];

  // Restaurants
  restaurants: Restaurant[];
  activeRestaurant: Restaurant;
  setActiveRestaurantId: (id: string) => void;
  updateRestaurant: (updated: Restaurant) => Promise<void>;
  createRestaurant: (newResto: Partial<Restaurant>) => Promise<Restaurant>;
  getRestaurantBySlug: (slug: string) => Restaurant | undefined;
  fetchRestaurantBySlug: (slug: string) => Promise<Restaurant | null>;

  // Menu Items
  menuItems: MenuItem[];
  getMenuItems: (restaurantId: string) => MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<MenuItem>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  // Deals
  deals: Deal[];
  getDeals: (restaurantId: string) => Deal[];
  addDeal: (deal: Omit<Deal, 'id'>) => Promise<Deal>;
  updateDeal: (deal: Deal) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;

  // Assets Library
  assets: AssetItem[];
  uploadAsset: (fileData: { name: string; url: string; type?: 'image' | 'video' }) => Promise<AssetItem>;
  deleteAsset: (assetId: string) => Promise<void>;

  // Orders
  orders: Order[];
  getOrders: (restaurantId: string) => Order[];
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;

  // Cart
  getCart: (restaurantId: string) => CartItem[];
  addToCart: (
    restaurantId: string,
    item: { id: string; name: string; price: number; image?: string; imageUrl?: string; category?: string; menuItemId?: string },
    quantity?: number,
    selectedOptions?: SelectedOption[],
    specialInstructions?: string
  ) => void;
  updateCartQuantity: (restaurantId: string, itemId: string, delta: number) => void;
  removeFromCart: (restaurantId: string, itemId: string) => void;
  clearCart: (restaurantId: string) => void;
  getCartSubtotal: (restaurantId: string) => number;

  // Session object for compatibility
  session: {
    isLoggedIn: boolean;
    user: {
      name: string;
      email: string;
      restaurantId?: string;
    } | null;
  };

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const STORAGE_KEYS = {
  ACTIVE_ID: 'dinecraft_active_resto_id',
  CARTS: 'dinecraft_carts_v2',
};

const DineCraftContext = createContext<DineCraftContextType | undefined>(undefined);

export const DineCraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Restaurant data
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    return getStoredRestaurants();
  });
  const [activeRestaurantId, setActiveRestaurantIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      if (saved) return saved;
    } catch {
      // Ignore
    }
    return DEFAULT_RESTAURANT.id;
  });

  // Menu items & deals
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  // Cart persisted in localStorage
  const [carts, setCarts] = useState<Record<string, CartItem[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARTS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Toasts (disabled per user requirement to remove all messages and notifications)
  const [toasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((_toast: Omit<ToastMessage, 'id'>) => {
    // Notifications system removed
  }, []);

  const removeToast = useCallback((_id: string) => {
    // Notifications system removed
  }, []);

  // Save carts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify(carts));
    } catch (e) {
      console.warn('Cart persist error:', e);
    }
  }, [carts]);

  // Save active restaurant ID
  const setActiveRestaurantId = useCallback((id: string) => {
    setActiveRestaurantIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    } catch (e) {
      console.warn('Active ID persist error:', e);
    }
  }, []);

  // Compute active restaurant with safe fallback
  const activeRestaurant = useMemo<Restaurant>(() => {
    if (restaurants.length === 0) {
      return BLANK_RESTAURANT;
    }
    const found = restaurants.find((r) => r.id === activeRestaurantId);
    return found || restaurants[0] || BLANK_RESTAURANT;
  }, [restaurants, activeRestaurantId]);

  // Listen to Client-Side Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || user.email?.split('@')[0] || 'Restaurant Owner',
              role: 'owner',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Failed to load user profile:', e);
        }

        try {
          const userRestos = await getOwnerRestaurants(user.uid);
          const available = userRestos.length > 0 ? userRestos : getStoredRestaurants();
          setRestaurants(available.length > 0 ? available : [DEFAULT_RESTAURANT]);
          const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
          const validSaved = available.some((r) => r.id === savedId);
          setActiveRestaurantIdState(validSaved ? (savedId as string) : (available[0]?.id || DEFAULT_RESTAURANT.id));
        } catch (e) {
          console.warn('Failed to load restaurants:', e);
          const stored = getStoredRestaurants();
          setRestaurants(stored.length > 0 ? stored : [DEFAULT_RESTAURANT]);
          setActiveRestaurantIdState(DEFAULT_RESTAURANT.id);
        }
      } else {
        setUserProfile(null);
        const stored = getStoredRestaurants();
        setRestaurants(stored);
        if (stored.length > 0) {
          const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
          const validSaved = stored.some((r) => r.id === savedId);
          setActiveRestaurantIdState(validSaved ? (savedId as string) : stored[0].id);
        }
        setOrders([]);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to live customer orders when a customer is logged in
  useEffect(() => {
    if (!currentUser?.uid) {
      setCustomerOrders([]);
      return;
    }
    const unsub = subscribeToCustomerOrders(currentUser.uid, (ordersList) => {
      setCustomerOrders(ordersList);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  // When active restaurant changes, load its menu items, deals, and subscribe to orders
  useEffect(() => {
    if (!activeRestaurant.id) {
      return;
    }

    let isMounted = true;

    // Load Menu Items
    getRestaurantMenuItems(activeRestaurant.id)
      .then((items) => {
        if (isMounted) setMenuItems(items);
      })
      .catch((e) => console.warn('Could not fetch menu items:', e));

    // Load Deals
    getRestaurantDeals(activeRestaurant.id)
      .then((d) => {
        if (isMounted) setDeals(d);
      })
      .catch((e) => console.warn('Could not fetch deals:', e));

    // Subscribe to live Orders from local reactive storage
    const unsubOrders = subscribeToRestaurantOrders(activeRestaurant.id, (incomingOrders) => {
      if (isMounted) {
        const seen = new Set<string>();
        const unique = incomingOrders.filter((o) => {
          if (!o || !o.id || seen.has(o.id)) return false;
          seen.add(o.id);
          return true;
        });
        setOrders(unique);
      }
    });

    return () => {
      isMounted = false;
      unsubOrders();
    };
  }, [activeRestaurant.id]);

  // Assets Library Operations
  const [assets, setAssets] = useState<AssetItem[]>([]);

  useEffect(() => {
    if (!activeRestaurant.id || activeRestaurant.id === 'new_restaurant') {
      setAssets([]);
      return;
    }
    let isMounted = true;
    getRestaurantAssets(activeRestaurant.id)
      .then((res) => {
        if (isMounted) setAssets(res);
      })
      .catch((e) => console.warn('Could not fetch assets:', e));

    return () => {
      isMounted = false;
    };
  }, [activeRestaurant.id]);

  const uploadAsset = async (fileData: { name: string; url: string; type?: 'image' | 'video' }): Promise<AssetItem> => {
    const newAsset: AssetItem = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      restaurantId: activeRestaurant.id,
      name: fileData.name,
      url: fileData.url,
      type: fileData.type || 'image',
      createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    await saveAsset(newAsset);
    setAssets((prev) => [newAsset, ...prev]);
    addToast({
      type: 'success',
      title: 'Asset Uploaded',
      message: `${fileData.name} saved to media library.`,
    });
    return newAsset;
  };

  const deleteAssetItem = async (assetId: string): Promise<void> => {
    await deleteAsset(activeRestaurant.id, assetId);
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    addToast({
      type: 'info',
      title: 'Asset Deleted',
      message: 'Media file removed from library.',
    });
  };

  const autoSaveAssetIfDataUrl = (url?: string, name = 'Gallery Upload') => {
    if (url && url.startsWith('data:') && activeRestaurant.id && activeRestaurant.id !== 'new_restaurant') {
      if (!assets.some((a) => a.url === url)) {
        uploadAsset({ name, url, type: 'image' }).catch(() => {});
      }
    }
  };

  // Auth Operations
  const login = async (email: string, password = 'password') => {
    try {
      await signInUser(email, password);
      addToast({
        type: 'success',
        title: 'Welcome Back',
        message: `Signed in as ${email}`,
      });
    } catch (err: any) {
      console.error('Sign in error:', err);
      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message: err.message || 'Please check your email and password.',
      });
      throw err;
    }
  };

  const signup = async (
    name: string,
    email: string,
    restaurantName = 'My Restaurant',
    password = 'password123'
  ): Promise<string> => {
    try {
      const { user } = await signUpWithOwner(email, password, name);
      // Clean slug using standard DineCraft slug generation rules
      const baseSlug = generateSlug(restaurantName) || 'my-restaurant';
      const cleanSlug = baseSlug;

      const newRestoId = `resto_${cleanSlug}_${Date.now().toString(36)}`;
      const newResto: Restaurant = {
        ...BLANK_RESTAURANT,
        id: newRestoId,
        ownerId: user.uid,
        name: restaurantName,
        slug: cleanSlug,
        description: `Welcome to ${restaurantName}! Order online for fast local delivery and pickup.`,
        seoTitle: `${restaurantName} — Online Ordering`,
        seoDescription: `Order delicious food online directly from ${restaurantName}. Fast delivery and pickup.`,
        heroHeading: `Fresh & Delicious Food at ${restaurantName}`,
        heroTagline: 'Made with passion and the freshest ingredients.',
        contact: {
          ...BLANK_RESTAURANT.contact!,
          email,
        },
      };

      await saveRestoService(newResto);

      // Seed starter menu items and deals for the new restaurant in Supabase
      const defaultItems = INITIAL_MENU_ITEMS.map((item, idx) => ({
        ...item,
        id: `item_${newResto.id}_${idx + 1}`,
        restaurantId: newResto.id,
      }));
      for (const item of defaultItems) {
        await saveMenuItemService(item).catch(() => {});
      }

      const defaultDeals = INITIAL_DEALS.map((deal, idx) => ({
        ...deal,
        id: `deal_${newResto.id}_${idx + 1}`,
        restaurantId: newResto.id,
      }));
      for (const deal of defaultDeals) {
        await saveDealService(deal).catch(() => {});
      }

      setRestaurants((prev) => [newResto, ...prev]);
      setActiveRestaurantId(newResto.id);

      addToast({
        type: 'success',
        title: 'Account & Restaurant Created',
        message: `${restaurantName} is ready to customize!`,
      });

      return cleanSlug;
    } catch (err: any) {
      console.error('Sign up error:', err);
      addToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'Unable to create account. Please try again.',
      });
      throw err;
    }
  };

  const signUpCustomer = async (
    email: string,
    password = 'password123',
    name: string,
    phone?: string,
    address?: string,
    restaurantId?: string
  ): Promise<{ user: User; profile: UserProfile }> => {
    try {
      const result = await customerSignUpService(email, password, name, phone, address, restaurantId);
      setCurrentUser(result.user);
      setUserProfile(result.profile);
      return result;
    } catch (err: any) {
      console.error('Customer registration error:', err);
      throw err;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!currentUser) throw new Error('Not authenticated');
    const updated = await updateUserProfileService(currentUser.uid, updates);
    setUserProfile(updated);
    return updated;
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      await deleteUserAccountService();
      setCurrentUser(null);
      setUserProfile(null);
      setCustomerOrders([]);
    } catch (err: any) {
      console.error('Account deletion error:', err);
      throw err;
    }
  };


  const signInWithGoogle = async () => {
    try {
      const { user } = await googleAuthSignIn();
      addToast({
        type: 'success',
        title: 'Signed in with Google',
        message: `Welcome, ${user.displayName || user.email}!`,
      });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        addToast({
          type: 'error',
          title: 'Google Sign In Error',
          message: err.message || 'Could not complete Google authentication.',
        });
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been successfully signed out.',
      });
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Restaurant Operations
  const createRestaurant = async (newRestoData: Partial<Restaurant>): Promise<Restaurant> => {
    const rawSlugCandidate = newRestoData.slug || newRestoData.name || 'restaurant';
    const cleanSlug = generateSlug(rawSlugCandidate) || `resto-${Date.now().toString(36)}`;
    const cleanSubdomain = cleanSlug;

    const id = newRestoData.id && newRestoData.id !== 'new_restaurant' ? newRestoData.id : `resto_${cleanSlug}_${Date.now().toString(36)}`;
    const fullRestaurant: Restaurant = {
      ...BLANK_RESTAURANT,
      ...newRestoData,
      id,
      ownerId: currentUser?.uid || newRestoData.ownerId || 'guest',
      slug: cleanSlug,
      subdomain: cleanSubdomain,
      name: newRestoData.name || 'My Restaurant',
      category: newRestoData.category || 'Fast Food',
      description:
        newRestoData.description || `Welcome to ${newRestoData.name || 'our restaurant'}!`,
      websiteStatus: 'published',
      status: 'published',
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveRestoService(fullRestaurant);

      // Seed starter menu items and deals
      const defaultItems = INITIAL_MENU_ITEMS.map((item, idx) => ({
        ...item,
        id: `item_${fullRestaurant.id}_${idx + 1}`,
        restaurantId: fullRestaurant.id,
      }));
      for (const item of defaultItems) {
        await saveMenuItemService(item).catch(() => {});
      }

      const defaultDeals = INITIAL_DEALS.map((deal, idx) => ({
        ...deal,
        id: `deal_${fullRestaurant.id}_${idx + 1}`,
        restaurantId: fullRestaurant.id,
      }));
      for (const deal of defaultDeals) {
        await saveDealService(deal).catch(() => {});
      }

      setRestaurants((prev) => [fullRestaurant, ...prev]);
      setActiveRestaurantId(fullRestaurant.id);
      addToast({
        type: 'success',
        title: 'Restaurant Created',
        message: `${fullRestaurant.name} is now live in your dashboard.`,
      });
      return fullRestaurant;
    } catch (err: any) {
      console.error('Failed to save restaurant:', err);
      addToast({
        type: 'error',
        title: 'Error Creating Restaurant',
        message: err.message || 'Unable to save to database.',
      });
      throw err;
    }
  };

  const updateRestaurant = async (updated: Restaurant): Promise<void> => {
    try {
      if (updated.id === 'new_restaurant' || !updated.id) {
        await createRestaurant({
          ...updated,
          ownerId: currentUser?.uid || updated.ownerId || 'guest',
        });
        return;
      }

      // Preserve existing slug unless explicitly changed; display name updates must NEVER alter existing slug
      const cleanSlug = updated.slug ? generateSlug(updated.slug) : updated.slug;
      const restoToSave: Restaurant = {
        ...updated,
        slug: cleanSlug || updated.slug,
        subdomain: cleanSlug || updated.subdomain,
        ownerId: currentUser?.uid || updated.ownerId || 'guest',
      };
      await saveRestoService(restoToSave);
      setRestaurants((prev) => prev.map((r) => (r.id === restoToSave.id ? restoToSave : r)));
      addToast({
        type: 'success',
        title: 'Changes Saved',
        message: `${restoToSave.name} website settings updated.`,
      });
    } catch (err: any) {
      console.error('Failed to update restaurant:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not update restaurant.',
      });
      throw err;
    }
  };

  const getRestaurantBySlug = (slug: string): Restaurant | undefined => {
    const cleanSlug = slug.toLowerCase().trim();
    if (!cleanSlug) return undefined;

    const found = restaurants.find(
      (r) => r.slug.toLowerCase() === cleanSlug || (r.subdomain && r.subdomain.toLowerCase() === cleanSlug)
    );
    if (found) return found;

    const stored = getStoredRestaurants();
    const storedFound = stored.find(
      (r) => r.slug.toLowerCase() === cleanSlug || (r.subdomain && r.subdomain.toLowerCase() === cleanSlug)
    );
    if (storedFound) return storedFound;

    if (
      activeRestaurant &&
      (activeRestaurant.slug.toLowerCase() === cleanSlug ||
        (activeRestaurant.subdomain && activeRestaurant.subdomain.toLowerCase() === cleanSlug))
    ) {
      return activeRestaurant;
    }

    return undefined;
  };

  const fetchRestaurantBySlug = async (slug: string): Promise<Restaurant | null> => {
    const cleanSlug = slug.toLowerCase().trim();
    if (!cleanSlug) return null;
    const immediate = getRestaurantBySlug(cleanSlug);
    if (immediate) return immediate;

    try {
      const fetched = await fetchRestoBySlugService(cleanSlug);
      if (fetched) {
        setRestaurants((prev) => {
          if (prev.some((r) => r.id === fetched.id)) return prev;
          return [...prev, fetched];
        });
        return fetched;
      }
    } catch (e) {
      console.warn('Error fetching restaurant by slug:', e);
    }
    return null;
  };

  // Menu Items Operations
  const getMenuItems = (restaurantId: string): MenuItem[] => {
    const list = menuItems.filter((m) => m.restaurantId === restaurantId);
    if (list.length === 0 && (restaurantId === DEFAULT_RESTAURANT.id || restaurantId === 'new_restaurant' || activeRestaurant.slug === 'my-restaurant')) {
      return INITIAL_MENU_ITEMS;
    }
    return list;
  };

  const addMenuItem = async (itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem: MenuItem = {
      ...itemData,
      id,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveMenuItemService(newItem);
      setMenuItems((prev) => [newItem, ...prev]);
      addToast({
        type: 'success',
        title: 'Item Added',
        message: `${newItem.name} has been added to the menu.`,
      });
      return newItem;
    } catch (err: any) {
      console.error('Failed to add menu item:', err);
      addToast({
        type: 'error',
        title: 'Error Adding Item',
        message: err.message,
      });
      throw err;
    }
  };

  const updateMenuItem = async (item: MenuItem): Promise<void> => {
    try {
      await saveMenuItemService(item);
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
      addToast({
        type: 'success',
        title: 'Item Updated',
        message: `${item.name} details have been saved.`,
      });
    } catch (err: any) {
      console.error('Failed to update menu item:', err);
      addToast({
        type: 'error',
        title: 'Error Updating Item',
        message: err.message,
      });
      throw err;
    }
  };

  const deleteMenuItem = async (id: string): Promise<void> => {
    const toDelete = menuItems.find((m) => m.id === id);
    if (!toDelete) return;

    try {
      await deleteMenuItemService(toDelete.restaurantId, id);
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      addToast({
        type: 'info',
        title: 'Item Removed',
        message: `${toDelete.name} removed from menu.`,
      });
    } catch (err: any) {
      console.error('Failed to delete menu item:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message,
      });
    }
  };

  // Deals Operations
  const getDeals = (restaurantId: string): Deal[] => {
    const list = deals.filter((d) => d.restaurantId === restaurantId);
    if (list.length === 0 && (restaurantId === DEFAULT_RESTAURANT.id || restaurantId === 'new_restaurant' || activeRestaurant.slug === 'my-restaurant')) {
      return INITIAL_DEALS;
    }
    return list;
  };

  const addDeal = async (dealData: Omit<Deal, 'id'>): Promise<Deal> => {
    const id = `deal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDeal: Deal = {
      ...dealData,
      id,
    };

    try {
      await saveDealService(newDeal);
      setDeals((prev) => [newDeal, ...prev]);
      addToast({
        type: 'success',
        title: 'Deal Created',
        message: `${newDeal.title} is now active.`,
      });
      return newDeal;
    } catch (err: any) {
      console.error('Failed to add deal:', err);
      addToast({
        type: 'error',
        title: 'Error Creating Deal',
        message: err.message,
      });
      throw err;
    }
  };

  const updateDeal = async (deal: Deal): Promise<void> => {
    try {
      await saveDealService(deal);
      setDeals((prev) => prev.map((d) => (d.id === deal.id ? deal : d)));
      addToast({
        type: 'success',
        title: 'Deal Updated',
        message: `${deal.title} details saved.`,
      });
    } catch (err: any) {
      console.error('Failed to update deal:', err);
      addToast({
        type: 'error',
        title: 'Error Updating Deal',
        message: err.message,
      });
      throw err;
    }
  };

  const deleteDeal = async (id: string): Promise<void> => {
    const toDelete = deals.find((d) => d.id === id);
    if (!toDelete) return;

    try {
      await deleteDealService(toDelete.restaurantId, id);
      setDeals((prev) => prev.filter((d) => d.id !== id));
      addToast({
        type: 'info',
        title: 'Deal Deleted',
        message: `${toDelete.title} removed.`,
      });
    } catch (err: any) {
      console.error('Failed to delete deal:', err);
      addToast({
        type: 'error',
        title: 'Error Deleting Deal',
        message: err.message,
      });
    }
  };

  // Orders Operations
  const getOrders = (restaurantId: string): Order[] => {
    return orders.filter((o) => o.restaurantId === restaurantId);
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    try {
      const orderPayload = {
        ...orderData,
        customerId: currentUser?.uid || orderData.customerId || undefined,
      };
      const newOrder = await placeOrderService(orderPayload);
      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
      setCustomerOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
      clearCart(orderData.restaurantId);
      addToast({
        type: 'success',
        title: 'Order Placed!',
        message: `Your order #${newOrder.id} has been transmitted to the kitchen.`,
      });
      return newOrder;
    } catch (err: any) {
      console.error('Order creation error:', err);
      addToast({
        type: 'error',
        title: 'Checkout Error',
        message: err.message || 'Could not place order.',
      });
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      const cleanId = orderId.replace(/^#/, '').trim();
      await updateOrderStatusService(cleanId, status);
      setOrders((prev) => prev.map((o) => (o.id === cleanId ? { ...o, status } : o)));
      setCustomerOrders((prev) => prev.map((o) => (o.id === cleanId ? { ...o, status } : o)));
      addToast({
        type: 'info',
        title: 'Order Updated',
        message: `Order #${cleanId} marked as ${status}.`,
      });
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      addToast({
        type: 'error',
        title: 'Update Error',
        message: err.message,
      });
    }
  };

  // Cart Operations
  const getCart = (restaurantId: string): CartItem[] => {
    return carts[restaurantId] || [];
  };

  const addToCart = (
    restaurantId: string,
    item: { id: string; name: string; price: number; image?: string; imageUrl?: string; category?: string; menuItemId?: string },
    quantity = 1,
    selectedOptions: SelectedOption[] = [],
    specialInstructions = ''
  ) => {
    // Prevent adding unavailable / sold out dishes
    const existingDish = menuItems.find((m) => m.id === item.id);
    if (existingDish && existingDish.available === false) {
      addToast({
        type: 'error',
        title: 'Item Unavailable',
        message: `${item.name} is currently sold out and cannot be added to your order.`,
      });
      return;
    }

    setCarts((prev) => {
      const currentCart = prev[restaurantId] || [];
      const optionsDelta = selectedOptions.reduce((acc, opt) => acc + opt.priceDelta, 0);
      const unitPrice = item.price + optionsDelta;
      const optionsKey = selectedOptions
        .map((o) => `${o.groupName}:${o.optionName}`)
        .sort()
        .join('|');
      const lineId = `${item.id}_${optionsKey}_${specialInstructions.trim()}`;

      const existingIndex = currentCart.findIndex((ci) => ci.id === lineId);
      let updatedCart: CartItem[];

      if (existingIndex > -1) {
        updatedCart = currentCart.map((ci, idx) =>
          idx === existingIndex ? { ...ci, quantity: ci.quantity + quantity } : ci
        );
      } else {
        const newItem: CartItem = {
          id: lineId,
          menuItemId: item.id,
          restaurantId,
          name: item.name,
          price: unitPrice,
          quantity,
          image: item.image || item.imageUrl,
          imageUrl: item.imageUrl || item.image,
          category: item.category,
          selectedOptions,
          specialInstructions,
        };
        updatedCart = [...currentCart, newItem];
      }

      return { ...prev, [restaurantId]: updatedCart };
    });

    addToast({
      type: 'success',
      title: 'Added to Bag',
      message: `${item.name} added to your order.`,
    });
  };

  const updateCartQuantity = (restaurantId: string, itemId: string, deltaOrQty: number) => {
    setCarts((prev) => {
      const currentCart = prev[restaurantId] || [];
      const updated = currentCart
        .map((ci) => {
          if (ci.id === itemId) {
            // Support both relative delta (+1/-1) and absolute new quantity (e.g. item.quantity - 1)
            let newQty: number;
            if (deltaOrQty === 1 || deltaOrQty === -1) {
              newQty = ci.quantity + deltaOrQty;
            } else {
              newQty = deltaOrQty;
            }
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
      return { ...prev, [restaurantId]: updated };
    });
  };


  const removeFromCart = (restaurantId: string, itemId: string) => {
    setCarts((prev) => {
      const currentCart = prev[restaurantId] || [];
      return {
        ...prev,
        [restaurantId]: currentCart.filter((ci) => ci.id !== itemId),
      };
    });
  };

  const clearCart = (restaurantId: string) => {
    setCarts((prev) => ({
      ...prev,
      [restaurantId]: [],
    }));
  };

  const getCartSubtotal = (restaurantId: string): number => {
    const currentCart = carts[restaurantId] || [];
    return currentCart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  // Session helper for legacy components
  const session = useMemo(() => {
    if (!currentUser) {
      return { isLoggedIn: false, user: null };
    }
    return {
      isLoggedIn: true,
      user: {
        name: userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Restaurant Owner',
        email: currentUser.email || '',
        restaurantId: activeRestaurantId,
      },
    };
  }, [currentUser, userProfile, activeRestaurantId]);

  return (
    <DineCraftContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthLoading,
        login,
        signup,
        signUpCustomer,
        updateUserProfile,
        deleteUserAccount: deleteAccount,
        signInWithGoogle,
        logout,
        customerOrders,

        restaurants,
        activeRestaurant,
        setActiveRestaurantId,
        updateRestaurant,
        createRestaurant,
        getRestaurantBySlug,
        fetchRestaurantBySlug,

        menuItems,
        getMenuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,

        deals,
        getDeals,
        addDeal,
        updateDeal,
        deleteDeal,

        assets,
        uploadAsset,
        deleteAsset: deleteAssetItem,

        orders,
        getOrders,
        createOrder,
        updateOrderStatus,

        getCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getCartSubtotal,

        session,

        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </DineCraftContext.Provider>
  );
};

export const useDineCraft = () => {
  const context = useContext(DineCraftContext);
  if (!context) {
    throw new Error('useDineCraft must be used within a DineCraftProvider');
  }
  return context;
};
