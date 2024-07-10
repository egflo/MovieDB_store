// CartContext.tsx
import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import {Cart} from "../models/Cart";
import {fetchCart} from "../api/fetcher";
import {auth} from "../utils/firebase";

interface CartContextType {
    cartItems: Cart[];
    addItemToCart: (item: Cart) => void;
    removeItemFromCart: (itemId: number) => void;
    cartCount: number;
    loading: boolean;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<Cart[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchCart();
                setCartItems(data);
            } catch (error) {
                console.error('Failed to fetch cart', error);
            } finally {
                setLoading(false);
            }
        };

        const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchData();
            } else {
                setCartItems([]);
                setLoading(false);
            }
        });

        return () => unregisterAuthObserver();
    }, []);

    const addItemToCart = (item: Cart) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevItems.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                        : cartItem
                );
            }
            return [...prevItems, item];
        });
    };

    const removeItemFromCart = (itemId: number) => {
        setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== itemId));
    };

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ loading, cartItems, addItemToCart, removeItemFromCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
