import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="application">
      <Topbar />

      <div className="application__body">
        <Sidebar />

        <main className="application__content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;