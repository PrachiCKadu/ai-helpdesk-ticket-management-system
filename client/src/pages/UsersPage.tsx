import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ErrorAlert from "@/components/ErrorAlert";
import { Plus, Users as UsersIcon, TriangleAlert } from "lucide-react";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";

interface EditingUser {
  id: string;
  name: string;
  email: string;
}

interface DeletingUser {
  id: string;
  name: string;
}

type DialogState = { mode: "create" } | { mode: "edit"; user: EditingUser } | null;

export default function UsersPage() {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deletingUser, setDeletingUser] = useState<DeletingUser | null>(null);
  const queryClient = useQueryClient();

  const close = () => setDialog(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUser(null);
    },
  });

  return (
    <div className="animate-in-page">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 shadow-lg shadow-primary/20">
            <UsersIcon className="h-5 w-5 text-primary-foreground" />
          </div> */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage who has access to your workspace.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setDialog({ mode: "create" })}
          className="h-10 gap-1.5 rounded-xl bg-gradient-to-r from-primary to-chart-2 shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/60 shadow-sm backdrop-blur-xl">
        <CardContent className="p-0">
          <UsersTable
            onEdit={(user) => setDialog({ mode: "edit", user })}
            onDelete={(user) => setDeletingUser(user)}
          />
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) close(); }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {dialog?.mode === "edit" ? "Edit User" : "Create User"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.mode === "edit"
                ? "Update this person's account details."
                : "Add a new person to your workspace."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            key={dialog?.mode === "edit" ? dialog.user.id : "create"}
            user={dialog?.mode === "edit" ? dialog.user : undefined}
            onSuccess={close}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deletingUser !== null} onOpenChange={(open) => { if (!open) { setDeletingUser(null); deleteMutation.reset(); } }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10">
              <TriangleAlert className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold tracking-tight">
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deletingUser?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.isError && (
            <ErrorAlert message="Failed to delete user" />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
              className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}