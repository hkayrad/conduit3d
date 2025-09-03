import { configureStore } from '@reduxjs/toolkit'
import { mapSlice } from '../app/layout/map/mapSlice';
import { authSlice } from '../app/layout/auth/authSlice';
import { adminSlice } from '../app/layout/admin/adminSlice';

const loadUserFromLocalStorage = () => {
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

const saveUserToLocalStorage = (state: any) => {
    try {
        const serializedState = JSON.stringify(state.auth.user);
        localStorage.setItem('userState', serializedState);
    } catch (e) {
        console.error("Error saving state to localStorage:", e);
    }
}

const preloadedUserState = loadUserFromLocalStorage();

export const store = configureStore({
    reducer: {
        admin: adminSlice.reducer,
        auth: authSlice.reducer,
        map: mapSlice.reducer,
    },
    preloadedState: preloadedUserState,
});

store.subscribe(() => {
    saveUserToLocalStorage(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;