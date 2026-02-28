import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole, useCreateUser, useUsers } from "../hooks/useQueries";

const roleColors: Record<string, string> = {
  [UserRole.owner]: "bg-amber-500/20 text-amber-400",
  [UserRole.admin]: "bg-blue-500/20 text-blue-400",
  [UserRole.procurement]: "bg-purple-500/20 text-purple-400",
  [UserRole.siteEngineer]: "bg-green-500/20 text-green-400",
};

const roleLabels: Record<string, string> = {
  [UserRole.owner]: "Owner",
  [UserRole.admin]: "Admin",
  [UserRole.procurement]: "Procurement",
  [UserRole.siteEngineer]: "Site Engineer",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: UserRole.admin,
    isActive: true,
  });

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    try {
      await createUser.mutateAsync(form);
      toast.success("User created");
      setDialogOpen(false);
      setForm({ name: "", email: "", role: UserRole.admin, isActive: true });
    } catch {
      toast.error("Failed to create user");
    }
  };

  const roleCount = Object.values(UserRole).map((r) => ({
    role: r,
    count: users?.filter((u) => u.role === r).length ?? 0,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Users</h1>
          <p className="text-sm text-muted-foreground">
            {users?.length ?? 0} users ·{" "}
            {users?.filter((u) => u.isActive).length ?? 0} active
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Full Name</Label>
                <Input
                  placeholder="e.g. Rajesh Kumar"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="e.g. rajesh@solarepc.in"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, role: v as UserRole }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([v, label]) => (
                      <SelectItem key={v} value={v}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                />
              </div>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={createUser.isPending}
                className="w-full"
              >
                {createUser.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role breakdown */}
      <div className="flex flex-wrap gap-2">
        {roleCount.map(({ role, count }) => (
          <div
            key={role}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary border border-border text-sm"
          >
            <Badge className={`text-xs ${roleColors[role]}`}>
              {roleLabels[role]}
            </Badge>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0">
              {["a", "b", "c"].map((k) => (
                <div
                  key={k}
                  className="flex gap-4 p-4 border-b border-border items-center"
                >
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No users yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id.toString()}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/20 text-solar text-xs font-bold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${roleColors[user.role]}`}>
                        {roleLabels[user.role] ?? user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.isActive
                            ? "bg-green-500/20 text-green-400 text-xs"
                            : "bg-muted text-muted-foreground text-xs"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
