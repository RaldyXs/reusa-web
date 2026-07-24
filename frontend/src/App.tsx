import type { ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AdminDashboard from "./pages/AdminDashboard";
import Categories from "./pages/Categories";
import EditPublication from "./pages/EditPublication";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyProducts from "./pages/MyProducts";
import ProductDetail from "./pages/ProductDetail";
import Publish from "./pages/Publish";
import PurchaseHistory from "./pages/PurchaseHistory";
import SalesHistory from "./pages/SalesHistory";
import Saved from "./pages/Saved";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/Settings";

interface ConLayoutProps {
  children: ReactNode;
}

function ConLayout({
  children,
}: ConLayoutProps) {
  return <MainLayout>{children}</MainLayout>;
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
                  "vendedor",
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
                  "vendedor",
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
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;