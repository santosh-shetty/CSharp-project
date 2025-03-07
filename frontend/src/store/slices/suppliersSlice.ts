import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Supplier } from '../../types';

interface SuppliersState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SuppliersState = {
  suppliers: [],
  isLoading: false,
  error: null,
};

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    setSuppliers: (state, action: PayloadAction<Supplier[]>) => {
      state.suppliers = action.payload;
    },
    addSupplier: (state, action: PayloadAction<Supplier>) => {
      state.suppliers.push(action.payload);
    },
    updateSupplier: (state, action: PayloadAction<Supplier>) => {
      const index = state.suppliers.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.suppliers[index] = action.payload;
      }
    },
    deleteSupplier: (state, action: PayloadAction<string>) => {
      state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
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
  setSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  setLoading,
  setError,
} = suppliersSlice.actions;

export default suppliersSlice.reducer;