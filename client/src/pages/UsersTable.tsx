import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Role } from "core/constants/role.ts";
import ErrorAlert from "@/components/ErrorAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, UserRoundX } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface UsersTableProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

export default function UsersTable({ onEdit, onDelete }: UsersTableProps) {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get<{ users: User[] }>("/api/users");
      return data.users;
    },
  });

  if (error) {
    return (
      <div className="p-5">
        <ErrorAlert message="Failed to fetch users" />
      </div>
    );
  }

  const isEmpty = !isLoading && (users?.length ?? 0) === 0;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </TableHead>
            <TableHead className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Role
            </TableHead>
            <TableHead className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Created
            </TableHead>
            <TableHead className="h-11 px-5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-border/40">
                <TableCell className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <Skeleton className="h-5 w-14 rounded-full" />
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : isEmpty ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="px-5 py-16">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                    <UserRoundX className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No users yet</p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Add your first teammate to get started.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users?.map((user) => (
              <TableRow
                key={user.id}
                className="border-border/40 transition-colors hover:bg-muted/40"
              >
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-xs font-semibold text-primary-foreground">
                      {initialsOf(user.name)}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="px-5 py-3">
                  {user.role === Role.admin ? (
                    <Badge className="rounded-full border-0 bg-gradient-to-r from-primary to-chart-2 font-normal text-primary-foreground">
                      {user.role}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="rounded-full border-border/60 bg-muted font-normal"
                    >
                      {user.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      aria-label={`Edit ${user.name}`}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {user.role !== Role.admin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(user)}
                        aria-label={`Delete ${user.name}`}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}