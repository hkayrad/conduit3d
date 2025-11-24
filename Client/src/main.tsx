import "./global.scss";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./app/App";
import Login from "./app/layout/auth/Login";
import {
  RequireAdmin,
  RequireAuth,
  RequireNoAuth,
} from "./app/layout/auth/Auth";
import Map from "./app/layout/map/Map";
import { Provider } from "react-redux";
import { store } from "./lib/store";
import Admin from "./app/layout/admin/Admin";
import List from "./app/layout/list/List";
import NotFound from "./notFound";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          }
        >
          <Route
            path="/"
            element={
              <RequireAuth>
                <Map />
              </RequireAuth>
            }
          >
            <Route
              path="/list"
              element={
                <RequireAuth>
                  <List />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <Admin />
                </RequireAdmin>
              }
            />
          </Route>
        </Route>
        <Route
          path="/login"
          element={
            <RequireNoAuth>
              <Login />
            </RequireNoAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </Provider>,
);
