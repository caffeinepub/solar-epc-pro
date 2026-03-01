import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Battery,
  ChevronRight,
  FolderOpen,
  MapPin,
  Plus,
  Search,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { ProjectStatus } from "../backend.d";
import type { Project } from "../backend.d";
import { useProjects } from "../hooks/useQueries";

const statusColors: Record<string, string> = {
  [ProjectStatus.draft]: "bg-muted/70 text-muted-foreground border-transparent",
  [ProjectStatus.quoted]: "bg-navy-light/15 text-navy border-navy-light/30",
  [ProjectStatus.approved]: "bg-solar/25 text-solar-dark border-solar/40",
  [ProjectStatus.inProgress]: "bg-orange-100 text-orange-700 border-orange-200",
  [ProjectStatus.completed]: "bg-green-100 text-green-700 border-green-200",
};

const statusLabels: Record<string, string> = {
  [ProjectStatus.draft]: "Draft",
  [ProjectStatus.quoted]: "Quoted",
  [ProjectStatus.approved]: "Approved",
  [ProjectStatus.inProgress]: "In Progress",
  [ProjectStatus.completed]: "Completed",
};

const installationLabels: Record<string, string> = {
  rccRooftop: "RCC Rooftop",
  sheetMetal: "Sheet Metal Roof",
  groundMount: "Ground Mount",
  other: "Elevated / Other",
};

const systemTypeColors: Record<string, string> = {
  onGrid: "text-green-600",
  offGrid: "text-solar-dark",
  hybrid: "text-navy-light",
};

function ProjectCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (id: bigint) => void;
}) {
  return (
    <Card className="hover:border-solar/50 transition-all cursor-pointer group shadow-blue-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate group-hover:text-navy transition-colors">
                {project.clientName}
              </h3>
              <Badge
                className={`text-xs flex-shrink-0 ${statusColors[project.status]}`}
              >
                {statusLabels[project.status]}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {installationLabels[project.installationType] ??
                  project.installationType}
              </span>
              <span
                className={`flex items-center gap-1 font-medium ${systemTypeColors[project.systemType] ?? ""}`}
              >
                <Zap className="h-3 w-3" />
                {project.systemType === "onGrid"
                  ? "On-Grid"
                  : project.systemType === "offGrid"
                    ? "Off-Grid"
                    : "Hybrid"}
              </span>
              <span className="flex items-center gap-1">
                <Battery className="h-3 w-3" />
                {project.systemSizeKW} kW
              </span>
              {project.batteryCapacityKWh > 0 && (
                <span className="text-muted-foreground">
                  {project.batteryCapacityKWh} kWh battery
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelect(project.id)}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-solar/20 text-muted-foreground hover:text-navy transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectsPage({
  onNewProject,
  onSelectProject,
}: {
  onNewProject: () => void;
  onSelectProject: (id: bigint) => void;
}) {
  const { data: projects, isLoading } = useProjects();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = projects?.filter((p) => {
    const matchesSearch = p.clientName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = Object.values(ProjectStatus).map((s) => ({
    status: s,
    count: projects?.filter((p) => p.status === s).length ?? 0,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {projects?.length ?? 0} total projects
          </p>
        </div>
        <Button onClick={onNewProject} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-navy text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All ({projects?.length ?? 0})
          </button>
          {statusCounts.map(({ status, count }) => (
            <button
              type="button"
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-navy text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {statusLabels[status]} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Projects list */}
      {isLoading ? (
        <div className="space-y-3">
          {["a", "b", "c"].map((k) => (
            <Card key={k}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No projects found</p>
          <p className="text-sm mt-1">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first project to get started"}
          </p>
          {!search && statusFilter === "all" && (
            <Button onClick={onNewProject} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id.toString()}
              project={project}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
