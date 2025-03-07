import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import suppliersReducer from './slices/suppliersSlice';
import purchaseOrdersReducer from './slices/purchaseOrdersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    suppliers: suppliersReducer,
    purchaseOrders: purchaseOrdersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;