export type RestaurantCategory =
  | 'Fast Food'
  | 'Pizza & Italian'
  | 'Pizza'
  | 'Cafe & Bistro'
  | 'Cafe'
  | 'Café & Coffee'
  | 'Pakistani & Indian'
  | 'Pakistani Restaurant'
  | 'Desi & Biryani'
  | 'Burgers & Grills'
  | 'Bakery & Sweets'
  | 'Bakery & Desserts'
  | 'Bakery'
  | 'Beverages & Shakes'
  | 'Asian & Noodles'
  | 'Healthy & Salads'
  | 'Steakhouse'
  | 'Fine Dining'
  | 'Other';

export interface RestaurantTheme {
  primary: string; // e.g. '#06251B' or '#F97316'
  secondary?: string;
  accent?: string;
  background?: string;
  textColor?: string;
  headingFont?: 'Playfair Display' | 'Plus Jakarta Sans' | 'Poppins' | 'Cinzel';
  scriptFont?: 'Dancing Script' | 'Great Vibes';
  bodyFont?: 'Poppins' | 'DM Sans' | 'Inter';
  buttonStyle?: 'pill' | 'rounded' | 'square';
}

export interface RestaurantContent {
  heroTagline?: string;
  heroHeading?: string;
  heroHeadingHighlight?: string;
  heroSubtext?: string;
  heroMediaType?: 'image' | 'video';
  heroVideoUrl?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  specialOfferDealId?: string; // New field
  featuresStrip?: Array<{
    icon: string;
    title: string;
    text: string;
  }>;
  favoritesEyebrow?: string;
  favoritesTitle?: string;
  reservationBanner?: {
    enabled?: boolean;
    eyebrow?: string;
    title?: string;
    text?: string;
    buttonLabel?: string;
    imageUrl?: string;
    badges?: string[];
  };
  stats?: Array<{
    icon: string;
    value: string;
    label: string;
  }>;
  about?: {
    title?: string;
    story?: string;
    imageUrl?: string;
  };
  footerText?: string;
}

export interface RestaurantOrdering {
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryFee: number;
  minimumOrder: number;
  acceptingOrders: boolean;
  prepTimeMins: number;
  currency: string;
}

export interface RestaurantContact {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  openingHours: string;
}

export interface RestaurantSections {
  features: boolean;
  favorites: boolean;
  deals: boolean;
  reservationBanner: boolean;
  stats: boolean;
  about: boolean;
  reviews: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  description: string;
  category: RestaurantCategory;
  logo?: string;
  logoUrl?: string;
  banner?: string;
  bannerUrl?: string;
  themeColor?: string;
  phone?: string;
  address?: string;
  city?: string;
  openingHours?: string;
  deliveryEnabled?: boolean;
  pickupEnabled?: boolean;
  deliveryFee?: number;
  freeDelivery?: boolean;
  freeDeliveryThreshold?: number;
  currency?: string;
  minimumOrder?: number;
  websiteStatus?: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  heroHeading?: string;
  heroTagline?: string;
  heroMediaType?: 'image' | 'video';
  heroVideoUrl?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  aboutText?: string;
  showDealsPage?: boolean;
  showFeaturedSection?: boolean;
  whatsappSupportNumber?: string;
  // Sub-objects & extensions
  ownerId?: string;
  plateImageUrl?: string;
  theme?: RestaurantTheme;
  content?: RestaurantContent;
  ordering?: RestaurantOrdering;
  contact?: RestaurantContact;
  sections?: RestaurantSections;
  seo?: {
    title: string;
    description: string;
    ogImageUrl?: string;
  };
  status?: 'draft' | 'published';
  draftContent?: Partial<Restaurant>;
  plan?: 'Starter' | 'Pro' | 'Growth';
  acceptingOrders?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface MenuOption {
  name: string;
  priceDelta: number;
}

export interface MenuOptionGroup {
  name: string;
  required: boolean;
  maxSelect?: number;
  options: MenuOption[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  slug?: string;
  description: string;
  longDescription?: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  image?: string;
  imageUrl?: string;
  gallery?: string[];
  available: boolean;
  featured: boolean;
  tags?: string[];
  calories?: number;
  prepTimeMins?: number;
  optionGroups?: MenuOptionGroup[];
  ingredients?: string[];
  reviews?: ProductReview[];
  ratingAvg?: number;
  ratingCount?: number;
  sortOrder?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface ProductReview {
  id: string;
  orderId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  verifiedBuyer: boolean;
}

export interface Deal {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  originalPrice: number;
  discountedPrice: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  linkedItemIds?: string[];
}

export interface SelectedOption {
  groupName: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string;
  menuItemId?: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  imageUrl?: string;
  category?: string;
  selectedOptions?: SelectedOption[];
  specialInstructions?: string;
}

export type OrderStatus =
  | 'New'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  imageUrl?: string;
  selectedOptions?: SelectedOption[];
  specialInstructions?: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber?: number;
  restaurantId: string;
  restaurantSlug?: string;
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  fulfilmentType: 'delivery' | 'pickup';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'Cash on Delivery';
  notes?: string;
  status: OrderStatus;
  statusHistory?: OrderStatusHistory[];
  estimatedReadyAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MockUserSession {
  isLoggedIn: boolean;
  user: {
    name: string;
    email: string;
    restaurantId?: string;
  } | null;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export type User = AuthUser;

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: 'owner' | 'customer' | 'admin';
  restaurantId?: string;
  addresses?: Array<{
    label: string;
    line1: string;
    city: string;
  }>;
  createdAt?: string;
}

export interface AssetItem {
  id: string;
  restaurantId: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size?: string;
  createdAt: string;
}
