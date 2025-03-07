import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PurchaseOrder } from '../../types';

interface PurchaseOrdersState {
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PurchaseOrdersState = {
  purchaseOrders: [],
  isLoading: false,
  error: null,
};

const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {
    setPurchaseOrders: (state, action: PayloadAction<PurchaseOrder[]>) => {
      state.purchaseOrders = action.payload;
    },
    addPurchaseOrder: (state, action: PayloadAction<PurchaseOrder>) => {
      state.purchaseOrders.push(action.payload);
    },
    updatePurchaseOrder: (state, action: PayloadAction<PurchaseOrder>) => {
      const index = state.purchaseOrders.findIndex(po => po.id === action.payload.id);
      if (index !== -1) {
        state.purchaseOrders[index] = action.payload;
      }
    },
    deletePurchaseOrder: (state, action: PayloadAction<string>) => {
      state.purchaseOrders = state.purchaseOrders.filter(po => po.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  setLoading,
  setError,
} = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;