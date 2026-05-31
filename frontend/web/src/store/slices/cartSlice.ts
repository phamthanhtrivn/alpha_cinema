/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { productService } from "@/services/product.service";

export interface CartItem {
    productId: string;
    name: string;
    unitPrice: number;
    pictureUrl: string;
    quantity: number;
    stockQty: number | null;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    loading: boolean;
}

const initialState: CartState = {
    items: [],
    isOpen: false,
    loading: false,
};

// Async Thunks để tương tác với Redis Backend
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { rejectWithValue }) => {
        try {
            const response = await productService.getCart();
            if (response.success) {
                return response.data as CartItem[];
            }
            return rejectWithValue(response.message || "Không thể tải giỏ hàng");
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi tải giỏ hàng từ máy chủ");
        }
    }
);

export const addToCartThunk = createAsyncThunk(
    "cart/addToCart",
    async (
        { productId, quantity }: { productId: string; quantity: number },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const response = await productService.addToCart(productId, quantity);
            if (response.success) {
                dispatch(fetchCart());
                return { productId, quantity };
            }
            return rejectWithValue(response.message || "Thêm vào giỏ hàng thất bại");
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi kết nối máy chủ");
        }
    }
);

export const updateCartItemThunk = createAsyncThunk(
    "cart/updateCartItem",
    async (
        { productId, quantity }: { productId: string; quantity: number },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const response = await productService.updateCartItem(productId, quantity);
            if (response.success) {
                dispatch(fetchCart());
                return { productId, quantity };
            }
            return rejectWithValue(response.message || "Cập nhật giỏ hàng thất bại");
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi cập nhật giỏ hàng");
        }
    }
);

export const removeCartItemThunk = createAsyncThunk(
    "cart/removeCartItem",
    async (productId: string, { dispatch, rejectWithValue }) => {
        try {
            const response = await productService.removeCartItem(productId);
            if (response.success) {
                dispatch(fetchCart());
                return productId;
            }
            return rejectWithValue(response.message || "Xóa sản phẩm thất bại");
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi xóa sản phẩm");
        }
    }
);

export const clearCartThunk = createAsyncThunk(
    "cart/clearCart",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await productService.clearCart();
            if (response.success) {
                dispatch(fetchCart());
                return;
            }
            return rejectWithValue(response.message || "Xóa toàn bộ giỏ hàng thất bại");
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi xóa sạch giỏ hàng");
        }
    }
);

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        setCartOpen: (state, action: PayloadAction<boolean>) => {
            state.isOpen = action.payload;
        },
        resetCartLocal: (state) => {
            state.items = [];
            state.isOpen = false;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCart.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { toggleCart, setCartOpen, resetCartLocal } = cartSlice.actions;

/* Selectors */
export const selectCartItems = (state: any) => state.cart.items;
export const selectCartIsOpen = (state: any) => state.cart.isOpen;
export const selectCartLoading = (state: any) => state.cart.loading;
export const selectCartTotalQuantity = (state: any) =>
    state.cart.items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
export const selectCartTotalPrice = (state: any) =>
    state.cart.items.reduce((total: number, item: CartItem) => total + item.quantity * item.unitPrice, 0);

export default cartSlice.reducer;
