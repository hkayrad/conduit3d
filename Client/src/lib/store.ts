import { configureStore } from '@reduxjs/toolkit'
import { adrBinaSlice } from '../app/layout/map/adrBina/adrBinaSlice';
import { trafoBinaSlice } from '../app/layout/map/trafoBina/trafoBinaSlice';
import { mapSlice } from '../app/layout/map/mapSlice';
import { userSlice } from '../app/layout/auth/authSlice';

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        map: mapSlice.reducer,
        adrBina: adrBinaSlice.reducer,
        trafoBina: trafoBinaSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;