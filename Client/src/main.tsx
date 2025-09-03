import "./global.css"

import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router"
import App from "./app/App"
import Login from './app/layout/auth/Login'
import { RequireAdmin, RequireAuth, RequireNoAuth } from './app/layout/auth/Auth'
import DeckglMap from './app/layout/map/DeckglMap'
import { Provider } from "react-redux"
import { store } from "./lib/store"
import Admin from "./app/layout/admin/Admin"
import List from "./app/layout/list/List"

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route element={
          <RequireAuth>
            <App />
          </RequireAuth>
        }>
          <Route index element={
            <RequireAuth>
              <DeckglMap />
            </RequireAuth>} />
          <Route path='/list' element={
            <RequireAuth>
              <List />
            </RequireAuth>} />
          <Route path='/admin' element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          } />
        </Route>
        <Route path='/login' element={
          <RequireNoAuth>
            <Login />
          </RequireNoAuth>
        } />
      </Routes>
    </BrowserRouter>
  </Provider>
)
