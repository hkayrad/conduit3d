import { configureStore } from '@reduxjs/toolkit'
import { mapSlice } from '../app/layout/map/mapSlice';
import { authSlice } from '../app/layout/auth/authSlice';

const loadFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('userState');
        if (serializedState === null) return undefined;
        return {
            auth: {
                user: JSON.parse(serializedState)
            }
        };
    } catch (e) {
        console.error("Error loading state from localStorage:", e);
        return undefined;
    }
}

const saveToLocalStorage = (state: any) => {
    try {
        const serializedState = JSON.stringify(state.auth.user);
        localStorage.setItem('userState', serializedState);
    } catch (e) {
        console.error("Error saving state to localStorage:", e);
    }
}

const preloadedState = loadFromLocalStorage();

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        map: mapSlice.reducer,
    },
    preloadedState,
});

store.subscribe(() => {
    saveToLocalStorage(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;