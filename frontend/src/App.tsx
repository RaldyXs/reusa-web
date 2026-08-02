import type {
  ComponentType,
  ReactNode,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import AdminLayout from "./layouts/AdminLayout.tsx";
import MainLayout from "./layouts/MainLayout";

import Categories from "./pages/Categories";
import EditPublication from "./pages/EditPublication";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import MyProducts from "./pages/MyProducts";
import ProductDetail from "./pages/ProductDetail";
import Publish from "./pages/Publish";
import PurchaseHistory from "./pages/PurchaseHistory";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import SalesHistory from "./pages/SalesHistory";
import Saved from "./pages/Saved";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/Settings";

import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminOffers from "./pages/admin/AdminOffers.tsx";
import AdminPublications from "./pages/admin/AdminPublications.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";

const MainLayoutWithChildren =
  MainLayout as ComponentType<{
    children?: ReactNode;
  }>;

interface ConLayoutProps {
  children: ReactNode;
}

function ConLayout({
  children,
}: ConLayoutProps) {
  return (
    <MainLayoutWithChildren>
      {children}
    </MainLayoutWithChildren>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/registro"
            element={<Register />}
          />

          <Route
            path="/recuperar-contrasena"
            element={<ForgotPassword />}
          />

          <Route
            path="/restablecer-contrasena"
            element={<ResetPassword />}
          />

          <Route
            path="/"
            element={
              <ConLayout>
                <Home />
              </ConLayout>
            }
          />

          <Route
            path="/marketplace"
            element={
              <ConLayout>
                <SearchResults />
              </ConLayout>
            }
          />

          <Route
            path="/categorias"
            element={
              <ConLayout>
                <Categories />
              </ConLayout>
            }
          />

          <Route
            path="/producto/:id"
            element={
              <ConLayout>
                <ProductDetail />
              </ConLayout>
            }
          />

          <Route
            path="/guardados"
            element={
              <ProtectedRoute>
                <ConLayout>
                  <Saved />
                </ConLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mensajes"
            element={
              <ProtectedRoute>
                <ConLayout>
                  <Messages />
                </ConLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mis-publicaciones"
            element={
              <ProtectedRoute>
                <ConLayout>
                  <MyProducts />
                </ConLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/historial-compras"
            element={
              <ProtectedRoute>
                <ConLayout>
                  <PurchaseHistory />
                </ConLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/historial-ventas"
            element={
              <ProtectedRoute>
                <ConLayout>
                  <SalesHistory />
                </ConLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion"
            element={
              <ProtectedRoute>
                <ConLayout>
                  <Settings />
                </ConLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/publicar"
            element={
              <ProtectedRoute
                rolesPermitidos={[
                  "usuario",
                  "administrador",
                ]}
              >
                <ConLayout>
                  <Publish />
                </ConLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/editar-publicacion/:id"
            element={
              <ProtectedRoute
                rolesPermitidos={[
                  "usuario",
                  "administrador",
                ]}
              >
                <ConLayout>
                  <EditPublication />
                </ConLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                rolesPermitidos={[
                  "administrador",
                ]}
              >
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="usuarios"
              element={<AdminUsers />}
            />

            <Route
              path="publicaciones"
              element={<AdminPublications />}
            />

            <Route
              path="ofertas"
              element={<AdminOffers />}
            />

            <Route
              path="categorias"
              element={<AdminCategories />}
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;