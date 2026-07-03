import { createContext, useContext, useState, useEffect, useRef } from 'react';

import { getCart, postToCart } from '../services/api';

const CartContext = createContext();

const defaultCartState = {
  items: [],
  count: 0,
  lineCount: 0,
  url: '/cart',
};

export function CartProvider({ children }) {
  const cartRef = useRef( null );
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const sCart = localStorage.getItem('digicomp-cart');
        if (sCart) {
          return JSON.parse(sCart);
        }
      } catch (error) {
        console.error("Failed to parse cart from local storage", error);
      }
    }
    return defaultCartState;
  });

  useEffect(() => {
    setCart( getCart() )
  }, []);

  useEffect(() => {
    // Objects must be stringified before saving to localStorage
    localStorage.setItem('digicomp-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (id, qty = 1) => {
    setCart(prevCart => {
      // Ensure we have a valid items array to work with
      const currentItems = prevCart.items || [];
      const existingItemIndex = currentItems.findIndex(item => item.id === id);

      let newItems = [...currentItems];

      if (existingItemIndex >= 0) {
        // Item exists, update its quantity
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          qty: newItems[existingItemIndex].qty + qty
        };
      } else {
        // New item, add it to the array
        newItems.push({ id, qty });
      }

      // Recalculate totals
      const newCount = newItems.reduce((total, item) => total + item.qty, 0);
      const newLineCount = newItems.length;

      return {
        items: newItems,
        count: newCount,
        lineCount: newLineCount,
        url: '/cart',
      };
    });
    return await postToCart( id, qty )
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, cartRef }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  // useCart must be used within a CartProvider
  return useContext(CartContext);
}
