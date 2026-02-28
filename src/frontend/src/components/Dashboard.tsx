import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  FileText,
  FolderOpen,
  Package,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ProjectStatus } from "../backend.d";
import {
  useAuditLog,
  useInventory,
  useProjects,
  useQuotations,
} from "../hooks/useQueries";

const statusColors: Record<string, string> = {
  [ProjectStatus.draft]: "bg-muted text-muted-foreground",
  [ProjectStatus.quoted]: "bg-blue-500/20 text-blue-400",
  [ProjectStatus.approved]: "bg-amber-500/20 text-amber-400",
  [ProjectStatus.inProgress]: "bg-orange-500/20 text-orange-400",
  [ProjectStatus.completed]: "bg-green-500/20 text-green-400",
};

const statusLabels: Record<string, string> = {
  [ProjectStatus.draft]: "Draft",
  [ProjectStatus.quoted]: "Quoted",
  [ProjectStatus.approved]: "Approved",
  [ProjectStatus.inProgress]: "In Progress",
  [ProjectStatus.completed]: "Completed",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden ${accent ? "solar-border border" : ""}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {label}
            </p>
            <p
              className={`text-3xl font-bold font-display ${accent ? "text-solar" : "text-foreground"}`}
            >
              {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div
            className={`p-2.5 rounded-lg ${accent ? "bg-primary/20" : "bg-secondary"}`}
          >
            <Icon
              className={`h-5 w-5 ${accent ? "text-solar" : "text-muted-foreground"}`}
            />
          </div>
        </div>
        {accent && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard({
  onNavigate,
}: { onNavigate: (page: string) => void }) {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const { data: quotations } = useQuotations();
  const { data: auditLog } = useAuditLog();

  const totalProjects = projects?.length ?? 0;
  const pendingQuotations =
    quotations?.filter((q) => q.status === "draft" || q.status === "sent")
      .length ?? 0;
  const lowStockItems =
    inventory?.filter((i) => i.quantityOnHand < i.minStock) ?? [];
  const inventoryValue =
    inventory?.reduce((sum, item) => sum + Number(item.quantityOnHand), 0) ?? 0;

  const statusBreakdown = Object.values(ProjectStatus).map((status) => ({
    status,
    count: projects?.filter((p) => p.status === status).length ?? 0,
  }));

  const recentAudit = auditLog?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Sun className="h-6 w-6 text-solar" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display">
            Operations Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Solar EPC Pro — Command Center
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {projectsLoading ? (
          ["a", "b", "c", "d"].map((k) => (
            <Card key={k}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              icon={FolderOpen}
              label="Total Projects"
              value={totalProjects}
              sub={`${projects?.filter((p) => p.status === ProjectStatus.inProgress).length ?? 0} active`}
              accent
            />
            <StatCard
              icon={Package}
              label="Inventory Items"
              value={inventoryValue}
              sub="Total stock units"
            />
            <StatCard
              icon={FileText}
              label="Pending Quotations"
              value={pendingQuotations}
              sub="Awaiting action"
            />
            <StatCard
              icon={AlertTriangle}
              label="Low Stock Alerts"
              value={lowStockItems.length}
              sub="Items below minimum"
            />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Project Status Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-solar" />
              Project Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-2">
                {["a", "b", "c", "d", "e"].map((k) => (
                  <Skeleton key={k} className="h-8 w-full" />
                ))}
              </div>
            ) : totalProjects === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {statusBreakdown.map(({ status, count }) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${statusColors[status]}`}>
                        {statusLabels[status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: totalProjects
                              ? `${(count / totalProjects) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-4 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="space-y-2">
                {["a", "b", "c"].map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All items well-stocked</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockItems.slice(0, 6).map((item) => (
                  <div
                    key={item.id.toString()}
                    className="flex items-center justify-between p-2 rounded-md bg-destructive/10 border border-destructive/20"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">
                        {item.quantityOnHand.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        min: {item.minStock.toString()} {item.unit}
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 6 && (
                  <button
                    type="button"
                    onClick={() => onNavigate("inventory")}
                    className="w-full text-xs text-solar hover:underline text-center pt-1"
                  >
                    View all {lowStockItems.length} alerts →
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-solar" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAudit.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAudit.map((entry) => (
                <div
                  key={entry.id.toString()}
                  className="flex items-start gap-3 p-2.5 rounded-md hover:bg-secondary/30"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-solar mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.action}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.details}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(
                      Number(entry.timestamp) / 1_000_000,
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "New Project", icon: FolderOpen, page: "projects" },
          { label: "Check Inventory", icon: Package, page: "inventory" },
          { label: "View Quotations", icon: FileText, page: "quotations" },
          { label: "Site Execution", icon: Zap, page: "execution" },
        ].map(({ label, icon: Icon, page }) => (
          <button
            type="button"
            key={page}
            onClick={() => onNavigate(page)}
            className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
          >
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-solar transition-colors" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
