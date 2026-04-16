export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  comparePrice: number | null;
  image: string;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  id: number;
  cartId: string;
  productId: number;
  quantity: number;
  productName: string;
  productPrice: number;
  productImage: string;
  createdAt: string;
}

export interface Cart {
  id: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  address: string | null;
  city: string | null;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface Category {
  name: string;
  count: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ViewType =
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'wishlist';

export interface StoreState {
  currentView: ViewType;
  selectedProductId: number | null;
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  cartId: string;
  cartCount: number;
  lastOrderNumber: string | null;

  setCurrentView: (view: ViewType) => void;
  setSelectedProductId: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sort: string) => void;
  setCartCount: (count: number) => void;
  setLastOrderNumber: (orderNumber: string | null) => void;
}
