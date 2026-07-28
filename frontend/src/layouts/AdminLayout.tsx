import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  return (
    <div className="admin-application">
      <AdminSidebar />

      <main className="admin-application__content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;