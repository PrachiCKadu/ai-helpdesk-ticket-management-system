import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "core/schemas/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";
import { User, Mail, Lock, Loader2 } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface UserFormProps {
  user?: UserData;
  onSuccess: () => void;
}

export default function UserForm({ user, onSuccess }: UserFormProps) {
  const isEdit = !!user;
  const queryClient = useQueryClient();

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateUserInput | UpdateUserInput) => {
      if (isEdit) {
        const { data } = await axios.put(`/api/users/${user.id}`, payload);
        return data.user;
      }
      const { data } = await axios.post("/api/users", payload);
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset();
      mutation.reset();
      onSuccess();
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4 pt-2"
      autoComplete="off"
    >
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-medium text-foreground/80">
          Name
        </Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="name"
            placeholder="Full name"
            aria-invalid={!!form.formState.errors.name}
            className="h-11 rounded-xl border-border/70 bg-transparent pl-10 text-sm shadow-none transition-colors focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
            {...form.register("name")}
          />
        </div>
        {form.formState.errors.name && (
          <ErrorMessage message={form.formState.errors.name.message} />
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium text-foreground/80">
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            autoComplete="off"
            aria-invalid={!!form.formState.errors.email}
            className="h-11 rounded-xl border-border/70 bg-transparent pl-10 text-sm shadow-none transition-colors focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email && (
          <ErrorMessage message={form.formState.errors.email.message} />
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-medium text-foreground/80">
          Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="password"
            type="password"
            placeholder={isEdit ? "Leave blank to keep current" : "Minimum 8 characters"}
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            className="h-11 rounded-xl border-border/70 bg-transparent pl-10 text-sm shadow-none transition-colors focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
            {...form.register("password")}
          />
        </div>
        {form.formState.errors.password && (
          <ErrorMessage message={form.formState.errors.password.message} />
        )}
      </div>

      {mutation.error && (
        <ErrorAlert
          error={mutation.error}
          fallback={`Failed to ${isEdit ? "update" : "create"} user`}
        />
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-10 gap-1.5 rounded-xl bg-gradient-to-r from-primary to-chart-2 px-5 shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit
            ? mutation.isPending ? "Saving..." : "Save Changes"
            : mutation.isPending ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}