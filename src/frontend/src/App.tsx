import { Toaster } from "@/components/ui/sonner";
import {
  Battery,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Menu,
  Package,
  Shield,
  Sun,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { AuditLogPage } from "./components/AuditLogPage";
import { BrandCatalog } from "./components/BrandCatalog";
import { Dashboard } from "./components/Dashboard";
import { InventoryPage } from "./components/InventoryPage";
import { ProjectWizard } from "./components/ProjectWizard";
import { ProjectsPage } from "./components/ProjectsPage";
import { QuotationsPage } from "./components/QuotationsPage";
import { SiteExecution } from "./components/SiteExecution";
import { UsersPage } from "./components/UsersPage";

type Page =
  | "dashboard"
  | "projects"
  | "wizard"
  | "inventory"
  | "brands"
  | "execution"
  | "users"
  | "audit"
  | "quotations";

const NAV_ITEMS: {
  id: Page;
  label: string;
  icon: React.ElementType;
  group?: string;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { id: "projects", label: "Projects", icon: FolderOpen, group: "main" },
  { id: "quotations", label: "Quotations", icon: FileText, group: "main" },
  { id: "inventory", label: "Inventory", icon: Package, group: "operations" },
  { id: "brands", label: "Brand Catalog", icon: Battery, group: "operations" },
  { id: "execution", label: "Site Execution", icon: Zap, group: "operations" },
  { id: "users", label: "Users", icon: Users, group: "admin" },
  { id: "audit", label: "Audit Log", icon: Shield, group: "admin" },
];

function Sidebar({
  page,
  onNavigate,
  collapsed,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  collapsed: boolean;
}) {
  const groups = [
    { id: "main", label: "Core" },
    { id: "operations", label: "Operations" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <aside
      className={`
        flex flex-col h-full bg-sidebar border-r border-sidebar-border
        transition-all duration-200 ease-in-out
        ${collapsed ? "w-14" : "w-56"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-sidebar-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sun className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground leading-tight truncate">
              Solar EPC Pro
            </p>
            <p className="text-xs text-muted-foreground truncate">
              v2.0 Platform
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {groups.map((group) => {
          const items = NAV_ITEMS.filter((n) => n.group === group.id);
          return (
            <div key={group.id}>
              {!collapsed && (
                <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5 px-2">
                {items.map((item) => {
                  const active = page === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`
                        w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium
                        transition-all duration-150
                        ${
                          active
                            ? "bg-sidebar-accent text-solar border-l-2 border-primary -ml-0.5 pl-2.5"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        className={`h-4 w-4 flex-shrink-0 ${active ? "text-solar" : "text-muted-foreground"}`}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-solar transition-colors"
            >
              Built with ♥ caffeine.ai
            </a>
          </p>
        </div>
      )}
    </aside>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [_selectedProjectId, setSelectedProjectId] = useState<bigint | null>(
    null,
  );

  const navigate = (p: string) => {
    setPage(p as Page);
    setMobileOpen(false);
  };

  const handleSelectProject = (id: bigint) => {
    setSelectedProjectId(id);
    setPage("wizard");
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} />;
      case "projects":
        return (
          <ProjectsPage
            onNewProject={() => {
              setSelectedProjectId(null);
              setPage("wizard");
            }}
            onSelectProject={handleSelectProject}
          />
        );
      case "wizard":
        return <ProjectWizard onComplete={() => setPage("projects")} />;
      case "inventory":
        return <InventoryPage />;
      case "brands":
        return <BrandCatalog />;
      case "execution":
        return <SiteExecution />;
      case "users":
        return <UsersPage />;
      case "audit":
        return <AuditLogPage />;
      case "quotations":
        return <QuotationsPage />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          page={page}
          onNavigate={(p) => setPage(p)}
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 w-full cursor-default"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileOpen(false);
            }}
            aria-label="Close menu"
          />
          <div className="relative z-10 h-full">
            <Sidebar page={page} onNavigate={navigate} collapsed={false} />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 z-20 text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="hidden md:block text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate capitalize">
              {page === "wizard"
                ? "New Project Wizard"
                : (NAV_ITEMS.find((n) => n.id === page)?.label ?? "Dashboard")}
            </h2>
          </div>

          {/* Solar EPC badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
            <Sun className="h-3.5 w-3.5 text-solar" />
            <span className="text-xs font-medium text-solar hidden sm:block">
              Solar EPC Pro
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>
      </div>

      <Toaster richColors />
    </div>
  );
}
