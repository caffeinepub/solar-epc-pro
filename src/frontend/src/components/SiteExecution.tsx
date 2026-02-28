import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Circle, MapPin, Zap } from "lucide-react";
import { ProjectStatus } from "../backend.d";
import { useProjects } from "../hooks/useQueries";

const EXECUTION_CHECKLIST = [
  { id: "site-survey", label: "Site Survey Completed" },
  { id: "permits", label: "Permits & Approvals Obtained" },
  { id: "material-received", label: "Material Received & Verified" },
  { id: "structure-install", label: "Mounting Structure Installed" },
  { id: "panel-install", label: "Solar Panels Installed" },
  { id: "wiring", label: "DC & AC Wiring Completed" },
  { id: "inverter-install", label: "Inverter Installed & Configured" },
  { id: "earthing", label: "Earthing & Lightning Protection Done" },
  { id: "testing", label: "System Testing & Commissioning" },
  { id: "net-metering", label: "Net Meter Application Submitted" },
  { id: "handover", label: "Customer Handover & Training" },
  { id: "documentation", label: "Documentation & Photos Submitted" },
];

const installationLabels: Record<string, string> = {
  rccRooftop: "RCC Rooftop",
  sheetMetal: "Sheet Metal Roof",
  groundMount: "Ground Mount",
  other: "Elevated / Other",
};

const systemTypeLabels: Record<string, string> = {
  onGrid: "On-Grid",
  offGrid: "Off-Grid",
  hybrid: "Hybrid",
};

function ProjectExecutionCard({
  project,
}: {
  project: {
    id: bigint;
    clientName: string;
    status: string;
    installationType: string;
    systemType: string;
    systemSizeKW: number;
  };
}) {
  // Simulate checklist progress based on status
  const completedCount =
    project.status === ProjectStatus.inProgress
      ? Math.floor(Math.random() * 7) + 3
      : project.status === ProjectStatus.completed
        ? EXECUTION_CHECKLIST.length
        : project.status === ProjectStatus.approved
          ? 2
          : 1;

  const progress = (completedCount / EXECUTION_CHECKLIST.length) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{project.clientName}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {installationLabels[project.installationType] ??
                  project.installationType}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {systemTypeLabels[project.systemType] ?? project.systemType}
              </span>
              <span>{project.systemSizeKW} kWp</span>
            </div>
          </div>
          <Badge
            className={
              project.status === ProjectStatus.completed
                ? "bg-green-500/20 text-green-400"
                : project.status === ProjectStatus.inProgress
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-amber-500/20 text-amber-400"
            }
          >
            {project.status === ProjectStatus.inProgress
              ? "In Progress"
              : project.status === ProjectStatus.completed
                ? "Completed"
                : "Approved"}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Execution Progress</span>
            <span>
              {completedCount}/{EXECUTION_CHECKLIST.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {EXECUTION_CHECKLIST.map((item, idx) => {
            const done = idx < completedCount;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                  done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 flex-shrink-0" />
                )}
                {item.label}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function SiteExecution() {
  const { data: projects, isLoading } = useProjects();

  const activeProjects = projects?.filter(
    (p) =>
      p.status === ProjectStatus.inProgress ||
      p.status === ProjectStatus.approved ||
      p.status === ProjectStatus.completed,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display">Site Execution</h1>
        <p className="text-sm text-muted-foreground">
          {activeProjects?.length ?? 0} projects in execution pipeline
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {["a", "b"].map((k) => (
            <Card key={k}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-2 w-full mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  {["x", "y", "z", "w"].map((j) => (
                    <Skeleton key={j} className="h-7 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !activeProjects || activeProjects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No active projects</p>
          <p className="text-sm mt-1">
            Projects with Approved, In Progress, or Completed status will appear
            here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeProjects.map((project) => (
            <ProjectExecutionCard
              key={project.id.toString()}
              project={project}
            />
          ))}
        </div>
      )}
    </div>
  );
}
