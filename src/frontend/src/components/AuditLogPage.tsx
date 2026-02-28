import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, Shield } from "lucide-react";
import { useAuditLog } from "../hooks/useQueries";

export function AuditLogPage() {
  const { data: auditLog, isLoading } = useAuditLog();

  function formatTimestamp(ts: bigint): string {
    const ms = Number(ts) / 1_000_000;
    if (ms < 1_000_000) return "N/A";
    const date = new Date(ms);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="h-5 w-5 text-solar" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            {auditLog?.length ?? 0} recorded actions
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0">
              {["a", "b", "c", "d", "e"].map((k) => (
                <div key={k} className="flex gap-4 p-3 border-b border-border">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : !auditLog || auditLog.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No audit entries yet</p>
              <p className="text-sm mt-1">Actions will be logged here</p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">User ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((entry) => (
                    <TableRow key={entry.id.toString()}>
                      <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {formatTimestamp(entry.timestamp)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {entry.action}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.targetEntity}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {entry.details}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono text-muted-foreground">
                        {entry.performedBy.toString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
