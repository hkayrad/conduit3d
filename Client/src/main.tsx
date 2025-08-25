import "./global.css"

import { createRoot } from 'react-dom/client'
import { store } from "./lib/store"
import { Provider } from "react-redux"
import { BrowserRouter, Route, Routes } from "react-router"
import App from "./app/App"
import Login from './app/layout/auth/Login'
import { RequireAuth, RequireNoAuth } from './app/layout/auth/Auth'
import DeckglMap from './app/layout/map/DeckglMap'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route element={
          <RequireAuth>
            <App />
          </RequireAuth>
        }>
          <Route index element={<DeckglMap />} />
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
