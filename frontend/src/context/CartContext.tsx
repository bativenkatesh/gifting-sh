import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, GiftOptions, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  giftOptions: GiftOptions;
  isCartOpen: boolean;
  addToCart: (product: Product, quantity?: number, customizations?: CartItem['customizations']) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  updateGiftOptions: (updates: Partial<GiftOptions>) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
  packagingCost: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_GIFT_OPTIONS: GiftOptions = {
  calligraphyNote: 'With warmest regards and deepest appreciation on this memorable milestone.',
  senderName: 'Lord & Lady Harrington',
  recipientName: 'The Montgomery Family',
  ribbonColor: 'antique-gold',
  waxSeal: 'gold-lotus',
  packagingPreference: 'Signature Ivory Linen Keepsake Box with Hand-Tied Silk Ribbon',
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('maison_lotus_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default initial sample item for rich luxury preview
    return [
      {
        id: 'init-1',
        productId: 'box-1',
        product: {
          id: 'box-1',
          name: 'The Royal Botanical',
          tagline: 'Organic Lavender • Tuscan Bergamot • Woven Linen',
          price: 185,
          category: 'Heirloom Boxes',
          occasion: 'Solace & Sanctuary',
          image: '/botanical_box.jpg',
          badge: 'Curator’s Choice',
          description: 'An immaculate sensory refuge assembled inside a hand-pressed cream linen presentation box.',
          provenance: 'Artisanal ateliers of Provence & Florence',
          contents: ['Wild Lavender & Bergamot Mist', 'Organic Beeswax Tapers', 'Florentine Olive Soap'],
        },
        quantity: 1,
        customizations: {
          ribbonColor: 'antique-gold',
          waxSeal: 'gold-lotus',
        },
      },
    ];
  });

  const [giftOptions, setGiftOptions] = useState<GiftOptions>(() => {
    try {
      const saved = localStorage.getItem('maison_lotus_gift_options');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_GIFT_OPTIONS;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('maison_lotus_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('maison_lotus_gift_options', JSON.stringify(giftOptions));
    } catch {
      // ignore
    }
  }, [giftOptions]);

  const addToCart = (product: Product, quantity = 1, customizations?: CartItem['customizations']) => {
    setItems((prev) => {
      // Check if exact same product with exact same customizations exists
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          JSON.stringify(item.customizations || {}) === JSON.stringify(customizations || {})
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        product,
        quantity,
        customizations,
      };

      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateGiftOptions = (updates: Partial<GiftOptions>) => {
    setGiftOptions((prev) => ({ ...prev, ...updates }));
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const packagingCost = 0; // Complimentary signature white-glove packaging
  const total = subtotal + packagingCost;

  return (
    <CartContext.Provider
      value={{
        items,
        giftOptions,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateGiftOptions,
        clearCart,
        openCart,
        closeCart,
        totalItems,
        subtotal,
        packagingCost,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
