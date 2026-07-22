import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";

import MainLayout from "./layouts/MainLayout";
import Categories from "./pages/Categories";
import EditPublication from "./pages/EditPublication";
import Home from "./pages/Home";
import MyProducts from "./pages/MyProducts";
import ProductDetail from "./pages/ProductDetail";
import Publish from "./pages/Publish";
import PurchaseHistory from "./pages/PurchaseHistory";
import SalesHistory from "./pages/SalesHistory";
import Saved from "./pages/Saved";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/marketplace"
            element={<SearchResults />}
          />

          <Route
            path="/categorias"
            element={<Categories />}
          />

          <Route
            path="/producto/:id"
            element={<ProductDetail />}
          />

          <Route
            path="/guardados"
            element={<Saved />}
          />

          <Route
            path="/mis-publicaciones"
            element={<MyProducts />}
          />

          <Route
            path="/historial-compras"
            element={<PurchaseHistory />}
          />

          <Route
            path="/historial-ventas"
            element={<SalesHistory />}
          />

          <Route
            path="/configuracion"
            element={<Settings />}
          />

          <Route
            path="/publicar"
            element={<Publish />}
          />

          <Route
            path="/editar-publicacion/:id"
            element={<EditPublication />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;