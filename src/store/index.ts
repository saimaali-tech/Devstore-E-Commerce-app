import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState } from '@/types';

const CART_ID_KEY = 'devstore-cart-id';

function getOrCreateCartId(): string {
  if (typeof window !== 'undefined') {
    let cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) {
      cartId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(CART_ID_KEY, cartId);
    }
    return cartId;
  }
  return '';
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      currentView: 'home',
      selectedProductId: null,
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'featured',
      cartId: '',
      cartCount: 0,
      lastOrderNumber: null,

      setCurrentView: (view) => set({ currentView: view }),
      setSelectedProductId: (id) => set({ selectedProductId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setCartCount: (count) => set({ cartCount: count }),
      setLastOrderNumber: (orderNumber) => set({ lastOrderNumber: orderNumber }),
    }),
    {
      name: 'devstore-store',
      partialize: (state) => ({
        cartId: state.cartId || getOrCreateCartId(),
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        sortBy: state.sortBy,
        lastOrderNumber: state.lastOrderNumber,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.cartId) {
          state.cartId = getOrCreateCartId();
        }
      },
    }
  )
);

// Initialize cart ID on the client side
if (typeof window !== 'undefined') {
  const currentCartId = useStore.getState().cartId;
  if (!currentCartId) {
    useStore.setState({ cartId: getOrCreateCartId() });
  }
}
