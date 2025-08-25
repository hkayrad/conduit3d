import { configureStore } from '@reduxjs/toolkit'
import { adrBinaSlice } from '../app/layout/map/adrBina/adrBinaSlice';
import { trafoBinaSlice } from '../app/layout/map/trafoBina/trafoBinaSlice';

export const store = configureStore({
    reducer: {
        adrBina: adrBinaSlice.reducer,
        trafoBina: trafoBinaSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;