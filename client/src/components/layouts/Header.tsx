import { useLocation } from "react-router";
import {
  Bell,
  Search,
  CalendarDays,
  LayoutDashboard,
  Ticket,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface HeaderProps {
  collapsed: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const greetings = [
  "Everything is running smoothly.",
  "AI agents are monitoring new tickets.",
  "Customer support analytics are up to date.",
  "Welcome back to your workspace.",
];

const pageMeta: Record<string, { title: string; icon: typeof LayoutDashboard }> = {
  "/": { title: "Dashboard", icon: LayoutDashboard },
  "/tickets": { title: "Tickets", icon: Ticket },
  "/users": { title: "Users", icon: Users },
};

export default function Header({ collapsed }: HeaderProps) {
  const location = useLocation();
  const queryClient = useQueryClient();

  const subtitle = greetings[new Date().getDate() % greetings.length];

  const { title: pageTitle, icon: PageIcon } =
    pageMeta[location.pathname] ?? { title: "Helpdesk", icon: LayoutDashboard };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axios.get<Notification[]>("/api/notifications");
      return data;
    },
    refetchInterval: 30000, // poll every 30s so the badge stays fresh
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.patch(`/api/notifications/${id}/read`);
    },
    onMutate: async (id: number) => {
      // optimistic update so the UI feels instant
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);

      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axios.patch("/api/notifications/read-all");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);

      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.map((n) => ({ ...n, isRead: true }))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div
        className={`flex h-20 items-center justify-between transition-all duration-300 ${
          collapsed ? "px-10" : "px-8"
        }`}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 shadow-lg shadow-primary/20">
            <PageIcon className="h-5 w-5 text-primary-foreground" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="group relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />

            <Input
              placeholder="Search tickets, users..."
              className="h-11 w-72 rounded-xl border-border/60 bg-background/60 pl-10 pr-14 text-sm shadow-none transition-colors focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
            />

            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          {/* Date */}
          <div className="hidden h-11 items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 md:flex">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{today}</span>
          </div>

          {/* Notification */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/60 transition hover:border-primary/40 hover:bg-accent">
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-96 p-0">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-xs text-muted-foreground">
                    Recent activity
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    Loading...
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() =>
                        !n.isRead && markAsReadMutation.mutate(n.id)
                      }
                      className={`block w-full border-b p-4 text-left transition hover:bg-muted/40 ${
                        !n.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{n.title}</p>
                        {!n.isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {n.message}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}