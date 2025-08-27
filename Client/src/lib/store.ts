import { configureStore } from '@reduxjs/toolkit'
import { mapSlice } from '../app/layout/map/mapSlice';
import { authSlice } from '../app/layout/auth/authSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        map: mapSlice.reducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;